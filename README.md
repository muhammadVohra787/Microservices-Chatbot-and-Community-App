# Microservices Chatbot and Community App

![Community App](/assets/community-app-preview.png) <!-- You can add an image here if available -->

## 🌟 Project Overview

A modern, microservices-based application featuring AI-powered chatbot integration and community discussion forums. This platform enables users to engage with one another, post help requests, and receive assistance through an intuitive interface enriched with artificial intelligence capabilities.

### 🧩 Core Components

- **Community App:** Community discussions, posts, and business profiles
- **User App:** User registration, authentication, and profile management
- **Shell App:** Container application that routes between User and Community apps based on authentication status
- **Microservices Backend:**
  - **Authentication Service:** Handles user verification and session management
  - **Community Service:** Manages community content, help requests, and AI integration
  - **API Gateway:** Orchestrates communication between frontend and backend services

### 🔧 Technology Stack

#### Frontend
- **Framework:** React 19
- **UI Library:** Material UI (MUI) 6
- **Build Tool:** Vite
- **State Management:** Apollo Client (GraphQL)
- **Routing:** React Router DOM
- **Authentication:** React Auth Kit

#### Backend
- **Runtime:** Node.js
- **Database:** MongoDB
- **API:** GraphQL with Apollo Server
- **Microservices:** Express.js

#### AI Integration
- **Chatbot:** Langchain with Gemini API
- **Vector Database:** For context-aware responses
- **Sentiment Analysis:** Hugging Face models

---

## 🚀 Features

### 💬 AI-Powered Chatbot
The integrated chatbot (named "Alex") leverages advanced AI capabilities to:
- Retrieve relevant community discussions based on user queries
- Generate context-aware responses using vector databases
- Suggest follow-up questions to enhance user engagement
- Provide assistance with navigating the platform

### 💼 Business Profiles
- Business owners can create and manage their business profiles
- Users can discover local businesses and leave reviews
- Sentiment analysis automatically categorizes review sentiment
- Business dashboard for owners to track performance metrics

### 🆘 Help Request System
- Users can post requests for assistance on various topics
- Community members can volunteer to help others
- Categorized help requests for easy navigation
- Real-time status updates on help requests

### 📝 Community Discussion
- Create and participate in community discussions
- AI-generated summaries of discussion topics
- Category-based organization of discussions
- Interactive UI with rich text formatting

### 🌓 Theme Support
- Light and dark mode options
- Responsive design for all screen sizes
- Accessible UI components

---

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v16+)
- MongoDB (local or cloud instance)
- Gemini API key for AI features
- Hugging Face API key for sentiment analysis

### Backend Setup

1. **Start MongoDB**
   ```bash
   mongod
   ```

2. **Configure Environment Variables**
   Create a `.env` file in the server directory with:
   ```
   MONGODB_URI=mongodb://localhost:27017/community-app
   JWT_SECRET=your_jwt_secret
   GEMINI_API_KEY=your_gemini_api_key
   HUGGINGFACE_API_KEY=your_huggingface_api_key
   PORT=4000
   ```

3. **Install Server Dependencies**
   ```bash
   cd server
   npm run install-deps
   ```

4. **Start Backend Services**
   ```bash
   npm run start:all
   ```
   This will concurrently start the API Gateway, Authentication Service, and Community Service.

### Frontend Setup

1. **Install Client Dependencies**
   ```bash
   cd client
   npm run install-deps
   ```

2. **Start Frontend Applications**
   ```bash
   npm run deploy:all
   ```
   This command will build and deploy all frontend applications.

3. **Access the Application**
   Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

---

## 🧪 Testing

### User Authentication
- **Test Accounts:**
  - Resident: `resident@test.com` / `password123`
  - Business Owner: `business@test.com` / `password123`
  - Community Organizer: `organizer@test.com` / `password123`

### API Testing
- GraphQL playground is available at `http://localhost:4000/graphql` for testing queries and mutations.

---

## 🔍 Troubleshooting

### Common Issues

- **Connection to MongoDB fails:**
  - Ensure MongoDB is running locally or your cloud MongoDB URI is correct in the `.env` file.

- **Chatbot not responding:**
  - Verify your Gemini API key is valid and properly configured in the `.env` file.

- **Sentiment analysis issues:**
  - Check that your Hugging Face API key is valid and the correct model is being used.

- **UI issues with dark mode:**
  - Ensure all components are respecting the theme settings and not using hardcoded color values.

---

## 📚 API Documentation

### GraphQL Endpoints

- **Authentication Service:**
  - `login`: Authenticates a user and returns a JWT token
  - `register`: Creates a new user account
  - `logout`: Invalidates the current user session

- **Community Service:**
  - `getCommunityPosts`: Retrieves all community discussions
  - `createCommunityPost`: Creates a new discussion topic
  - `getHelpRequests`: Retrieves all help requests
  - `createHelpRequest`: Creates a new help request
  - `communityAIQuery`: Queries the AI chatbot with user input

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgements

- Material UI for the component library
- Gemini API for the AI functionality
- Hugging Face for sentiment analysis models
- MongoDB for database services
- The open-source community for various libraries and tools
