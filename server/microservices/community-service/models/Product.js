import mongoose from "mongoose";
const ProductSchema = new mongoose.Schema({
    business: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'BusinessProfile', 
        required: true 
    },
    name: { 
        type: String, 
        required: true 
    },
    price: { 
        type: Number, 
        required: true 
    },
    description: { 
        type: String, 
        required: false 
    },
    image: { 
        type: String, 
        required: false 
    },
    specialOffer: {
        type: Boolean, 
        default: false, // Default to false if not specified
    }
}, {
    timestamps: true,
});

export default mongoose.model('Product', ProductSchema);
