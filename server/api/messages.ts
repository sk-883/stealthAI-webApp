import { Request, Response } from "express";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Schemas for validation
const messageSchema = z.object({
  receiverId: z.number(),
  content: z.string().min(1),
});

// Get messages between users
export async function getMessages(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const otherUserId = parseInt(req.params.userId);
    if (isNaN(otherUserId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Get messages where current user is either sender or receiver
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { 
            senderId: userId, 
            receiverId: otherUserId 
          },
          { 
            senderId: otherUserId, 
            receiverId: userId 
          }
        ]
      },
      orderBy: {
        createdAt: "asc",
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            username: true,
            profilePicture: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            username: true,
            profilePicture: true
          }
        }
      }
    });

    // Mark messages as read when user views them
    await prisma.message.updateMany({
      where: {
        receiverId: userId,
        senderId: otherUserId,
        isRead: false
      },
      data: {
        isRead: true
      }
    });

    return res.status(200).json(messages);
  } catch (error) {
    console.error("Failed to get messages:", error);
    return res.status(500).json({ message: "Failed to get messages" });
  }
}

// Get conversations for current user
export async function getConversations(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Get unique users the current user has messaged with
    const sentMessages = await prisma.message.findMany({
      where: {
        senderId: userId
      },
      select: {
        receiverId: true
      },
      distinct: ['receiverId']
    });

    const receivedMessages = await prisma.message.findMany({
      where: {
        receiverId: userId
      },
      select: {
        senderId: true
      },
      distinct: ['senderId']
    });

    // Combine unique user IDs
    const uniqueUserIds = new Set<number>();
    sentMessages.forEach(msg => uniqueUserIds.add(msg.receiverId));
    receivedMessages.forEach(msg => uniqueUserIds.add(msg.senderId));

    // Get latest message and user details for each conversation
    const conversations = await Promise.all(
      Array.from(uniqueUserIds).map(async (otherUserId) => {
        const latestMessage = await prisma.message.findFirst({
          where: {
            OR: [
              { 
                senderId: userId, 
                receiverId: otherUserId 
              },
              { 
                senderId: otherUserId, 
                receiverId: userId 
              }
            ]
          },
          orderBy: {
            createdAt: "desc"
          }
        });

        const otherUser = await prisma.user.findUnique({
          where: {
            id: otherUserId
          },
          select: {
            id: true,
            name: true,
            username: true,
            profilePicture: true,
            headline: true
          }
        });

        // Count unread messages
        const unreadCount = await prisma.message.count({
          where: {
            senderId: otherUserId,
            receiverId: userId,
            isRead: false
          }
        });

        return {
          user: otherUser,
          latestMessage,
          unreadCount
        };
      })
    );

    // Sort conversations by latest message date
    conversations.sort((a, b) => {
      if (!a.latestMessage || !b.latestMessage) return 0;
      return new Date(b.latestMessage.createdAt).getTime() - 
        new Date(a.latestMessage.createdAt).getTime();
    });

    return res.status(200).json(conversations);
  } catch (error) {
    console.error("Failed to get conversations:", error);
    return res.status(500).json({ message: "Failed to get conversations" });
  }
}

// Send a message
export async function sendMessage(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Validate request body
    const validatedData = messageSchema.parse(req.body);
    const { receiverId, content } = validatedData;

    // Check if receiver exists
    const receiver = await prisma.user.findUnique({
      where: {
        id: receiverId
      }
    });

    if (!receiver) {
      return res.status(404).json({ message: "Receiver not found" });
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        senderId: userId,
        receiverId,
        content
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            username: true,
            profilePicture: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            username: true,
            profilePicture: true
          }
        }
      }
    });

    // Create a notification for the receiver
    await prisma.notification.create({
      data: {
        userId: receiverId,
        actorId: userId,
        type: 'new_message',
        content: `New message from ${req.user?.name}`,
        entityId: message.id,
        entityType: 'message'
      }
    });

    return res.status(201).json(message);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Invalid request data", 
        errors: error.errors 
      });
    }
    console.error("Failed to send message:", error);
    return res.status(500).json({ message: "Failed to send message" });
  }
}

// Delete a message
export async function deleteMessage(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const messageId = parseInt(req.params.id);
    if (isNaN(messageId)) {
      return res.status(400).json({ message: "Invalid message ID" });
    }

    // Check if message exists and belongs to the user
    const message = await prisma.message.findUnique({
      where: {
        id: messageId
      }
    });

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (message.senderId !== userId) {
      return res.status(403).json({ message: "Not authorized to delete this message" });
    }

    // Delete message
    await prisma.message.delete({
      where: {
        id: messageId
      }
    });

    return res.status(200).json({ message: "Message deleted" });
  } catch (error) {
    console.error("Failed to delete message:", error);
    return res.status(500).json({ message: "Failed to delete message" });
  }
}