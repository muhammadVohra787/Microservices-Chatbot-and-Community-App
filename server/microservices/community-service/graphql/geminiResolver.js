import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { GoogleGenAI } from "@google/genai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

import { Document } from "langchain/document";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import CommunityPost from '../models/CommunityPost.js';
import Interaction from '../models/Interaction.js'; 
import { compareSync } from 'bcrypt';

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY 
const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function getSummary(prompt) {
    if(API_KEY === null || API_KEY === undefined){
        return "API Key not set up. Check server-side ENV"
    }
    try {
        if (prompt != null) {
            if (prompt.length < 120) {
                return "Too short for summary";
            }
            const response = await ai.models.generateContent({
                model: "gemini-2.0-flash",
                contents: `Generate a brief summary, only return the summary nothing else no extra messages. ${prompt}`
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
                contents: `User asked ${userQuery}\n this the data we have from database: 
                ${prompt}\n Now keep in mind there might be some data that doesnt relate to the question so ignroe that\n. 
                Answer their question.\n **Past Conversations**: These are simply for chat history, you can relevant information when needed
                but it is simply here for context and user history ${pastConversation}`
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
        const posts = await CommunityPost.find().populate('author').sort({ createdAt: -1 });
        return posts.map(post => new Document({
            pageContent: post.content,
            metadata: {
                author: post.author,
                title: post.title,
                category: post.category,
                createdAt: post.createdAt,
                aiSummary: post.aiSummary,
                postId: post.id,
            },
        }));
    } catch (error) {
        console.error('Error loading posts from DB:', error);
        return [];
    }
}

async function createVectorStore(posts) {
    return await MemoryVectorStore.fromDocuments(posts, new GoogleGenerativeAIEmbeddings({ apiKey: API_KEY }));
}

export async function aiAgentLogic(userQuery, userId) {
    if(!API_KEY){
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

    const pastConversation = await getRecentInteractions(userId)
    console.log("Past convos", pastConversation)
    // Retrieve relevant posts based on user query
    const relevantDocs = await retriever.getRelevantDocuments(userQuery);

    if (relevantDocs.length === 0) {
        return {
            text: "I'm not sure about that. Can you clarify your question?",
            suggestedQuestions: ["Could you elaborate on your query?", "What specific topic are you interested in?"],
            retrievedPosts: [],
        };
    }
    const formattedPosts = relevantDocs.map(doc => `
        Title: ${doc.metadata.title}
        Category: ${doc.metadata.category}
        Summary: ${doc.metadata.aiSummary || "No summary available"}
        Content: ${doc.pageContent}
        `).join("\n\n");
    
        // Generate a response using the relevant posts
    const responseText = await getAIResponse(userQuery,formattedPosts, pastConversation);
    
    // Store this interaction for future improvements
    const newInteraction = new Interaction({
        userQuery,
        aiResponse: responseText,
        userId
    })
    await newInteraction.save();

    return {
        text: responseText,
        suggestedQuestions: ["What else can I help you with?", "Would you like to explore related discussions?"],
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
        timestamp: { $gte: twentyFourHoursAgo }
    }).sort({ createdAt: 1 });  // Oldest to newest

    return interactions.map(i => `User: ${i.userQuery}\nAI: ${i.aiResponse}`).join("\n\n");
}

