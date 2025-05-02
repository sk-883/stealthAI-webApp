import { prisma } from './prisma';
import type {
  User, Post, Connection, Comment, Experience, Education, PostLike,
  PostWithUser, UserWithConnections, UserWithExperiences, UserWithEducations, UserWithProfile
} from '@shared/schema';
import { Prisma } from '@prisma/client';

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User>;
  updateUser(id: number, data: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User | undefined>;
  
  // Post operations
  getPosts(): Promise<PostWithUser[]>;
  getPostById(id: number): Promise<Post | undefined>;
  getPostsByUserId(userId: number): Promise<Post[]>;
  createPost(post: Omit<Post, 'id' | 'createdAt'>): Promise<Post>;
  updatePost(id: number, data: Partial<Omit<Post, 'id' | 'createdAt'>>): Promise<Post | undefined>;
  deletePost(id: number): Promise<boolean>;
  
  // Connection operations
  getConnections(userId: number): Promise<Connection[]>;
  getPendingConnections(userId: number): Promise<Connection[]>;
  createConnection(connection: Omit<Connection, 'id' | 'createdAt'>): Promise<Connection>;
  updateConnectionStatus(id: number, status: string): Promise<Connection | undefined>;
  deleteConnection(id: number): Promise<boolean>;
  
  // Comment operations
  getCommentsByPostId(postId: number): Promise<Comment[]>;
  createComment(comment: Omit<Comment, 'id' | 'createdAt'>): Promise<Comment>;
  deleteComment(id: number): Promise<boolean>;
  
  // Experience operations
  getExperiencesByUserId(userId: number): Promise<Experience[]>;
  getExperienceById(id: number): Promise<Experience | undefined>;
  createExperience(experience: Omit<Experience, 'id' | 'createdAt'>): Promise<Experience>;
  updateExperience(id: number, data: Partial<Omit<Experience, 'id' | 'createdAt'>>): Promise<Experience | undefined>;
  deleteExperience(id: number): Promise<boolean>;
  
  // Education operations
  getEducationsByUserId(userId: number): Promise<Education[]>;
  getEducationById(id: number): Promise<Education | undefined>;
  createEducation(education: Omit<Education, 'id' | 'createdAt'>): Promise<Education>;
  updateEducation(id: number, data: Partial<Omit<Education, 'id' | 'createdAt'>>): Promise<Education | undefined>;
  deleteEducation(id: number): Promise<boolean>;
  
  // Post Like operations
  getLikesByPostId(postId: number): Promise<PostLike[]>;
  getLikeByPostAndUser(postId: number, userId: number): Promise<PostLike | undefined>;
  createLike(like: Omit<PostLike, 'id' | 'createdAt'>): Promise<PostLike>;
  deleteLike(id: number): Promise<boolean>;
  
  // Extended operations
  getPostsWithUsers(): Promise<PostWithUser[]>;
  getUsersForConnections(userId: number): Promise<User[]>;
}

export class PrismaStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const user = await prisma.user.findUnique({
      where: { id }
    });
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const user = await prisma.user.findUnique({
      where: { username }
    });
    return user || undefined;
  }

  async createUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    return await prisma.user.create({
      data: user
    });
  }

  async updateUser(id: number, data: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User | undefined> {
    try {
      return await prisma.user.update({
        where: { id },
        data
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
        return undefined;
      }
      throw e;
    }
  }

  // Post operations
  async getPosts(): Promise<PostWithUser[]> {
    return await prisma.post.findMany({
      include: {
        user: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    }) as PostWithUser[];
  }

  async getPostById(id: number): Promise<Post | undefined> {
    const post = await prisma.post.findUnique({
      where: { id }
    });
    return post || undefined;
  }

  async getPostsByUserId(userId: number): Promise<Post[]> {
    return await prisma.post.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async createPost(post: Omit<Post, 'id' | 'createdAt'>): Promise<Post> {
    return await prisma.post.create({
      data: post
    });
  }

  async updatePost(id: number, data: Partial<Omit<Post, 'id' | 'createdAt'>>): Promise<Post | undefined> {
    try {
      return await prisma.post.update({
        where: { id },
        data
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
        return undefined;
      }
      throw e;
    }
  }

  async deletePost(id: number): Promise<boolean> {
    try {
      await prisma.post.delete({
        where: { id }
      });
      return true;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
        return false;
      }
      throw e;
    }
  }

  // Connection operations
  async getConnections(userId: number): Promise<Connection[]> {
    return await prisma.connection.findMany({
      where: {
        OR: [
          { userId, status: 'accepted' },
          { connectedUserId: userId, status: 'accepted' }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async getPendingConnections(userId: number): Promise<Connection[]> {
    return await prisma.connection.findMany({
      where: {
        connectedUserId: userId,
        status: 'pending'
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async createConnection(connection: Omit<Connection, 'id' | 'createdAt'>): Promise<Connection> {
    return await prisma.connection.create({
      data: connection
    });
  }

  async updateConnectionStatus(id: number, status: string): Promise<Connection | undefined> {
    try {
      return await prisma.connection.update({
        where: { id },
        data: { status }
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
        return undefined;
      }
      throw e;
    }
  }

  async deleteConnection(id: number): Promise<boolean> {
    try {
      await prisma.connection.delete({
        where: { id }
      });
      return true;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
        return false;
      }
      throw e;
    }
  }

  // Comment operations
  async getCommentsByPostId(postId: number): Promise<Comment[]> {
    return await prisma.comment.findMany({
      where: { postId },
      include: { user: true },
      orderBy: {
        createdAt: 'desc'
      }
    }) as unknown as Comment[];
  }

  async createComment(comment: Omit<Comment, 'id' | 'createdAt'>): Promise<Comment> {
    // First create the comment
    const newComment = await prisma.comment.create({
      data: comment
    });
    
    // Then increment the comments count on the post
    await prisma.post.update({
      where: { id: comment.postId },
      data: { comments: { increment: 1 } }
    });
    
    return newComment;
  }

  async deleteComment(id: number): Promise<boolean> {
    try {
      // First get the comment to find its postId
      const comment = await prisma.comment.findUnique({
        where: { id }
      });
      
      if (!comment) return false;
      
      // Delete the comment
      await prisma.comment.delete({
        where: { id }
      });
      
      // Then decrement the comments count on the post
      await prisma.post.update({
        where: { id: comment.postId },
        data: { comments: { decrement: 1 } }
      });
      
      return true;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
        return false;
      }
      throw e;
    }
  }

  // Experience operations
  async getExperiencesByUserId(userId: number): Promise<Experience[]> {
    return await prisma.experience.findMany({
      where: { userId },
      orderBy: [
        { isCurrentRole: 'desc' },
        { startDate: 'desc' }
      ]
    });
  }

  async getExperienceById(id: number): Promise<Experience | undefined> {
    const experience = await prisma.experience.findUnique({
      where: { id }
    });
    return experience || undefined;
  }

  async createExperience(experience: Omit<Experience, 'id' | 'createdAt'>): Promise<Experience> {
    return await prisma.experience.create({
      data: experience
    });
  }

  async updateExperience(id: number, data: Partial<Omit<Experience, 'id' | 'createdAt'>>): Promise<Experience | undefined> {
    try {
      return await prisma.experience.update({
        where: { id },
        data
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
        return undefined;
      }
      throw e;
    }
  }

  async deleteExperience(id: number): Promise<boolean> {
    try {
      await prisma.experience.delete({
        where: { id }
      });
      return true;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
        return false;
      }
      throw e;
    }
  }

  // Education operations
  async getEducationsByUserId(userId: number): Promise<Education[]> {
    return await prisma.education.findMany({
      where: { userId },
      orderBy: {
        startDate: 'desc'
      }
    });
  }

  async getEducationById(id: number): Promise<Education | undefined> {
    const education = await prisma.education.findUnique({
      where: { id }
    });
    return education || undefined;
  }

  async createEducation(education: Omit<Education, 'id' | 'createdAt'>): Promise<Education> {
    return await prisma.education.create({
      data: education
    });
  }

  async updateEducation(id: number, data: Partial<Omit<Education, 'id' | 'createdAt'>>): Promise<Education | undefined> {
    try {
      return await prisma.education.update({
        where: { id },
        data
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
        return undefined;
      }
      throw e;
    }
  }

  async deleteEducation(id: number): Promise<boolean> {
    try {
      await prisma.education.delete({
        where: { id }
      });
      return true;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
        return false;
      }
      throw e;
    }
  }

  // Post Like operations
  async getLikesByPostId(postId: number): Promise<PostLike[]> {
    return await prisma.postLike.findMany({
      where: { postId }
    });
  }

  async getLikeByPostAndUser(postId: number, userId: number): Promise<PostLike | undefined> {
    const like = await prisma.postLike.findFirst({
      where: {
        postId,
        userId
      }
    });
    return like || undefined;
  }

  async createLike(like: Omit<PostLike, 'id' | 'createdAt'>): Promise<PostLike> {
    // First create the like
    const newLike = await prisma.postLike.create({
      data: like
    });
    
    // Then increment the likes count on the post
    await prisma.post.update({
      where: { id: like.postId },
      data: { likes: { increment: 1 } }
    });
    
    return newLike;
  }

  async deleteLike(id: number): Promise<boolean> {
    try {
      // First get the like to find its postId
      const like = await prisma.postLike.findUnique({
        where: { id }
      });
      
      if (!like) return false;
      
      // Delete the like
      await prisma.postLike.delete({
        where: { id }
      });
      
      // Then decrement the likes count on the post
      await prisma.post.update({
        where: { id: like.postId },
        data: { likes: { decrement: 1 } }
      });
      
      return true;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
        return false;
      }
      throw e;
    }
  }

  // Extended operations
  async getPostsWithUsers(): Promise<PostWithUser[]> {
    return await prisma.post.findMany({
      include: {
        user: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    }) as PostWithUser[];
  }

  async getUsersForConnections(userId: number): Promise<User[]> {
    // Get users that the current user is connected to
    const connections = await prisma.connection.findMany({
      where: {
        OR: [
          { userId },
          { connectedUserId: userId }
        ],
        status: 'accepted'
      }
    });

    // Get the IDs of connected users
    const connectedUserIds = new Set<number>();
    
    for (const connection of connections) {
      if (connection.userId === userId) {
        connectedUserIds.add(connection.connectedUserId);
      } else {
        connectedUserIds.add(connection.userId);
      }
    }

    // Add the current user to exclude
    connectedUserIds.add(userId);

    // Find users who are not connected to the current user
    return await prisma.user.findMany({
      where: {
        id: {
          notIn: Array.from(connectedUserIds)
        }
      },
      take: 5
    });
  }
}

// Export an instance of the PrismaStorage
export const storage = new PrismaStorage();