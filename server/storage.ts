import { 
  type User, type InsertUser,
  type Post, type InsertPost,
  type Connection, type InsertConnection,
  type Comment, type InsertComment,
  type Experience, type InsertExperience,
  type Education, type InsertEducation,
  type PostLike, type InsertPostLike,
  type PostWithUser, type UserWithConnections, type UserWithExperiences, type UserWithEducations
} from "@shared/schema";
import { prisma } from "./prisma";
import { Prisma } from "@prisma/client";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined>;
  
  // Post operations
  getPosts(): Promise<PostWithUser[]>;
  getPostById(id: number): Promise<Post | undefined>;
  getPostsByUserId(userId: number): Promise<Post[]>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: number, data: Partial<InsertPost>): Promise<Post | undefined>;
  deletePost(id: number): Promise<boolean>;
  
  // Connection operations
  getConnections(userId: number): Promise<Connection[]>;
  getPendingConnections(userId: number): Promise<Connection[]>;
  createConnection(connection: InsertConnection): Promise<Connection>;
  updateConnectionStatus(id: number, status: string): Promise<Connection | undefined>;
  deleteConnection(id: number): Promise<boolean>;
  
  // Comment operations
  getCommentsByPostId(postId: number): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  deleteComment(id: number): Promise<boolean>;
  
  // Experience operations
  getExperiencesByUserId(userId: number): Promise<Experience[]>;
  getExperienceById(id: number): Promise<Experience | undefined>;
  createExperience(experience: InsertExperience): Promise<Experience>;
  updateExperience(id: number, data: Partial<InsertExperience>): Promise<Experience | undefined>;
  deleteExperience(id: number): Promise<boolean>;
  
  // Education operations
  getEducationsByUserId(userId: number): Promise<Education[]>;
  getEducationById(id: number): Promise<Education | undefined>;
  createEducation(education: InsertEducation): Promise<Education>;
  updateEducation(id: number, data: Partial<InsertEducation>): Promise<Education | undefined>;
  deleteEducation(id: number): Promise<boolean>;
  
  // Post Like operations
  getLikesByPostId(postId: number): Promise<PostLike[]>;
  getLikeByPostAndUser(postId: number, userId: number): Promise<PostLike | undefined>;
  createLike(like: InsertPostLike): Promise<PostLike>;
  deleteLike(id: number): Promise<boolean>;
  
  // Extended operations
  getPostsWithUsers(): Promise<PostWithUser[]>;
  getUsersForConnections(userId: number): Promise<User[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return prisma.user.findUnique({
      where: { id }
    }) as Promise<User | undefined>;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return prisma.user.findUnique({
      where: { username }
    }) as Promise<User | undefined>;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    return prisma.user.create({
      data: insertUser
    }) as Promise<User>;
  }

  async updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined> {
    return prisma.user.update({
      where: { id },
      data
    }) as Promise<User>;
  }

  // Post operations
  async getPosts(): Promise<PostWithUser[]> {
    return this.getPostsWithUsers();
  }

  async getPostById(id: number): Promise<Post | undefined> {
    return prisma.post.findUnique({
      where: { id }
    }) as Promise<Post | undefined>;
  }

  async getPostsByUserId(userId: number): Promise<Post[]> {
    return prisma.post.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    }) as Promise<Post[]>;
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    return prisma.post.create({
      data: insertPost
    }) as Promise<Post>;
  }

  async updatePost(id: number, data: Partial<InsertPost>): Promise<Post | undefined> {
    return prisma.post.update({
      where: { id },
      data
    }) as Promise<Post>;
  }

  async deletePost(id: number): Promise<boolean> {
    try {
      await prisma.post.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      console.error('Error deleting post:', error);
      return false;
    }
  }

  // Connection operations
  async getConnections(userId: number): Promise<Connection[]> {
    return prisma.connection.findMany({
      where: {
        userId,
        status: 'accepted'
      }
    }) as Promise<Connection[]>;
  }

  async getPendingConnections(userId: number): Promise<Connection[]> {
    return prisma.connection.findMany({
      where: {
        connectedUserId: userId,
        status: 'pending'
      }
    }) as Promise<Connection[]>;
  }

  async createConnection(insertConnection: InsertConnection): Promise<Connection> {
    return prisma.connection.create({
      data: insertConnection
    }) as Promise<Connection>;
  }

  async updateConnectionStatus(id: number, status: string): Promise<Connection | undefined> {
    return prisma.connection.update({
      where: { id },
      data: { status }
    }) as Promise<Connection>;
  }

  async deleteConnection(id: number): Promise<boolean> {
    try {
      await prisma.connection.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      console.error('Error deleting connection:', error);
      return false;
    }
  }

  // Comment operations
  async getCommentsByPostId(postId: number): Promise<Comment[]> {
    return prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: 'desc' }
    }) as Promise<Comment[]>;
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    // Begin transaction
    return prisma.$transaction(async (tx) => {
      // Create the comment
      const comment = await tx.comment.create({
        data: insertComment
      });
      
      // Increment the post's comment count
      await tx.post.update({
        where: { id: insertComment.postId },
        data: {
          comments: {
            increment: 1
          }
        }
      });
      
      return comment as Comment;
    });
  }

  async deleteComment(id: number): Promise<boolean> {
    try {
      // Find the comment to get the postId
      const comment = await prisma.comment.findUnique({
        where: { id },
        select: { postId: true }
      });
      
      if (!comment) return false;
      
      // Begin transaction
      await prisma.$transaction(async (tx) => {
        // Delete the comment
        await tx.comment.delete({
          where: { id }
        });
        
        // Decrement the post's comment count
        await tx.post.update({
          where: { id: comment.postId },
          data: {
            comments: {
              decrement: 1
            }
          }
        });
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting comment:', error);
      return false;
    }
  }

  // Experience operations
  async getExperiencesByUserId(userId: number): Promise<Experience[]> {
    return prisma.experience.findMany({
      where: { userId },
      orderBy: { startDate: 'desc' }
    }) as Promise<Experience[]>;
  }

  async getExperienceById(id: number): Promise<Experience | undefined> {
    return prisma.experience.findUnique({
      where: { id }
    }) as Promise<Experience | undefined>;
  }

  async createExperience(insertExperience: InsertExperience): Promise<Experience> {
    return prisma.experience.create({
      data: insertExperience
    }) as Promise<Experience>;
  }

  async updateExperience(id: number, data: Partial<InsertExperience>): Promise<Experience | undefined> {
    return prisma.experience.update({
      where: { id },
      data
    }) as Promise<Experience>;
  }

  async deleteExperience(id: number): Promise<boolean> {
    try {
      await prisma.experience.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      console.error('Error deleting experience:', error);
      return false;
    }
  }

  // Education operations
  async getEducationsByUserId(userId: number): Promise<Education[]> {
    return db
      .select()
      .from(educations)
      .where(eq(educations.userId, userId))
      .orderBy(desc(educations.startDate));
  }

  async getEducationById(id: number): Promise<Education | undefined> {
    const [education] = await db
      .select()
      .from(educations)
      .where(eq(educations.id, id));
    return education;
  }

  async createEducation(insertEducation: InsertEducation): Promise<Education> {
    const [education] = await db
      .insert(educations)
      .values(insertEducation)
      .returning();
    return education;
  }

  async updateEducation(id: number, data: Partial<InsertEducation>): Promise<Education | undefined> {
    const [updatedEducation] = await db
      .update(educations)
      .set(data)
      .where(eq(educations.id, id))
      .returning();
    return updatedEducation;
  }

  async deleteEducation(id: number): Promise<boolean> {
    const result = await db
      .delete(educations)
      .where(eq(educations.id, id))
      .returning({ id: educations.id });
    return result.length > 0;
  }

  // Post Like operations
  async getLikesByPostId(postId: number): Promise<PostLike[]> {
    return db
      .select()
      .from(postLikes)
      .where(eq(postLikes.postId, postId));
  }

  async getLikeByPostAndUser(postId: number, userId: number): Promise<PostLike | undefined> {
    const [like] = await db
      .select()
      .from(postLikes)
      .where(
        and(
          eq(postLikes.postId, postId),
          eq(postLikes.userId, userId)
        )
      );
    return like;
  }

  async createLike(insertLike: InsertPostLike): Promise<PostLike> {
    const [like] = await db
      .insert(postLikes)
      .values(insertLike)
      .returning();
    
    // Update like count
    await db
      .update(posts)
      .set({ likes: db.raw(`${posts.name}.likes + 1`) })
      .where(eq(posts.id, insertLike.postId));
    
    return like;
  }

  async deleteLike(id: number): Promise<boolean> {
    const [deletedLike] = await db
      .delete(postLikes)
      .where(eq(postLikes.id, id))
      .returning({
        id: postLikes.id,
        postId: postLikes.postId
      });
    
    if (deletedLike) {
      // Update like count
      await db
        .update(posts)
        .set({ likes: db.raw(`${posts.name}.likes - 1`) })
        .where(eq(posts.id, deletedLike.postId));
      return true;
    }
    
    return false;
  }

  // Extended operations
  async getPostsWithUsers(): Promise<PostWithUser[]> {
    const postsData = await db.select().from(posts).orderBy(desc(posts.createdAt));
    const result: PostWithUser[] = [];
    
    for (const post of postsData) {
      const [user] = await db.select().from(users).where(eq(users.id, post.userId));
      if (user) {
        result.push({
          ...post,
          user
        });
      }
    }
    
    return result;
  }

  async getUsersForConnections(userId: number): Promise<User[]> {
    // Get all user IDs that the current user is connected to
    const userConnections = await db
      .select({ connectedUserId: connections.connectedUserId })
      .from(connections)
      .where(
        and(
          eq(connections.userId, userId),
          eq(connections.status, "accepted")
        )
      );
    
    // Get array of connected user IDs
    const connectedUserIds = userConnections.map(conn => conn.connectedUserId);
    
    // Get all users who are not the current user and not already connected
    if (connectedUserIds.length > 0) {
      return db
        .select()
        .from(users)
        .where(
          and(
            ne(users.id, userId),
            db.raw(`${users.name}.id NOT IN (${connectedUserIds.join(', ')})`)
          )
        )
        .limit(5);
    } else {
      // If no connections, return all users except current user
      return db
        .select()
        .from(users)
        .where(ne(users.id, userId))
        .limit(5);
    }
  }
}

// For development, use the in-memory storage
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private posts: Map<number, Post>;
  private connections: Map<number, Connection>;
  private comments: Map<number, Comment>;
  private experiences: Map<number, Experience>;
  private educations: Map<number, Education>;
  private postLikes: Map<number, PostLike>;
  currentUserId: number;
  currentPostId: number;
  currentConnectionId: number;
  currentCommentId: number;
  currentExperienceId: number;
  currentEducationId: number;
  currentPostLikeId: number;

  constructor() {
    this.users = new Map();
    this.posts = new Map();
    this.connections = new Map();
    this.comments = new Map();
    this.experiences = new Map();
    this.educations = new Map();
    this.postLikes = new Map();
    this.currentUserId = 1;
    this.currentPostId = 1;
    this.currentConnectionId = 1;
    this.currentCommentId = 1;
    this.currentExperienceId = 1;
    this.currentEducationId = 1;
    this.currentPostLikeId = 1;
    
    // Add demo data
    this.initDemoData();
  }

  // Initialize demo data
  private async initDemoData() {
    // Create demo users
    const user1 = await this.createUser({
      username: "alexjohnson",
      password: "password123",
      name: "Alex Johnson",
      headline: "Software Engineer at TechCorp",
      bio: "Passionate about web development and new technologies",
      profilePicture: `https://randomuser.me/api/portraits/men/32.jpg`,
      coverPicture: ""
    });

    const user2 = await this.createUser({
      username: "emilychen",
      password: "password123",
      name: "Emily Chen",
      headline: "UX Designer at DesignStudio",
      bio: "Creating beautiful user experiences",
      profilePicture: `https://randomuser.me/api/portraits/women/28.jpg`,
      coverPicture: ""
    });

    const user3 = await this.createUser({
      username: "marcusjohnson",
      password: "password123",
      name: "Marcus Johnson",
      headline: "Senior Software Engineer at TechCorp",
      bio: "Full-stack developer with a passion for scalable solutions",
      profilePicture: `https://randomuser.me/api/portraits/men/45.jpg`,
      coverPicture: ""
    });

    const user4 = await this.createUser({
      username: "sarahwilliams",
      password: "password123",
      name: "Sarah Williams",
      headline: "Product Manager at TechCorp",
      bio: "Building products people love",
      profilePicture: `https://randomuser.me/api/portraits/women/56.jpg`,
      coverPicture: ""
    });

    const user5 = await this.createUser({
      username: "michaelthompson",
      password: "password123",
      name: "Michael Thompson",
      headline: "Frontend Developer at WebSolutions",
      bio: "Creating engaging user interfaces",
      profilePicture: `https://randomuser.me/api/portraits/men/72.jpg`,
      coverPicture: ""
    });

    const user6 = await this.createUser({
      username: "jenniferlee",
      password: "password123",
      name: "Jennifer Lee", 
      headline: "Data Scientist at AnalyticsPro",
      bio: "Turning data into insights",
      profilePicture: `https://randomuser.me/api/portraits/women/42.jpg`,
      coverPicture: ""
    });

    // Create demo posts
    await this.createPost({
      userId: user2.id,
      content: "Just finished a new design system for our mobile app! Here's a preview of some components. Would love your feedback! #UXDesign #MobileApp",
      imageUrl: ""
    });

    await this.createPost({
      userId: user3.id,
      content: "Excited to announce that we've just released our new open-source framework for building scalable web applications! Check out the documentation and let us know what you think.\n\n👉 github.com/techcorp/framework\n\n#WebDevelopment #OpenSource #JavaScript",
      imageUrl: ""
    });

    await this.createPost({
      userId: user1.id,
      content: "Just wrapped up an amazing conference on Web3 technologies. So many exciting possibilities ahead! #WebDev #Innovation",
      imageUrl: ""
    });

    // Create demo connections
    await this.createConnection({
      userId: user1.id,
      connectedUserId: user2.id,
      status: "accepted"
    });

    await this.createConnection({
      userId: user1.id,
      connectedUserId: user3.id,
      status: "accepted"
    });

    await this.createConnection({
      userId: user2.id,
      connectedUserId: user1.id,
      status: "accepted"
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Post operations
  async getPosts(): Promise<PostWithUser[]> {
    return this.getPostsWithUsers();
  }

  async getPostById(id: number): Promise<Post | undefined> {
    return this.posts.get(id);
  }

  async getPostsByUserId(userId: number): Promise<Post[]> {
    return Array.from(this.posts.values())
      .filter(post => post.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const id = this.currentPostId++;
    const now = new Date();
    const post: Post = { 
      ...insertPost, 
      id, 
      likes: 0, 
      comments: 0, 
      shares: 0, 
      createdAt: now 
    };
    this.posts.set(id, post);
    return post;
  }

  async updatePost(id: number, data: Partial<InsertPost>): Promise<Post | undefined> {
    const post = this.posts.get(id);
    if (!post) return undefined;
    
    const updatedPost = { ...post, ...data };
    this.posts.set(id, updatedPost);
    return updatedPost;
  }

  async deletePost(id: number): Promise<boolean> {
    return this.posts.delete(id);
  }

  // Connection operations
  async getConnections(userId: number): Promise<Connection[]> {
    return Array.from(this.connections.values())
      .filter(connection => 
        connection.userId === userId && 
        connection.status === "accepted"
      );
  }

  async getPendingConnections(userId: number): Promise<Connection[]> {
    return Array.from(this.connections.values())
      .filter(connection => 
        connection.connectedUserId === userId && 
        connection.status === "pending"
      );
  }

  async createConnection(insertConnection: InsertConnection): Promise<Connection> {
    const id = this.currentConnectionId++;
    const now = new Date();
    const connection: Connection = { ...insertConnection, id, createdAt: now };
    this.connections.set(id, connection);
    return connection;
  }

  async updateConnectionStatus(id: number, status: string): Promise<Connection | undefined> {
    const connection = this.connections.get(id);
    if (!connection) return undefined;
    
    const updatedConnection = { ...connection, status };
    this.connections.set(id, updatedConnection);
    return updatedConnection;
  }

  async deleteConnection(id: number): Promise<boolean> {
    return this.connections.delete(id);
  }

  // Comment operations
  async getCommentsByPostId(postId: number): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter(comment => comment.postId === postId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = this.currentCommentId++;
    const now = new Date();
    const comment: Comment = { ...insertComment, id, createdAt: now };
    this.comments.set(id, comment);
    
    // Update comment count
    const post = this.posts.get(insertComment.postId);
    if (post) {
      this.posts.set(post.id, {
        ...post,
        comments: post.comments + 1
      });
    }
    
    return comment;
  }

  async deleteComment(id: number): Promise<boolean> {
    const comment = this.comments.get(id);
    if (!comment) return false;
    
    const deleted = this.comments.delete(id);
    
    // Update comment count
    if (deleted) {
      const post = this.posts.get(comment.postId);
      if (post) {
        this.posts.set(post.id, {
          ...post,
          comments: post.comments - 1
        });
      }
    }
    
    return deleted;
  }

  // Experience operations
  async getExperiencesByUserId(userId: number): Promise<Experience[]> {
    return Array.from(this.experiences.values())
      .filter(experience => experience.userId === userId)
      .sort((a, b) => {
        // Compare start dates (most recent first)
        const aDate = a.startDate || '';
        const bDate = b.startDate || '';
        return bDate.localeCompare(aDate);
      });
  }

  async getExperienceById(id: number): Promise<Experience | undefined> {
    return this.experiences.get(id);
  }

  async createExperience(insertExperience: InsertExperience): Promise<Experience> {
    const id = this.currentExperienceId++;
    const now = new Date();
    const experience: Experience = { 
      ...insertExperience, 
      id, 
      createdAt: now 
    };
    this.experiences.set(id, experience);
    return experience;
  }

  async updateExperience(id: number, data: Partial<InsertExperience>): Promise<Experience | undefined> {
    const experience = this.experiences.get(id);
    if (!experience) return undefined;
    
    const updatedExperience = { ...experience, ...data };
    this.experiences.set(id, updatedExperience);
    return updatedExperience;
  }

  async deleteExperience(id: number): Promise<boolean> {
    return this.experiences.delete(id);
  }

  // Education operations
  async getEducationsByUserId(userId: number): Promise<Education[]> {
    return Array.from(this.educations.values())
      .filter(education => education.userId === userId)
      .sort((a, b) => {
        // Compare start dates (most recent first)
        const aDate = a.startDate || '';
        const bDate = b.startDate || '';
        return bDate.localeCompare(aDate);
      });
  }

  async getEducationById(id: number): Promise<Education | undefined> {
    return this.educations.get(id);
  }

  async createEducation(insertEducation: InsertEducation): Promise<Education> {
    const id = this.currentEducationId++;
    const now = new Date();
    const education: Education = { 
      ...insertEducation, 
      id, 
      createdAt: now 
    };
    this.educations.set(id, education);
    return education;
  }

  async updateEducation(id: number, data: Partial<InsertEducation>): Promise<Education | undefined> {
    const education = this.educations.get(id);
    if (!education) return undefined;
    
    const updatedEducation = { ...education, ...data };
    this.educations.set(id, updatedEducation);
    return updatedEducation;
  }

  async deleteEducation(id: number): Promise<boolean> {
    return this.educations.delete(id);
  }

  // Post Like operations
  async getLikesByPostId(postId: number): Promise<PostLike[]> {
    return Array.from(this.postLikes.values())
      .filter(like => like.postId === postId);
  }

  async getLikeByPostAndUser(postId: number, userId: number): Promise<PostLike | undefined> {
    return Array.from(this.postLikes.values()).find(
      like => like.postId === postId && like.userId === userId
    );
  }

  async createLike(insertLike: InsertPostLike): Promise<PostLike> {
    const id = this.currentPostLikeId++;
    const now = new Date();
    const like: PostLike = { ...insertLike, id, createdAt: now };
    this.postLikes.set(id, like);
    
    // Update like count
    const post = this.posts.get(insertLike.postId);
    if (post) {
      this.posts.set(post.id, {
        ...post,
        likes: post.likes + 1
      });
    }
    
    return like;
  }

  async deleteLike(id: number): Promise<boolean> {
    const like = this.postLikes.get(id);
    if (!like) return false;
    
    const deleted = this.postLikes.delete(id);
    
    // Update like count
    if (deleted) {
      const post = this.posts.get(like.postId);
      if (post) {
        this.posts.set(post.id, {
          ...post,
          likes: post.likes - 1
        });
      }
    }
    
    return deleted;
  }

  // Extended operations
  async getPostsWithUsers(): Promise<PostWithUser[]> {
    const postsArray = Array.from(this.posts.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return postsArray.map(post => {
      const user = this.users.get(post.userId);
      if (!user) {
        throw new Error(`User with ID ${post.userId} not found for post ${post.id}`);
      }
      return {
        ...post,
        user
      };
    });
  }

  async getUsersForConnections(userId: number): Promise<User[]> {
    // Get all user IDs that the current user is connected to
    const userConnections = Array.from(this.connections.values())
      .filter(connection => 
        connection.userId === userId && 
        connection.status === "accepted"
      )
      .map(connection => connection.connectedUserId);
    
    // Add the user's own ID to exclude from suggestions
    userConnections.push(userId);
    
    // Get all users who are not the current user and not already connected
    return Array.from(this.users.values())
      .filter(user => !userConnections.includes(user.id))
      .slice(0, 5); // Limit to 5 suggestions
  }
}

// For development, use the in-memory storage
// export const storage = new MemStorage();

// Use Prisma storage instead
export { storage } from './prisma-storage';
