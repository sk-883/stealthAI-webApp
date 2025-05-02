import { 
  users, type User, type InsertUser,
  posts, type Post, type InsertPost,
  connections, type Connection, type InsertConnection,
  comments, type Comment, type InsertComment,
  experiences, type Experience, type InsertExperience,
  educations, type Education, type InsertEducation,
  type PostWithUser, type UserWithConnections, type UserWithExperiences, type UserWithEducations
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, ne } from "drizzle-orm";

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
  
  // Extended operations
  getPostsWithUsers(): Promise<PostWithUser[]>;
  getUsersForConnections(userId: number): Promise<User[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  // Post operations
  async getPosts(): Promise<PostWithUser[]> {
    return this.getPostsWithUsers();
  }

  async getPostById(id: number): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post;
  }

  async getPostsByUserId(userId: number): Promise<Post[]> {
    return db.select().from(posts).where(eq(posts.userId, userId)).orderBy(desc(posts.createdAt));
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const [post] = await db
      .insert(posts)
      .values(insertPost)
      .returning();
    return post;
  }

  async updatePost(id: number, data: Partial<InsertPost>): Promise<Post | undefined> {
    const [updatedPost] = await db
      .update(posts)
      .set(data)
      .where(eq(posts.id, id))
      .returning();
    return updatedPost;
  }

  async deletePost(id: number): Promise<boolean> {
    const result = await db.delete(posts).where(eq(posts.id, id)).returning({ id: posts.id });
    return result.length > 0;
  }

  // Connection operations
  async getConnections(userId: number): Promise<Connection[]> {
    return db
      .select()
      .from(connections)
      .where(
        and(
          eq(connections.status, "accepted"),
          eq(connections.userId, userId)
        )
      );
  }

  async getPendingConnections(userId: number): Promise<Connection[]> {
    return db
      .select()
      .from(connections)
      .where(
        and(
          eq(connections.status, "pending"),
          eq(connections.connectedUserId, userId)
        )
      );
  }

  async createConnection(insertConnection: InsertConnection): Promise<Connection> {
    const [connection] = await db
      .insert(connections)
      .values(insertConnection)
      .returning();
    return connection;
  }

  async updateConnectionStatus(id: number, status: string): Promise<Connection | undefined> {
    const [updatedConnection] = await db
      .update(connections)
      .set({ status })
      .where(eq(connections.id, id))
      .returning();
    return updatedConnection;
  }

  async deleteConnection(id: number): Promise<boolean> {
    const result = await db.delete(connections).where(eq(connections.id, id)).returning({ id: connections.id });
    return result.length > 0;
  }

  // Comment operations
  async getCommentsByPostId(postId: number): Promise<Comment[]> {
    return db
      .select()
      .from(comments)
      .where(eq(comments.postId, postId))
      .orderBy(desc(comments.createdAt));
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const [comment] = await db
      .insert(comments)
      .values(insertComment)
      .returning();
    
    // Update comment count
    await db
      .update(posts)
      .set({ comments: db.sql`${posts.comments} + 1` })
      .where(eq(posts.id, insertComment.postId));
    
    return comment;
  }

  async deleteComment(id: number): Promise<boolean> {
    const [deletedComment] = await db
      .delete(comments)
      .where(eq(comments.id, id))
      .returning({
        id: comments.id,
        postId: comments.postId
      });
    
    if (deletedComment) {
      // Update comment count
      await db
        .update(posts)
        .set({ comments: db.sql`${posts.comments} - 1` })
        .where(eq(posts.id, deletedComment.postId));
      return true;
    }
    
    return false;
  }

  // Experience operations
  async getExperiencesByUserId(userId: number): Promise<Experience[]> {
    return db
      .select()
      .from(experiences)
      .where(eq(experiences.userId, userId))
      .orderBy(desc(experiences.startDate));
  }

  async getExperienceById(id: number): Promise<Experience | undefined> {
    const [experience] = await db
      .select()
      .from(experiences)
      .where(eq(experiences.id, id));
    return experience;
  }

  async createExperience(insertExperience: InsertExperience): Promise<Experience> {
    const [experience] = await db
      .insert(experiences)
      .values(insertExperience)
      .returning();
    return experience;
  }

  async updateExperience(id: number, data: Partial<InsertExperience>): Promise<Experience | undefined> {
    const [updatedExperience] = await db
      .update(experiences)
      .set(data)
      .where(eq(experiences.id, id))
      .returning();
    return updatedExperience;
  }

  async deleteExperience(id: number): Promise<boolean> {
    const result = await db
      .delete(experiences)
      .where(eq(experiences.id, id))
      .returning({ id: experiences.id });
    return result.length > 0;
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
    return db
      .select()
      .from(users)
      .where(
        and(
          ne(users.id, userId),
          // Only include users not in the connectedUserIds array
          connectedUserIds.length > 0 
            ? db.sql`${users.id} NOT IN (${connectedUserIds.join(', ')})` 
            : db.sql`1=1` // If no connections, return all users except current user
        )
      )
      .limit(5);
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
  currentUserId: number;
  currentPostId: number;
  currentConnectionId: number;
  currentCommentId: number;
  currentExperienceId: number;
  currentEducationId: number;

  constructor() {
    this.users = new Map();
    this.posts = new Map();
    this.connections = new Map();
    this.comments = new Map();
    this.experiences = new Map();
    this.educations = new Map();
    this.currentUserId = 1;
    this.currentPostId = 1;
    this.currentConnectionId = 1;
    this.currentCommentId = 1;
    this.currentExperienceId = 1;
    this.currentEducationId = 1;
    
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

// Choose the appropriate storage implementation
// export const storage = new DatabaseStorage();
export const storage = new MemStorage();
