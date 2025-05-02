import { Request, Response } from "express";
import { prisma } from "../prisma";

// Get notifications for the current user
export async function getNotifications(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const notifications = await prisma.notification.findMany({
      where: {
        userId: userId
      },
      orderBy: {
        createdAt: "desc"
      },
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            username: true,
            profilePicture: true
          }
        }
      }
    });

    return res.status(200).json(notifications);
  } catch (error) {
    console.error("Failed to get notifications:", error);
    return res.status(500).json({ message: "Failed to get notifications" });
  }
}

// Mark notifications as read
export async function markNotificationsAsRead(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // If notificationId is provided, mark specific notification as read
    // Otherwise, mark all notifications as read
    if (req.params.id) {
      const notificationId = parseInt(req.params.id);
      if (isNaN(notificationId)) {
        return res.status(400).json({ message: "Invalid notification ID" });
      }

      const notification = await prisma.notification.findUnique({
        where: {
          id: notificationId
        }
      });

      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }

      if (notification.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to update this notification" });
      }

      await prisma.notification.update({
        where: {
          id: notificationId
        },
        data: {
          isRead: true
        }
      });

      return res.status(200).json({ message: "Notification marked as read" });
    } else {
      // Mark all notifications as read
      await prisma.notification.updateMany({
        where: {
          userId: userId,
          isRead: false
        },
        data: {
          isRead: true
        }
      });

      return res.status(200).json({ message: "All notifications marked as read" });
    }
  } catch (error) {
    console.error("Failed to mark notifications as read:", error);
    return res.status(500).json({ message: "Failed to mark notifications as read" });
  }
}

// Delete notification
export async function deleteNotification(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const notificationId = parseInt(req.params.id);
    if (isNaN(notificationId)) {
      return res.status(400).json({ message: "Invalid notification ID" });
    }

    const notification = await prisma.notification.findUnique({
      where: {
        id: notificationId
      }
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    if (notification.userId !== userId) {
      return res.status(403).json({ message: "Not authorized to delete this notification" });
    }

    await prisma.notification.delete({
      where: {
        id: notificationId
      }
    });

    return res.status(200).json({ message: "Notification deleted" });
  } catch (error) {
    console.error("Failed to delete notification:", error);
    return res.status(500).json({ message: "Failed to delete notification" });
  }
}

// Get unread notification count
export async function getUnreadNotificationCount(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const count = await prisma.notification.count({
      where: {
        userId: userId,
        isRead: false
      }
    });

    return res.status(200).json({ count });
  } catch (error) {
    console.error("Failed to get unread notification count:", error);
    return res.status(500).json({ message: "Failed to get unread notification count" });
  }
}