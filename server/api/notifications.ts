import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma';

// Middleware to check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) return res.status(401).json({ message: 'Not authenticated' });
  next();
};

// Schema for validating notification creation request
const createNotificationSchema = z.object({
  userId: z.number(),
  actorId: z.number().nullable().optional(),
  type: z.string(),
  content: z.string(),
  entityId: z.number().nullable().optional(),
  entityType: z.string().nullable().optional(),
  isRead: z.boolean().default(false),
});

// Create router
const router = Router();

// Get all notifications for the current user
router.get('/', isAuthenticated, async (req: Request, res: Response) => {
  try {
    // Type assertion with the globally augmented Express User interface
    const userId = (req.user as any)?.id;
    if (!userId) {
      return res.status(400).json({ message: 'User ID not found' });
    }

    const notifications = await prisma.notification.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            username: true,
            profilePicture: true,
          },
        },
      },
    });
    
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
});

// Get unread notification count
router.get('/unread/count', isAuthenticated, async (req: Request, res: Response) => {
  try {
    // Type assertion with the globally augmented Express User interface
    const userId = (req.user as any)?.id;
    if (!userId) {
      return res.status(400).json({ message: 'User ID not found' });
    }
    
    const count = await prisma.notification.count({
      where: {
        userId: userId,
        isRead: false,
      },
    });
    
    res.json({ count });
  } catch (error) {
    console.error('Error counting unread notifications:', error);
    res.status(500).json({ message: 'Failed to count unread notifications' });
  }
});

// Mark a specific notification as read
router.patch('/:id/read', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    // Type assertion with the globally augmented Express User interface
    const userId = (req.user as any)?.id;
    if (!userId) {
      return res.status(400).json({ message: 'User ID not found' });
    }
    
    // Verify the notification belongs to the user
    const notification = await prisma.notification.findUnique({
      where: { id },
      select: { userId: true },
    });
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    if (notification.userId !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this notification' });
    }
    
    // Update the notification
    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
    
    res.json(updatedNotification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read
router.patch('/read', isAuthenticated, async (req: Request, res: Response) => {
  try {
    // Type assertion with the globally augmented Express User interface
    const userId = (req.user as any)?.id;
    if (!userId) {
      return res.status(400).json({ message: 'User ID not found' });
    }
    
    await prisma.notification.updateMany({
      where: {
        userId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
    
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Failed to mark all notifications as read' });
  }
});

// Delete a specific notification
router.delete('/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    // Type assertion with the globally augmented Express User interface
    const userId = (req.user as any)?.id;
    if (!userId) {
      return res.status(400).json({ message: 'User ID not found' });
    }
    
    // Verify the notification belongs to the user
    const notification = await prisma.notification.findUnique({
      where: { id },
      select: { userId: true },
    });
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    if (notification.userId !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this notification' });
    }
    
    // Delete the notification
    await prisma.notification.delete({
      where: { id },
    });
    
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Failed to delete notification' });
  }
});

// Create a new notification (typically used internally by the server)
router.post('/', async (req: Request, res: Response) => {
  try {
    const data = createNotificationSchema.parse(req.body);
    
    const notification = await prisma.notification.create({
      data,
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            username: true,
            profilePicture: true,
          },
        },
      },
    });
    
    res.status(201).json(notification);
  } catch (error) {
    console.error('Error creating notification:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Invalid notification data', errors: error.errors });
    } else {
      res.status(500).json({ message: 'Failed to create notification' });
    }
  }
});

export default router;