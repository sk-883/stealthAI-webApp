import { z } from "zod";
import { Prisma } from '@prisma/client';

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

// Types from Prisma
export type User = Prisma.UserGetPayload<{}>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Post = Prisma.PostGetPayload<{}>;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Connection = Prisma.ConnectionGetPayload<{}>;
export type InsertConnection = z.infer<typeof insertConnectionSchema>;
export type Comment = Prisma.CommentGetPayload<{}>;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Experience = Prisma.ExperienceGetPayload<{}>;
export type InsertExperience = z.infer<typeof insertExperienceSchema>;
export type Education = Prisma.EducationGetPayload<{}>;
export type InsertEducation = z.infer<typeof insertEducationSchema>;
export type PostLike = Prisma.PostLikeGetPayload<{}>;
export type InsertPostLike = z.infer<typeof insertPostLikeSchema>;
export type Login = z.infer<typeof loginSchema>;

// Extended Types with Relations
export type PostWithUser = Post & {
  user: User;
};

export type UserWithConnections = User & {
  connections: Connection[];
};

export type UserWithExperiences = User & {
  experiences: Experience[];
};

export type UserWithEducations = User & {
  educations: Education[];
};

export type UserWithProfile = User & {
  experiences: Experience[];
  educations: Education[];
};