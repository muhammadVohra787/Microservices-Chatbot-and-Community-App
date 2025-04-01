import User from '../models/User.js';
import CommunityPost from '../models/CommunityPost.js';
import { getSummary } from '../graphql/geminiResolver.js';

const catTypes = ['news', 'discussion'];

// Static data for 9 posts with content length ~200 characters
const staticPostsData = [
    // 3 posts for Hiking category
    {
        title: "Hiking Adventures",
        content: "Join me as I explore the best hiking trails in the country. From the challenging mountain peaks to the peaceful, serene nature walks, hiking is an adventure that offers a perfect blend of physical challenge and natural beauty.",
    },
    {
        title: "Hiking 101: Tips for Beginners",
        content: "A beginner's guide to hiking in the wilderness. If you're new to hiking, these essential tips will help you get started safely, from choosing the right gear to navigating difficult terrains and staying on the marked trails.",
    },
    {
        title: "Top 5 Scenic Hikes in the Country",
        content: "The most beautiful hiking spots you must visit! These trails offer some of the most scenic views in the country, from lush forests to rugged cliffs and crystal-clear lakes. Whether you're a seasoned hiker or a beginner, there's a trail for you.",
    },

    // 3 posts for Biking category
    {
        title: "Biking for Fitness",
        content: "How biking can help you stay fit and healthy. Cycling is an excellent cardiovascular workout that strengthens your heart and tones your muscles. Plus, it's easy on your joints, making it a great option for people of all fitness levels.",
    },
    {
        title: "Essential Gear for Cycling",
        content: "The gear you need for an amazing biking experience. From the right helmet and gloves to the perfect biking shoes and bike accessories, having the proper gear is crucial for both safety and comfort during your rides.",
    },
    {
        title: "Best Cycling Routes for Beginners",
        content: "A guide to the easiest and most scenic biking routes. If you're new to cycling, it's important to start with gentle, flat routes. Here are the best beginner-friendly routes that will take you through picturesque countryside, along riversides, and through peaceful parks.",
    },

    // 3 posts for Outdoor category
    {
        title: "Exploring the Outdoors",
        content: "Tips for making the most of your outdoor adventures. Whether you're camping, hiking, or simply enjoying nature, there are plenty of ways to get the most out of your outdoor time. Learn how to plan your trips, pack efficiently, and enjoy the natural beauty around you.",
    },
    {
        title: "Outdoor Safety: What You Need to Know",
        content: "Safety tips when you're out in nature. The outdoors can be unpredictable, so it's important to be prepared for any situation. From knowing how to navigate in case of an emergency to understanding weather patterns, here are key tips for staying safe.",
    },
    {
        title: "The Best Outdoor Activities for Families",
        content: "Fun outdoor activities that are perfect for family bonding. Whether it's a picnic in the park, a day of fishing by the lake, or a weekend of camping in the woods, spending time outdoors is an excellent way for families to connect and create lasting memories.",
        content:'discussion'
    }
];


// Create a new user with role 'community_organizer'
const createUser = async () => {
    try {
        if (await User.findOne({ username: 'communityorg@domain.com'})!=null){
            console.log("Demo items already exists")
            return;
        } 
        const newUser = new User({
            username: 'communityorg@domain.com',
            email: 'communityorg@domain.com',
            password: 'password123', // In a real app, hash the password
            role: 'community_organizer'
        });

        await newUser.save();
        console.log('User created successfully');

        // Fetch user by username to get its ID
        const user = await User.findOne({ username: 'communityorg@domain.com' });

        if (!user) {
            console.log('User not found!');
            return;
        }

        console.log('User ID:', user.id);

        // Map through the static posts data and create discussions
        const posts = [];
        for (const postData of staticPostsData) {
            const { title, content } = postData;
            const random = Math.floor(Math.random() * catTypes.length);
            
            // Get the AI summary for each post using getSummary from geminiResolver
            const aiSummary = await getSummary(content);

            // Create a new post with the user ID
            const newPost = new CommunityPost({
                author: user.id, // Using user.id (not _id) as you specified
                title,
                content,
                category: catTypes[random], // All posts are of type 'discussion'
                aiSummary
            });

            posts.push(newPost);
        }

        // Save all the posts to the database in one go
        await CommunityPost.insertMany(posts);
        console.log('9 community posts created and saved successfully');
    } catch (error) {
        console.error('Error during user or post creation:', error);
    }
};

export default createUser;
