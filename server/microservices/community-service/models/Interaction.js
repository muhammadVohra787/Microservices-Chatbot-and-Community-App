import mongoose from 'mongoose';

const InteractionSchema = new mongoose.Schema({
    userQuery: String,
    aiResponse: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },  
    timestamp: { type: Date, default: Date.now },
});

export default mongoose.model('Interaction', InteractionSchema);