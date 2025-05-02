import { z } from "zod";

// Define interfaces that match our Prisma models
export interface User {
  id: number;
  username: string;
  password: string;
  name: string;
  headline: string | null;
  bio: string | null;
  profilePicture: string | null;
  coverPicture: string | null;
  createdAt: Date;
}

export interface Post {
  id: number;
  userId: number;
  content: string;
  imageUrl: string | null;
  likes: number;
  comments: number;
  shares: number;
  createdAt: Date;
}

export interface Connection {
  id: number;
  userId: number;
  connectedUserId: number;
  status: string;
  createdAt: Date;
}

export interface Comment {
  id: number;
  postId: number;
  userId: number;
  content: string;
  createdAt: Date;
}

export interface Experience {
  id: number;
  userId: number;
  title: string;
  company: string;
  location: string | null;
  isCurrentRole: boolean | null;
  startDate: string;
  endDate: string | null;
  description: string | null;
  companyLogo: string | null;
  createdAt: Date;
}

export interface Education {
  id: number;
  userId: number;
  school: string;
  degree: string | null;
  fieldOfStudy: string | null;
  startDate: string;
  endDate: string | null;
  description: string | null;
  schoolLogo: string | null;
  createdAt: Date;
}

export interface PostLike {
  id: number;
  postId: number;
  userId: number;
  createdAt: Date;
}

export interface PostLike {
  id: number;
  postId: number;
  userId: number;
  createdAt: Date;
}

export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  isRead: boolean;
  createdAt: Date;
}

export interface Notification {
  id: number;
  userId: number;
  actorId: number | null;
  type: string;
  content: string;
  entityId: number | null;
  entityType: string | null;
  isRead: boolean;
  createdAt: Date;
}

// Define Prisma schema-based Zod validation schemas
export const insertUserSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
  name: z.string(),
  headline: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  profilePicture: z.string().nullable().optional(),
  coverPicture: z.string().nullable().optional(),
});

export const insertPostSchema = z.object({
  userId: z.number(),
  content: z.string(),
  imageUrl: z.string().nullable().optional(),
});

export const insertConnectionSchema = z.object({
  userId: z.number(),
  connectedUserId: z.number(),
  status: z.string().default("pending"),
});

export const insertCommentSchema = z.object({
  postId: z.number(),
  userId: z.number(),
  content: z.string(),
});

export const insertExperienceSchema = z.object({
  userId: z.number(),
  title: z.string(),
  company: z.string(),
  location: z.string().nullable().optional(),
  isCurrentRole: z.boolean().nullable().optional(),
  startDate: z.string(),
  endDate: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  companyLogo: z.string().nullable().optional(),
});

export const insertEducationSchema = z.object({
  userId: z.number(),
  school: z.string(),
  degree: z.string().nullable().optional(),
  fieldOfStudy: z.string().nullable().optional(),
  startDate: z.string(),
  endDate: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  schoolLogo: z.string().nullable().optional(),
});

export const insertPostLikeSchema = z.object({
  postId: z.number(),
  userId: z.number(),
});

// Login schema
export const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
});

// Insert types from Zod schemas
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type InsertConnection = z.infer<typeof insertConnectionSchema>;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type InsertExperience = z.infer<typeof insertExperienceSchema>;
export type InsertEducation = z.infer<typeof insertEducationSchema>;
export type InsertPostLike = z.infer<typeof insertPostLikeSchema>;
export type Login = z.infer<typeof loginSchema>;

// Extended Types with Relations
export interface PostWithUser extends Post {
  user: User;
}

export interface UserWithConnections extends User {
  connections: Connection[];
}

export interface UserWithExperiences extends User {
  experiences: Experience[];
}

export interface UserWithEducations extends User {
  educations: Education[];
}

export interface UserWithProfile extends User {
  experiences: Experience[];
  educations: Education[];
}