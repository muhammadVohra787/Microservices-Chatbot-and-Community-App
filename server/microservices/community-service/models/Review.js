import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema({
    business: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'BusinessProfile', 
        required: true 
    },
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    rating: { 
        type: Number, 
        required: true 
    },
    comment: { 
        type: String, 
        required: false 
    },
    ownerReply: {
        type: String,
        required: false,
        default: null
    }
}, {
    timestamps: true,
});

export default  mongoose.model('Review', ReviewSchema);