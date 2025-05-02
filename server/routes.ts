import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./prisma-storage";
import { setupAuth } from "./auth";
import { 
  insertUserSchema, 
  insertPostSchema, 
  insertConnectionSchema, 
  insertCommentSchema,
  insertExperienceSchema,
  insertEducationSchema,
  insertPostLikeSchema
} from "@shared/schema";
import * as z from "zod";
import { ZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app, storage as any);

  // The isAuthenticated middleware checks if the user is authenticated
  const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) {
      return next();
    }
    return res.status(401).json({ message: "Not authenticated" });
  };

  // Helper function to validate request body against zod schema
  const validateBody = <T extends z.ZodType>(schema: T) => {
    return (req: Request, res: Response, next: Function) => {
      try {
        req.body = schema.parse(req.body);
        next();
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({
            message: "Validation error",
            errors: error.errors,
          });
        }
        return res.status(400).json({ message: "Invalid request body" });
      }
    };
  };

  // User routes
  app.get("/api/users", isAuthenticated, async (req, res) => {
    try {
      // Get all users
      const userId = (req.user as any).id;
      const users = await storage.getUsersForConnections(userId);
      // Remove passwords from response
      const usersWithoutPasswords = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      res.json(usersWithoutPasswords);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Error fetching users" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Error fetching user" });
    }
  });

  app.patch(
    "/api/users/:id",
    isAuthenticated,
    async (req, res) => {
      try {
        const userId = parseInt(req.params.id);
        
        // Filter out password from updates through the API
        const { password, ...updateData } = req.body;
        
        const updatedUser = await storage.updateUser(userId, updateData);
        
        if (!updatedUser) {
          return res.status(404).json({ message: "User not found" });
        }
        
        // Remove password from response
        const { password: _, ...userWithoutPassword } = updatedUser;
        res.json(userWithoutPassword);
      } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Error updating user" });
      }
    }
  );

  // Post routes
  app.get("/api/posts", async (req, res) => {
    try {
      const posts = await storage.getPosts();
      res.json(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ message: "Error fetching posts" });
    }
  });

  app.get("/api/posts/:id", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const post = await storage.getPostById(postId);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      res.json(post);
    } catch (error) {
      console.error("Error fetching post:", error);
      res.status(500).json({ message: "Error fetching post" });
    }
  });

  app.get("/api/users/:userId/posts", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const posts = await storage.getPostsByUserId(userId);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching user posts:", error);
      res.status(500).json({ message: "Error fetching user posts" });
    }
  });

  app.post(
    "/api/posts",
    isAuthenticated,
    validateBody(insertPostSchema.omit({ userId: true })),
    async (req, res) => {
      try {
        const userId = (req.user as any).id;
        const post = await storage.createPost({
          ...req.body,
          userId,
        });
        res.status(201).json(post);
      } catch (error) {
        console.error("Error creating post:", error);
        res.status(500).json({ message: "Error creating post" });
      }
    }
  );

  app.patch(
    "/api/posts/:id",
    isAuthenticated,
    async (req, res) => {
      try {
        const postId = parseInt(req.params.id);
        const post = await storage.getPostById(postId);
        
        if (!post) {
          return res.status(404).json({ message: "Post not found" });
        }
        
        // Users can only update their own posts
        if (post.userId !== (req.user as any).id) {
          return res.status(403).json({ message: "Forbidden" });
        }
        
        const updatedPost = await storage.updatePost(postId, req.body);
        res.json(updatedPost);
      } catch (error) {
        console.error("Error updating post:", error);
        res.status(500).json({ message: "Error updating post" });
      }
    }
  );

  app.delete(
    "/api/posts/:id",
    isAuthenticated,
    async (req, res) => {
      try {
        const postId = parseInt(req.params.id);
        const post = await storage.getPostById(postId);
        
        if (!post) {
          return res.status(404).json({ message: "Post not found" });
        }
        
        // Users can only delete their own posts
        if (post.userId !== (req.user as any).id) {
          return res.status(403).json({ message: "Forbidden" });
        }
        
        await storage.deletePost(postId);
        res.status(204).end();
      } catch (error) {
        console.error("Error deleting post:", error);
        res.status(500).json({ message: "Error deleting post" });
      }
    }
  );

  // Connection routes
  app.get("/api/connections", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const connections = await storage.getConnections(userId);
      res.json(connections);
    } catch (error) {
      console.error("Error fetching connections:", error);
      res.status(500).json({ message: "Error fetching connections" });
    }
  });

  app.get("/api/connections/pending", isAuthenticated, async (req, res) => {
    try {
      // Since we removed authentication, we'll use a default user (1)
      const userId = 1;
      const pendingConnections = await storage.getPendingConnections(userId);
      res.json(pendingConnections);
    } catch (error) {
      console.error("Error fetching pending connections:", error);
      res.status(500).json({ message: "Error fetching pending connections" });
    }
  });

  app.post(
    "/api/connections",
    isAuthenticated,
    validateBody(insertConnectionSchema.omit({ userId: true, status: true })),
    async (req, res) => {
      try {
        // Since we removed authentication, we'll use a default user (1)
        const userId = 1;
        
        // Check if connection already exists
        const existingConnections = await storage.getConnections(userId);
        const alreadyConnected = existingConnections.some(
          conn => conn.connectedUserId === req.body.connectedUserId
        );
        
        if (alreadyConnected) {
          return res.status(400).json({ message: "Connection already exists" });
        }
        
        const connection = await storage.createConnection({
          userId,
          connectedUserId: req.body.connectedUserId,
          status: "pending",
        });
        
        res.status(201).json(connection);
      } catch (error) {
        console.error("Error creating connection:", error);
        res.status(500).json({ message: "Error creating connection" });
      }
    }
  );

  app.patch(
    "/api/connections/:id",
    isAuthenticated,
    async (req, res) => {
      try {
        const connectionId = parseInt(req.params.id);
        // Since we removed authentication, we'll use a default user (1)
        const userId = 1;
        
        // Get the connection
        const connections = await storage.getPendingConnections(userId);
        const connection = connections.find(conn => conn.id === connectionId);
        
        if (!connection) {
          return res.status(404).json({ message: "Connection not found or not pending" });
        }
        
        // Update the connection status
        const { status } = req.body;
        if (!status || !["accepted", "rejected"].includes(status)) {
          return res.status(400).json({ message: "Invalid status" });
        }
        
        const updatedConnection = await storage.updateConnectionStatus(connectionId, status);
        
        if (status === "accepted") {
          // Create reverse connection
          await storage.createConnection({
            userId: connection.connectedUserId,
            connectedUserId: connection.userId,
            status: "accepted",
          });
        }
        
        res.json(updatedConnection);
      } catch (error) {
        console.error("Error updating connection:", error);
        res.status(500).json({ message: "Error updating connection" });
      }
    }
  );

  app.delete(
    "/api/connections/:id",
    isAuthenticated,
    async (req, res) => {
      try {
        const connectionId = parseInt(req.params.id);
        // Since we removed authentication, we'll use a default user (1)
        const userId = 1;
        
        // Get all connections for the user
        const connections = await storage.getConnections(userId);
        const connection = connections.find(conn => conn.id === connectionId);
        
        if (!connection) {
          return res.status(404).json({ message: "Connection not found" });
        }
        
        await storage.deleteConnection(connectionId);
        
        // Also delete the reverse connection
        const userConnections = await storage.getConnections(connection.connectedUserId);
        const reverseConnection = userConnections.find(conn => conn.connectedUserId === userId);
        
        if (reverseConnection) {
          await storage.deleteConnection(reverseConnection.id);
        }
        
        res.status(204).end();
      } catch (error) {
        console.error("Error deleting connection:", error);
        res.status(500).json({ message: "Error deleting connection" });
      }
    }
  );

  // Experience routes
  app.get("/api/users/:id/experiences", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const experiences = await storage.getExperiencesByUserId(userId);
      res.json(experiences);
    } catch (error) {
      console.error("Error fetching experiences:", error);
      res.status(500).json({ message: "Error fetching experiences" });
    }
  });
  
  app.post(
    "/api/experiences",
    isAuthenticated,
    validateBody(insertExperienceSchema.omit({ userId: true })),
    async (req, res) => {
      try {
        // Since we removed authentication, we'll use a default user (1)
        const userId = 1;
        
        const experience = await storage.createExperience({
          ...req.body,
          userId,
        });
        
        res.status(201).json(experience);
      } catch (error) {
        console.error("Error creating experience:", error);
        res.status(500).json({ message: "Error creating experience" });
      }
    }
  );
  
  app.patch(
    "/api/experiences/:id",
    isAuthenticated,
    async (req, res) => {
      try {
        const experienceId = parseInt(req.params.id);
        // Since we removed authentication, we'll use a default user (1)
        const userId = 1;
        
        // Get the experience to verify ownership
        const experience = await storage.getExperienceById(experienceId);
        
        if (!experience) {
          return res.status(404).json({ message: "Experience not found" });
        }
        
        if (experience.userId !== userId) {
          return res.status(403).json({ message: "Not authorized to update this experience" });
        }
        
        const updatedExperience = await storage.updateExperience(experienceId, req.body);
        res.json(updatedExperience);
      } catch (error) {
        console.error("Error updating experience:", error);
        res.status(500).json({ message: "Error updating experience" });
      }
    }
  );
  
  app.delete(
    "/api/experiences/:id",
    isAuthenticated,
    async (req, res) => {
      try {
        const experienceId = parseInt(req.params.id);
        // Since we removed authentication, we'll use a default user (1)
        const userId = 1;
        
        // Get the experience to verify ownership
        const experience = await storage.getExperienceById(experienceId);
        
        if (!experience) {
          return res.status(404).json({ message: "Experience not found" });
        }
        
        if (experience.userId !== userId) {
          return res.status(403).json({ message: "Not authorized to delete this experience" });
        }
        
        const success = await storage.deleteExperience(experienceId);
        
        if (success) {
          res.status(204).end();
        } else {
          res.status(500).json({ message: "Failed to delete experience" });
        }
      } catch (error) {
        console.error("Error deleting experience:", error);
        res.status(500).json({ message: "Error deleting experience" });
      }
    }
  );
  
  // Education routes
  app.get("/api/users/:id/educations", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const educations = await storage.getEducationsByUserId(userId);
      res.json(educations);
    } catch (error) {
      console.error("Error fetching educations:", error);
      res.status(500).json({ message: "Error fetching educations" });
    }
  });
  
  app.post(
    "/api/educations",
    isAuthenticated,
    validateBody(insertEducationSchema.omit({ userId: true })),
    async (req, res) => {
      try {
        const userId = (req.user as any).id;
        
        const education = await storage.createEducation({
          ...req.body,
          userId,
        });
        
        res.status(201).json(education);
      } catch (error) {
        console.error("Error creating education:", error);
        res.status(500).json({ message: "Error creating education" });
      }
    }
  );
  
  app.patch(
    "/api/educations/:id",
    isAuthenticated,
    async (req, res) => {
      try {
        const educationId = parseInt(req.params.id);
        const userId = (req.user as any).id;
        
        // Get the education to verify ownership
        const education = await storage.getEducationById(educationId);
        
        if (!education) {
          return res.status(404).json({ message: "Education not found" });
        }
        
        if (education.userId !== userId) {
          return res.status(403).json({ message: "Not authorized to update this education" });
        }
        
        const updatedEducation = await storage.updateEducation(educationId, req.body);
        res.json(updatedEducation);
      } catch (error) {
        console.error("Error updating education:", error);
        res.status(500).json({ message: "Error updating education" });
      }
    }
  );
  
  app.delete(
    "/api/educations/:id",
    isAuthenticated,
    async (req, res) => {
      try {
        const educationId = parseInt(req.params.id);
        const userId = (req.user as any).id;
        
        // Get the education to verify ownership
        const education = await storage.getEducationById(educationId);
        
        if (!education) {
          return res.status(404).json({ message: "Education not found" });
        }
        
        if (education.userId !== userId) {
          return res.status(403).json({ message: "Not authorized to delete this education" });
        }
        
        const success = await storage.deleteEducation(educationId);
        
        if (success) {
          res.status(204).end();
        } else {
          res.status(500).json({ message: "Failed to delete education" });
        }
      } catch (error) {
        console.error("Error deleting education:", error);
        res.status(500).json({ message: "Error deleting education" });
      }
    }
  );

  // Post Like routes
  app.get("/api/posts/:postId/likes", async (req, res) => {
    try {
      const postId = parseInt(req.params.postId);
      const likes = await storage.getLikesByPostId(postId);
      res.json(likes);
    } catch (error) {
      console.error("Error fetching post likes:", error);
      res.status(500).json({ message: "Error fetching post likes" });
    }
  });

  app.post(
    "/api/posts/:postId/likes",
    isAuthenticated,
    async (req, res) => {
      try {
        const postId = parseInt(req.params.postId);
        const userId = (req.user as any).id;
        
        // Check if post exists
        const post = await storage.getPostById(postId);
        if (!post) {
          return res.status(404).json({ message: "Post not found" });
        }
        
        // Check if user already liked the post
        const existingLike = await storage.getLikeByPostAndUser(postId, userId);
        if (existingLike) {
          return res.status(400).json({ message: "User already liked this post" });
        }
        
        const like = await storage.createLike({
          postId,
          userId
        });
        
        res.status(201).json(like);
      } catch (error) {
        console.error("Error liking post:", error);
        res.status(500).json({ message: "Error liking post" });
      }
    }
  );
  
  app.delete(
    "/api/posts/:postId/likes",
    isAuthenticated,
    async (req, res) => {
      try {
        const postId = parseInt(req.params.postId);
        const userId = (req.user as any).id;
        
        // Check if like exists
        const existingLike = await storage.getLikeByPostAndUser(postId, userId);
        if (!existingLike) {
          return res.status(404).json({ message: "Like not found" });
        }
        
        // Users can only remove their own likes
        if (existingLike.userId !== userId) {
          return res.status(403).json({ message: "Forbidden" });
        }
        
        const deleted = await storage.deleteLike(existingLike.id);
        
        if (deleted) {
          res.status(204).end();
        } else {
          res.status(500).json({ message: "Error removing like" });
        }
      } catch (error) {
        console.error("Error removing like:", error);
        res.status(500).json({ message: "Error removing like" });
      }
    }
  );

  // Comment routes
  app.get("/api/posts/:postId/comments", async (req, res) => {
    try {
      const postId = parseInt(req.params.postId);
      const comments = await storage.getCommentsByPostId(postId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Error fetching comments" });
    }
  });

  app.post(
    "/api/posts/:postId/comments",
    isAuthenticated,
    validateBody(insertCommentSchema.omit({ userId: true, postId: true })),
    async (req, res) => {
      try {
        const postId = parseInt(req.params.postId);
        const userId = (req.user as any).id;
        
        const post = await storage.getPostById(postId);
        if (!post) {
          return res.status(404).json({ message: "Post not found" });
        }
        
        const comment = await storage.createComment({
          postId,
          userId,
          content: req.body.content,
        });
        
        res.status(201).json(comment);
      } catch (error) {
        console.error("Error creating comment:", error);
        res.status(500).json({ message: "Error creating comment" });
      }
    }
  );

  app.delete(
    "/api/comments/:id",
    isAuthenticated,
    async (req, res) => {
      try {
        const commentId = parseInt(req.params.id);
        const userId = (req.user as any).id;
        
        // Get the comment
        const comments = await storage.getCommentsByPostId(0); // This is inefficient, but works for now
        const comment = comments.find(c => c.id === commentId);
        
        if (!comment) {
          return res.status(404).json({ message: "Comment not found" });
        }
        
        // Users can only delete their own comments
        if (comment.userId !== userId) {
          return res.status(403).json({ message: "Forbidden" });
        }
        
        await storage.deleteComment(commentId);
        res.status(204).end();
      } catch (error) {
        console.error("Error deleting comment:", error);
        res.status(500).json({ message: "Error deleting comment" });
      }
    }
  );

  // Add route to get a specific experience
  app.get("/api/experiences/:id", async (req, res) => {
    try {
      const experienceId = parseInt(req.params.id);
      const experience = await storage.getExperienceById(experienceId);
      
      if (!experience) {
        return res.status(404).json({ message: "Experience not found" });
      }
      
      res.json(experience);
    } catch (error) {
      console.error("Error fetching experience:", error);
      res.status(500).json({ message: "Error fetching experience" });
    }
  });

  // Add route to get a specific education
  app.get("/api/educations/:id", async (req, res) => {
    try {
      const educationId = parseInt(req.params.id);
      const education = await storage.getEducationById(educationId);
      
      if (!education) {
        return res.status(404).json({ message: "Education not found" });
      }
      
      res.json(education);
    } catch (error) {
      console.error("Error fetching education:", error);
      res.status(500).json({ message: "Error fetching education" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
