// BusinessProfile Schema
import mongoose from 'mongoose';

const BusinessProfile = new mongoose.Schema({
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: false 
  },
  address: { 
    type: String, 
    required: true 
  },
  image: { 
    type: String, 
    required: false 
  },
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
}, {
  timestamps: true
});

export default mongoose.model('BusinessProfile', BusinessProfile);