import { Request, Response } from "express";
import Announcement from "../models/Announcement.js";
import Message from "../models/Message.js";
import User from "../models/User.js";

// --- Announcements ---

export const getAnnouncements = async (req: Request, res: Response) => {
  try {
    const { targetAudience } = req.query;
    let query: any = {};
    if (targetAudience) query.targetAudience = targetAudience;

    const announcements = await Announcement.find(query)
      .populate("createdBy", "name role")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: announcements });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createAnnouncement = async (req: Request, res: Response) => {
  try {
    const announcement = new Announcement({
      ...req.body,
      createdBy: (req as any).user?._id
    });
    await announcement.save();
    
    // Logic to push notifications to target audience would go here
    
    res.status(201).json({ success: true, data: announcement });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// --- Direct Messaging ---

export const getMessages = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?._id;
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }]
    })
    .populate("sender", "name email role")
    .populate("receiver", "name email role")
    .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: messages });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const message = new Message({
      ...req.body,
      sender: (req as any).user?._id
    });
    await message.save();
    res.status(201).json({ success: true, data: message });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
