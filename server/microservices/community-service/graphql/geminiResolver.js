import mongoose from "mongoose";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

import { Document } from "langchain/document";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import CommunityPost from "../models/CommunityPost.js";
import Interaction from "../models/Interaction.js";
import { compareSync } from "bcrypt";

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function getSummary(prompt) {
  if (!API_KEY) {
    return "API Key not set up. Check server-side ENV";
  }
  try {
    if (prompt != null) {
      if (prompt.length < 120) {
        return "Too short for summary";
      }
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `Generate a brief summary, only return the summary nothing else no extra messages. ${prompt}`,
      });
      return response.text;
    }
  } catch (error) {
    console.error("Error fetching summary:", error);
    return "Failed to generate summary.";
  }
}

export async function getAIResponse(userQuery, prompt, pastConversation) {
  try {
    if (prompt != null) {
      if (prompt.length < 200) {
        return "Too short for summary";
      }
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `User asked: ${userQuery}\n
                This is the data we have from the database:\n
                ${prompt}\n
                Now keep in mind there might be some data that doesn't relate to the question, so ignore that.\n
                Answer their question.\n
                **Past Conversations**: These are simply for chat history, you can use relevant information when needed, but it is simply here for context and user history:\n
                ${pastConversation}\n`,
      });

      return response.text;
    }
  } catch (error) {
    console.error("Error fetching summary:", error);
    return "Failed to generate summary.";
  }
}

export async function getFollowUpQuestions(prompt, pastConversation) {
  try {
    if (prompt != null) {
      if (prompt.length < 200) {
        return "Too short for summary";
      }
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `This is the conversation AI and human just had ${prompt}\n\n
                Provide a list of 2-3 follow-up questions that could be relevant based on the conversation. These questions will be first person so
                can just copy paste it like "Lets talk about bycyles" not like "would you want to discuss about cycles"?
                \nReturn the questions seperated by "***" sign to make it clear. Give it so if I do .split("***") and I get an array.
                Please do not give any else.  If theres not much data, simply return "Lets discuss the new posts".
                \nFor context: this is the full converstaion. It might be related might not be:\n ${pastConversation}
            `,
      });

      return response.text;
    }
  } catch (error) {
    console.error("Error fetching summary:", error);
    return "Failed to generate summary.";
  }
}
async function loadPostsFromDB() {
  try {
    const posts = await CommunityPost.find()
      .populate("author")
      .sort({ createdAt: -1 });
    return posts.map(
      (post) =>
        new Document({
          pageContent: post.content,
          metadata: {
            author: post.author,
            title: post.title,
            category: post.category,
            createdAt: post.createdAt,
            aiSummary: post.aiSummary,
            postId: post.id,
          },
        })
    );
  } catch (error) {
    console.error("Error loading posts from DB:", error);
    return [];
  }
}

async function createVectorStore(posts) {
  return await MemoryVectorStore.fromDocuments(
    posts,
    new GoogleGenerativeAIEmbeddings({ apiKey: API_KEY })
  );
}

export async function aiAgentLogic(userQuery, userId) {
  if (!API_KEY) {
    return {
      text: "API KEY not found/invalid. Check env file GEMINI_API_KEY=",
      suggestedQuestions: [],
      retrievedPosts: [],
    };
  }

  const posts = await loadPostsFromDB();
  const vectorStore = await createVectorStore(posts);
  const retriever = vectorStore.asRetriever();
  // if no post avaialble
  if (posts.length === 0) {
    return {
      text: "There are no posts available yet. Maybe you could start by creating one?",
      suggestedQuestions: [],
      retrievedPosts: [],
    };
  }

  const pastConversation = await getRecentInteractions(userId);
  console.log("Past convos", pastConversation);
  // Retrieve relevant posts based on user query
  const relevantDocs = await retriever.getRelevantDocuments(userQuery);

  if (relevantDocs.length === 0) {
    return {
      text: "I'm not sure about that. Can you clarify your question?",
      suggestedQuestions: [
        "Could you elaborate on your query?",
        "What specific topic are you interested in?",
      ],
      retrievedPosts: [],
    };
  }
  const formattedPosts = relevantDocs
    .map(
      (doc) => `
        Title: ${doc.metadata.title}
        Category: ${doc.metadata.category}
        Summary: ${doc.metadata.aiSummary || "No summary available"}
        Content: ${doc.pageContent}
        `
    )
    .join("\n\n");

  // Generate a response using the relevant posts
  const responseText = await getAIResponse(
    userQuery,
    formattedPosts,
    pastConversation
  );

  const followUpQuestionsString = await getFollowUpQuestions(
    responseText,
    pastConversation
  );

  const followUpQuestions = followUpQuestionsString.split("***");
  // Store this interaction for future improvements
  const newInteraction = new Interaction({
    userQuery,
    aiResponse: responseText,
    userId,
  });
  await newInteraction.save();

  return {
    text: responseText,
    suggestedQuestions: followUpQuestions,
    retrievedPosts: relevantDocs,
  };
  // return {
  //     text:"test",
  //     suggestedQuestions:[],
  //     retrievedPosts:[]
  // }
}

//get users past history
async function getRecentInteractions(userId) {
  const twentyFourHoursAgo = new Date();
  twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

  const interactions = await Interaction.find({
    userId,
    timestamp: { $gte: twentyFourHoursAgo },
  }).sort({ createdAt: 1 }); // Oldest to newest

  return interactions
    .map((i) => `User: ${i.userQuery}\nAI: ${i.aiResponse}`)
    .join("\n\n");
}
