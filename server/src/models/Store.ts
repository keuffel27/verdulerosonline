import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const storeSchema = new mongoose.Schema({
  storeName: {
    type: String,
    required: true,
    unique: true
  },
  ownerName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  whatsappNumber: {
    type: String,
    required: true
  },
  offersDelivery: {
    type: Boolean,
    default: false
  },
  socialMedia: {
    whatsapp: String,
    facebook: String,
    instagram: String,
    twitter: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
storeSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
storeSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const Store = mongoose.model('Store', storeSchema);
