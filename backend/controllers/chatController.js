import Chat from "../models/Chat.js";
import { generateAIResponse } from "../services/aiService.js";

export const chatController = {
  // Send a message and get AI response
  sendMessage: async (req, res) => {
    try {
      const { message, chatId, fileContext } = req.body;

      let chat;
      if (chatId) {
        chat = await Chat.findById(chatId);
        if (!chat) {
          return res.status(404).json({ error: "Chat not found" });
        }
      } else {
        // Create new chat
        chat = new Chat({
          messages: [],
          mode: "friendly",
          title: "New Chat",
          fileContext: [],
          userInfo: { name: null, preferredName: null }
        });
      }

      // Add user message
      const userMessage = {
        role: "user",
        content: message,
        timestamp: new Date()
      };
      chat.messages.push(userMessage);

      // Prepare file context if any
      let contextMessage = "";
      if (fileContext && fileContext.length > 0) {
        contextMessage = "Based on the uploaded files:\n";
        fileContext.forEach(f => {
          contextMessage += `File: ${f.fileName}\nContent: ${f.content}\n\n`;
        });
      }

      // Extract previous messages for history (excluding current)
      const conversationHistory = chat.messages
        .slice(0, -1)
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));

      console.log(`📤 Sending ${conversationHistory.length} previous messages as history`);

      // Generate AI response with full history
      const aiResponse = await generateAIResponse(
        message,
        "friendly",
        contextMessage,
        conversationHistory,
        chat.userInfo
      );

      // Add AI response
      const assistantMessage = {
        role: "assistant",
        content: aiResponse,
        timestamp: new Date()
      };
      chat.messages.push(assistantMessage);

      // Update title if first exchange (user + assistant = 2 messages)
      if (chat.messages.length === 2) {
        chat.title = message.substring(0, 50) + (message.length > 50 ? "..." : "");
      }

      chat.updatedAt = new Date();
      await chat.save();

      res.json({
        chatId: chat._id,
        response: aiResponse,
        messages: chat.messages
      });

    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get chat history by ID
  getChatHistory: async (req, res) => {
    try {
      const { chatId } = req.params;
      const chat = await Chat.findById(chatId);
      if (!chat) {
        return res.status(404).json({ error: "Chat not found" });
      }
      res.json(chat);
    } catch (error) {
      console.error("Get chat history error:", error);
      res.status(500).json({ error: "Failed to fetch chat history" });
    }
  },

  // Get all chats (summary list)
  getAllChats: async (req, res) => {
    try {
      const chats = await Chat.find({})
        .sort({ updatedAt: -1 })
        .select("_id title mode updatedAt messages userInfo");
      res.json(chats);
    } catch (error) {
      console.error("Get all chats error:", error);
      res.status(500).json({ error: "Failed to fetch chats" });
    }
  },

  // Delete a chat
  deleteChat: async (req, res) => {
    try {
      const { chatId } = req.params;
      await Chat.findByIdAndDelete(chatId);
      res.json({ message: "Chat deleted successfully" });
    } catch (error) {
      console.error("Delete chat error:", error);
      res.status(500).json({ error: "Failed to delete chat" });
    }
  }
};