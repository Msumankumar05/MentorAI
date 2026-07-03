import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const userInfoSchema = new mongoose.Schema({
  name: {
    type: String,
    default: null
  },
  preferredName: {
    type: String,
    default: null
  },
  topics: [String],
  lastActive: {
    type: Date,
    default: Date.now
  }
});

const chatSchema = new mongoose.Schema({
  userId: {
    type: String,
    default: 'anonymous'
  },
  userInfo: {
    type: userInfoSchema,
    default: () => ({})
  },
  title: {
    type: String,
    default: 'New Chat'
  },
  messages: {
    type: [messageSchema],
    default: []
  },
  mode: {
    type: String,
    enum: ['friendly'],
    default: 'friendly'
  },
  fileContext: {
    type: [{
      fileName: String,
      fileType: String,
      content: String,
      uploadDate: { type: Date, default: Date.now }
    }],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamps before saving
chatSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  if (this.userInfo) {
    this.userInfo.lastActive = Date.now();
  }
  next();
});

const Chat = mongoose.model('Chat', chatSchema);
export default Chat;