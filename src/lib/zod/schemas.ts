import { z } from "zod";

export const signUpSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(8, "Password min 8 characters"),
  full_name: z.string().min(2, "Full name required").max(100).optional().or(z.literal("")),
  user_mode: z.enum(["need_help", "can_help", "both"]).optional(),
});

export const signInSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(1, "Password required"),
});

export const onboardingStep1Schema = z.object({
  full_name: z.string().min(2).max(100),
  username: z.string().min(3).max(30).regex(/^[a-z0-9_]+$/, "Lowercase letters, numbers, underscores only"),
  location: z.string().max(100).optional(),
});

export const onboardingStep2Schema = z.object({
  user_mode: z.enum(["need_help", "can_help", "both"]),
});

export const onboardingStep3Schema = z.object({
  skills: z.array(z.object({
    skill_id: z.string().uuid(),
    can_help: z.boolean(),
    needs_help: z.boolean(),
  })).min(1, "Select at least 1 skill"),
});

export const onboardingStep4Schema = z.object({
  interest_ids: z.array(z.string().uuid()).min(3, "Select at least 3 interests"),
  bio: z.string().max(500).optional(),
});

export const createRequestSchema = z.object({
  title: z.string().min(10, "Title min 10 chars").max(120, "Title max 120 chars"),
  description: z.string().min(30, "Description min 30 chars").max(4000),
  category: z.string().max(100).optional(),
  urgency: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  tags: z.array(z.string().max(50)).max(10).default([]),
  location: z.string().max(100).optional(),
});

export const updateProfileSchema = z.object({
  full_name: z.string().min(2).max(100).optional(),
  username: z.string().min(3).max(30).regex(/^[a-z0-9_]+$/).optional(),
  location: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  avatar_url: z.string().url().optional().or(z.literal("")),
  user_mode: z.enum(["need_help", "can_help", "both"]).optional(),
});

export const sendMessageSchema = z.object({
  conversation_id: z.string().uuid(),
  body: z.string().min(1).max(2000),
});

export const createConversationSchema = z.object({
  other_user_id: z.string().uuid(),
  request_id: z.string().uuid().optional(),
  initial_message: z.string().min(1).max(2000),
});

export const offerHelpSchema = z.object({
  request_id: z.string().uuid(),
  note: z.string().max(500).optional(),
});

export const updateRequestStatusSchema = z.object({
  request_id: z.string().uuid(),
  status: z.enum(["open", "in_progress", "solved", "closed"]),
});

export const aiCategorizeSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(4000),
});

export const aiSuggestTagsSchema = z.object({
  text: z.string().min(1).max(4000),
});

export const aiSummarizeSchema = z.object({
  text: z.string().min(1).max(4000),
  mode: z.enum(["summary", "rewrite"]).default("summary"),
});
