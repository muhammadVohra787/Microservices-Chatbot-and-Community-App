import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import bcrypt from 'bcrypt';
import { config } from '../config/config.js';

const resolvers = {
    Query: {
        currentUser: (_, __, context) => {
            const { req } = context;
            console.log("Current user request in")
            if (!req || !req.cookies) { 
                console.log("Request object is missing!");
                return null;
            }
            const token = req.cookies.token;
            if (!token) return null; 

            try {
                console.log("JWT_SECRET in resolvers.js:", config.JWT_SECRET);
                const decoded = jwt.verify(token, config.JWT_SECRET);
                console.log(decoded)
                console.log("returned user", {id: decoded.id })
                return { username: decoded.username, email: decoded.email, role: decoded.role, id: decoded.id };
            } catch (error) {
                console.error("Error verifying token:", error);
                return null;
            }
        },

        getUserById: async (_, { id }) => {
            try {
                // Retrieve the user by ID from the database
                const user = await User.findById(id);
                if (!user) throw new Error('User not found');
                
                // Return the user information
                return {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                };
            } catch (error) {
                console.error("Error retrieving user:", error);
                throw new Error('Unable to fetch user');
            }
        },
    
    },
    Mutation: {
        login: async (_, { username, password }, { res }) => {
            const user = await User.findOne({ username });
            if (!user) throw new Error('User not found');
    
            const match = await bcrypt.compare(password, user.password);
            if (!match) throw new Error('Invalid password');
    
            const token = jwt.sign(
                { username: user.username, email: user.email, role: user.role, id: user._id },
                config.JWT_SECRET, 
                { expiresIn: '1d' }
            );
    
            res.cookie('token', token, {
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000, // 1 day
            });
    
            console.log("Cookie set:", res.getHeaders()['set-cookie']);
    
            // Return the user object after successful login
            return { username: user.username, email: user.email, role: user.role };
        },


        register: async (_, { username, email, password, role }) => {
            const existingUser = await User.findOne({ $or: [{ username }, { email }] });
            if (existingUser) {
                throw new Error('Username or email is already taken');
            }

            const newUser = new User({ username, email, password, role });
            await newUser.save();
            return true;
        },
    },
};

export default resolvers;
