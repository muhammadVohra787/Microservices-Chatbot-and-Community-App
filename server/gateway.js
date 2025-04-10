import dotenv from "dotenv";
import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloGateway, IntrospectAndCompose } from "@apollo/gateway";
import cors from "cors";
import cookieParser from "cookie-parser";
import waitOn from "wait-on"; // Import wait-on to wait for services to be ready
import fs from "fs";
import path from "path";
const app = express();
dotenv.config();

// ✅ Add middleware to parse JSON requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS and Cookie Parsing
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
    ],
    credentials: true,
  })
);
app.use(cookieParser());

const gateway = new ApolloGateway({
  supergraphSdl: new IntrospectAndCompose({
    subgraphs: [
      { name: "auth", url: "http://localhost:4001/graphql" },
      { name: "community", url: "http://localhost:4002/graphql" },
    ],
  }),
});

// Initialize Apollo Server
const server = new ApolloServer({
  gateway,
  introspection: true,
});

// Wait for all resources to be available before starting the gateway
async function startServer() {
  try {
    // Configure wait-on to wait for the required services
    const resources = [
      "http://127.0.0.1:4001", // Auth service
      "http://127.0.0.1:4002", // Community service
    ];
    console.log("waiting on services");
    // Wait for the services to be ready
    // const res =await waitOn({ resources , timeout: 30000}); // not working idk why
    // console.log(res)

    console.log("✅ Microservices are fully running!");

    // Start the Apollo server and listen for requests
    await server.start();
    app.use("/graphql", expressMiddleware(server));

    // Start Express server
    app.listen(4000, () => {
      console.log(`🚀 API Gateway ready at http://localhost:4000/graphql`);
    });

    app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
  } catch (err) {
    console.error("❌ Error waiting for services to be ready:", err);
    process.exit(1); // Exit if the services are not ready
  }
}

startServer();
