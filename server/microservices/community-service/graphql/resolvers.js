import CommunityPost from '../models/CommunityPost.js';
import HelpRequest from '../models/HelpRequest.js';
import User from '../models/User.js'; // Direct DB access
import BusinessProfile from '../models/BussinessProfiles.js';
import Product from '../models/Product.js';
import Review from '../models/Review.js';
import { getSummary } from './geminiResolver.js';
import { aiAgentLogic } from './geminiResolver.js';
import fs from 'fs'
import path from 'path';
import getSentiment from './sentimentalAnalysis.js';
// Helper function to check if the user role is allowed
const checkUserRole = async (userId, allowedRoles) => {
  try {

    const user = await User.findById(userId);
    console.log(userId)
    if (!user) {
      return false
    }

    // Check if the user's role is included in allowedRoles
    return allowedRoles.includes(user.role);
  } catch (error) {
    console.error('Error in checkUserRole:', error);
    return false; // Return false if there's an error
  }
};
const wrapMutation = (fn, name) => async (...args) => {
  console.log(`Running mutation: ${name}`);
  try {
    return await fn(...args);
  } catch (err) {
    console.error(`Error in mutation '${name}':`, err);
    throw new Error(err.message || 'Something went wrong');
  }
};

const resolvers = {
  Query: {
    getCommunityPosts: wrapMutation(async () => {
      return await CommunityPost.find().populate('author').sort({ createdAt: -1 });
    }, 'getCommunityPosts'),
    getHelpRequests: wrapMutation(async () => {
      return await HelpRequest.find().populate('author volunteers');
    }, 'getHelpRequests'),

    getBusinsessByUserId: wrapMutation(async (_, { userId }) => {
      try {
        const user = await User.findById(userId);
        if (!user) {
          throw new Error("User not found");
        }
        const businesses = await BusinessProfile.find({ author: userId })
          .populate('products')
          .populate({
            path: 'reviews',
            populate: {
              path: 'user',
              model: 'User',
              select: 'username email'
            }
          });
        return businesses;
      } catch (error) {
        console.error("Error fetching businesses:", error);
        throw new Error("Failed to fetch businesses");
      }
    }, 'getBusinsessByUserId'),
    getBusinessById: wrapMutation(async (_, { id }) => {
      const businesses = await BusinessProfile.findById(id)
      .populate('products') 
      .populate({
        path: 'reviews',  
        populate: {
          path: 'user',    
          model: 'User',   
          select: 'username email' 
        }
      });
      return businesses
    }, 'getBusinessById'),

    getAllBusinesses: wrapMutation(async () => {

      const businesses = await BusinessProfile.find()
      .populate('products') 
      .populate({
        path: 'reviews',  
        populate: {
          path: 'user', 
          model: 'User',  
          select: 'username email' 
        }
      });
      return await BusinessProfile.find().populate('products reviews')
    }, 'getAllBusinesses'),
    getDiscussionById: wrapMutation(async (_, { postId }) => {
      return await CommunityPost.findById(postId).populate('author')
    }, 'getDiscussionById'),

    communityAIQuery: wrapMutation(async (_, { input, userId }) => {
      try {
        const response = await aiAgentLogic(input, userId);
        return {
          text: response.text,
          suggestedQuestions: response.suggestedQuestions,
          retrievedPosts: response.retrievedPosts.map(post => ({
            id: post.metadata.postId,
            author: post.metadata.author,
            title: post.metadata.title,
            content: post.pageContent,
            category: post.metadata.category,
            aiSummary: post.metadata.aiSummary,
            createdAt: post.metadata.createdAt,
          })),
        };
      } catch (error) {
        console.error("Error in AI Query:", error);
        throw new Error("Failed to process AI query.");
      }
    }, 'communityAIQuery'),
  },

  Mutation: {
    createCommunityPost: wrapMutation(async (_, { author, title, content, category }) => {
      const hasPermission = await checkUserRole(author, ['resident', 'business_owner', 'community_organizer']);
      if (!hasPermission) throw new Error('Insufficient permissions');
      console.log(content.length)
      let aiSummary = await getSummary(content);
      const newPost = new CommunityPost({ author, title, content, category, aiSummary });
      return await newPost.save();
    }, 'createCommunityPost'),

    createHelpRequest: wrapMutation(async (_, { author, description, location }) => {
      const hasPermission = await checkUserRole(author, ['resident', 'business_owner', 'community_organizer']);
      if (!hasPermission) throw new Error('Insufficient permissions');

      const newRequest = new HelpRequest({
        author,
        description,
        location,
        isResolved: false,
        volunteers: [],
      });
      await newRequest.save();
      return true;
    }, 'createHelpRequest'),

    markHelpRequestResolved: wrapMutation(async (_, { id }) => {
      console.log(id)
      const helpRequest = await HelpRequest.findById(id);
      console.log(helpRequest?.isResolved)
      if (!helpRequest) throw new Error('Help request not found!');

      helpRequest.isResolved = !helpRequest.isResolved
      helpRequest.save()
      return true;
    }, 'markHelpRequestResolved'),

    addVolunteerToHelpRequest: wrapMutation(async (_, { id, volunteerId }) => {
      // Find the help request by its ID
      const helpRequest = await HelpRequest.findById(id);
      if (!helpRequest) throw new Error('Help request not found!');

      // Find the volunteer by their ID and check if their role is 'community_organizer'
      const volunteer = await User.findById(volunteerId); // Assuming 'User' is the collection storing volunteer info
      if (!volunteer) throw new Error('Volunteer not found!');

      console.log("Role and Id ", volunteer.role, "id", volunteerId); // Log the volunteer's role for debugging

      const hasPermission = await checkUserRole(author, ['resident', 'business_owner', 'community_organizer']);
      if (!hasPermission) throw new Error('Insufficient permissions');

      // Add the volunteer to the help request
      await HelpRequest.findByIdAndUpdate(
        id,
        { $push: { volunteers: volunteerId } },  // Add the volunteer's ID to the request
        { new: true }
      ).populate('volunteers'); // Populate the 'volunteers' field with user info

      console.log("Volunteer added")
      return true;  // Return success
    }, 'addVolunteerToHelpRequest'),


    // New Mutation: Update Community Post
    updateCommunityPost: wrapMutation(async (_, { id, title, content, category, aiSummary }) => {
      const post = await CommunityPost.findById(id);
      if (!post) throw new Error('Community post not found!');
      console.log(aiSummary)
      const hasPermission = await checkUserRole(post.author, ['resident', 'business_owner', 'community_organizer']);
      if (!hasPermission) throw new Error('Insufficient permissions');

      post.title = title || post.title;
      post.content = content || post.content;
      post.category = category || post.category;
      post.aiSummary = aiSummary || post.aiSummary
      const newPost = await post.save();
      return await newPost.populate('author')
    }, 'updateCommunityPost'),

    // New Mutation: Delete Community Post
    deleteCommunityPost: wrapMutation(async (_, { id }) => {
      const post = await CommunityPost.findById(id);
      if (!post) throw new Error('Community post not found!');

      const hasPermission = await checkUserRole(post.author, ['resident', 'business_owner', 'community_organizer']);
      if (!hasPermission) throw new Error('Insufficient permissions');

      await post.deleteOne();
      return true;
    }, 'deleteCommunityPost'),

    // New Mutation: Update Help Request
    updateHelpRequest: wrapMutation(async (_, { id, description, location, isResolved }) => {
      console.log({ id, description, location, isResolved });
      const helpRequest = await HelpRequest.findById(id);
      if (!helpRequest) throw new Error('Help request not found!');

      const hasPermission = await checkUserRole(helpRequest.author, ['resident', 'business_owner', 'community_organizer']);
      if (!hasPermission) throw new Error('Insufficient permissions');

      // Log before updating
      console.log('isResolved before assignment:', helpRequest.isResolved);

      helpRequest.description = description || helpRequest.description;
      helpRequest.location = location || helpRequest.location;

      // Assign isResolved only if it's explicitly passed as false or true
      helpRequest.isResolved = (isResolved !== undefined) ? isResolved : helpRequest.isResolved;

      // Log after updating
      console.log('isResolved after assignment:', helpRequest.isResolved);

      // Save the updated help request and populate the author field
      const updatedHelpRequest = await helpRequest.save();

      // Populate the 'author' field
      await updatedHelpRequest.populate('author');
      console.log(updatedHelpRequest.isResolved);  // Log to check updated value

      // Return the updated help request with populated author
      return updatedHelpRequest;
    }, 'updateHelpRequest'),

    // New Mutation: Delete Help Request
    deleteHelpRequest: wrapMutation(async (_, { id }) => {
      const helpRequest = await HelpRequest.findById(id);
      if (!helpRequest) throw new Error('Help request not found!');

      const hasPermission = await checkUserRole(helpRequest.author, ['resident', 'business_owner', 'community_organizer']);
      if (!hasPermission) throw new Error('Insufficient permissions');

      await helpRequest.deleteOne();
      return true;
    }, 'deleteHelpRequest'),

    //simple logout
    logout: wrapMutation((_, __, { res }) => {
      res.clearCookie("token", { httpOnly: true, secure: true, sameSite: "Strict" });
      return true;
    }, 'logout'),
    replyReview: wrapMutation(async (_, { id, reply }) => {
      // Find the review by its ID and update the `ownerReply` field
      let review = await Review.findByIdAndUpdate(
        id,
        { $set: { ownerReply: reply } },  // Set the ownerReply field to the new reply
        { new: true }  // Return the updated review after the update
      );
    
      if (!review) {
        throw new Error('Review not found');
      }
    
      return true;
    }, 'replyReview'),
    createReview: wrapMutation(async (_, { businessId, userId, rating, comment }, { user }) => {
      try {
        // Create a new review
        const review = new Review({
          business: businessId,
          user: userId,
          rating,
          comment
        });
        const sentiment = await getSentiment(comment);
        review.sentiment = sentiment;
        // Save the review to the database
        await review.save();

        // Optionally, add review to the BusinessProfile in the database
        await BusinessProfile.findByIdAndUpdate(businessId, {
          $push: { reviews: review._id }
        });

        return true; // Return the created review
      } catch (error) {
        console.error("Error creating review:", error);
        throw new Error("Error creating review");
      }
    }, 'createReview'),

    createProduct: wrapMutation(async (_, { businessId, name, price, description, image, specialOffer }) => {
      try {
        // Create a new product
        const product = new Product({
          business: businessId,
          name,
          price,
          description,
          image,
          specialOffer
        });

        // Save the product to the database
        await product.save();

        // Optionally, add product to the BusinessProfile in the database
        await BusinessProfile.findByIdAndUpdate(businessId, {
          $push: { products: product._id }
        });

        return true; // Return the created product
      } catch (error) {
        console.error("Error creating product:", error);
        throw new Error("Error creating product");
      }
    }, 'createProduct'),
    createBusinessProfile: wrapMutation(async (_, { userId, name, description, address, image }) => {
      try {
        // Check user role permissions
        const hasPermission = await checkUserRole(userId, ['business_owner']);
        if (!hasPermission) throw new Error('Insufficient permissions');

        let imagePath = null

        if (image?.length > 5) {
          // Decode base64 image to binary data
          const base64Data = image.replace(/^data:image\/\w+;base64,/, ''); // Remove base64 prefix
          const buffer = Buffer.from(base64Data, 'base64'); // Convert to binary data

          const folder_path = path.join(process.cwd(), './uploads')
          await fs.promises.mkdir(folder_path, { recursive: true });

          imagePath = path.join(folder_path, `${Date.now()}.jpg`);


          await fs.promises.writeFile(imagePath, buffer);
        }
    
        const businessProfile = new BusinessProfile({
          author: userId,
          name,
          description,
          address,
          image: imagePath, 
        });

        await businessProfile.save();

        return true;  // Return success
      } catch (error) {
        console.error('Error creating business profile:', error);
        throw new Error('Error creating business profile');
      }
    }, 'createBusinessProfile'),      
  }
};

export default resolvers;

