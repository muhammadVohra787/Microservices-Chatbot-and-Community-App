# Microservices Chatbot and Community App

This project is a microservices-based application with a chatbot and community discussion feature. It consists of multiple microfrontends and microbackends that work together to deliver an interactive platform for users to engage with. Additionally, it includes a **Help Request System** where users can post help requests, and others can volunteer to assist.

## Project Overview

### Components:
- **Community App:** Handles community discussions and posts.
- **User App:** Manages user registration, login, and profile management.
- **Shell App:** Acts as a shell connecting the User App and Community App. It decides which app to show based on user authentication.
- **Microservices:**
  - **Authentication Service:** Manages user authentication and registration.
  - **Community Service:** Manages posts and discussions.
  - **API Gateway:** Routes requests to the appropriate microservices.

### Tech Stack:
- **Frontend:** React JS, MUI (Material UI), Vite
- **Backend:** Node.js, MongoDB
- **AI/Chatbot Integration:** **Langchain** and **Gemini API** (AI responses, vector database context handling, and follow-up questions)
- **Microservices:** Express.js for each service
- **Deployment:** Local MongoDB, Docker (optional for production)

---

## Langchain AI Integration (Chatbot & Context Handling)

In this project, we've integrated **Langchain** to enhance the chatbot capabilities, making it capable of processing complex queries and using database contexts to generate more accurate and context-aware responses. Here’s a highlight of how it works:

1. **Database Context:** The chatbot reads data directly from the database and uses **Langchain** to process the information dynamically. This allows the chatbot to respond with highly relevant answers based on the user-provided data, such as community posts, help requests, and more.

2. **Vector Database:** The system uses a **vector database** to store and retrieve contextual information. This allows the chatbot to process large datasets efficiently and understand the relationship between various data points, offering more intelligent responses.

3. **AI Responses with Follow-Up Questions:** The chatbot not only answers user queries but also generates a set of **follow-up questions** based on the context provided by the database. This allows users to explore topics in more depth and engage in richer conversations.

4. **Langchain's Role:** Langchain is used to chain multiple data sources and tools together to provide a seamless AI experience. For example, it can pull data from multiple databases, process it through AI models (like Gemini), and generate natural language responses, all while considering the context and user history.

---

## Setup Instructions

### Backend Setup

**1. Start MongoDB Locally:**

* Ensure MongoDB is installed and running on your local machine. You might need to start the MongoDB server in a separate terminal window:

    ```bash
    mongod
    ```

    * If you have a custom configuration, use that to start mongod.

**2.a Server Setup:**

* Navigate to the `server` directory in your project:

    ```bash
    cd server
    ```

* Install the server dependencies:

    ```bash
    npm run install-deps
    ```

* Start all server microservices (API Gateway, Authentication Service, and Community Service) concurrently:

    ```bash
    npm run start:all
    ```

**2.b Client Setup:**

* Open a new terminal window.
* Navigate to the `client` directory in your project:

    ```bash
    cd client
    ```

* Install the client dependencies:

    ```bash
    npm run install-deps
    ```
* then to start the client:

    ```bash
    npm run deploy:all
    ```

3. **Ensure MongoDB is running locally:**

   This application requires a running MongoDB instance. Make sure MongoDB is running locally or use a cloud MongoDB service.

   To run MongoDB locally:

   ```bash
   mongod
   ```

4. **Environment Variables:**

   - Make sure to create a `.env` file in the backend root directory with the following variables:
     ```env
     GEMINI_API_KEY=your_gemini_api_key_here
     ```

   - Replace `your_gemini_api_key_here` with your own Gemini API key to use the chatbot and AI features.

---

### Frontend Setup

1. **Install dependencies for all frontend apps:**

   Navigate to the root directory of the frontend project and run:

   ```bash
   npm run install-deps
   ```

   This will install dependencies for all frontend applications (User App, Community App, and Shell App).

2. **Deploy and start the apps:**

   - To deploy the User App:

     ```bash
     npm run deploy:user-app
     ```

   - To deploy the Community App:

     ```bash
     npm run deploy:community-app
     ```

   - To start the Shell App in development mode:

     ```bash
     npm run dev:shell-app
     ```

   - To deploy all frontend apps concurrently:

     ```bash
     npm run deploy:all
     ```

---

### How to Use the Application

1. **User Authentication:**

   - The User App handles user login and registration. Once authenticated, users are redirected to the appropriate app (either Community or Help Request).
   - The authentication state is managed in the Shell App, which routes authenticated users to the Community App, and unauthenticated users to the User App.

2. **Community App:**

   - Users can view, create, and interact with community posts.
   - The app provides a chatbot feature that uses the Gemini API to respond to user queries based on the community data.
   - Users can also post help requests and volunteer to offer help to others.

3. **Help Request System:**

   - Users can post help requests for specific needs (e.g., hiking tips, tech support, etc.).
   - Other users can browse help requests and volunteer to assist.

---

## Scripts

### Backend Scripts:

- **start:auth:** Starts the Authentication Service.
- **start:community:** Starts the Community Service.
- **start:gateway:** Starts the API Gateway.
- **install-deps:** Installs dependencies for the API Gateway, Authentication Service, and Community Service.
- **start:all:** Starts all services (API Gateway, Authentication Service, Community Service) concurrently.

### Frontend Scripts:

- **deploy:user-app:** Installs dependencies and deploys the User App.
- **deploy:community-app:** Installs dependencies and deploys the Community App.
- **dev:shell-app:** Starts the Shell App in development mode.
- **install-deps:** Installs dependencies for all frontend apps.
- **deploy:all:** Deploys all frontend apps (Shell, User, Community) concurrently.

---

## Troubleshooting

- **MongoDB Issues:**
  - Ensure that MongoDB is running locally. If using a cloud MongoDB service, make sure to update the connection URL in the `.env` file.
  
- **Gemini API Issues:**
  - Ensure that the `GEMINI_API_KEY` is properly set in the `.env` file for the chatbot to work.

---
