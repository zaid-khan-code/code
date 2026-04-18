// Auto-generated types placeholder — run:
// npx supabase gen types typescript --project-id apoqawoezvqxlsvzblut > src/lib/supabase/types.ts
// after applying migrations

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          role: "admin" | "user";
          full_name: string | null;
          username: string | null;
          user_mode: "need_help" | "can_help" | "both" | null;
          location: string | null;
          bio: string | null;
          avatar_url: string | null;
          trust_score: number;
          onboarded: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role?: "admin" | "user";
          full_name?: string | null;
          username?: string | null;
          user_mode?: "need_help" | "can_help" | "both" | null;
          location?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          trust_score?: number;
          onboarded?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      skills: {
        Row: { id: string; name: string; category: string; created_at: string };
        Insert: { id?: string; name: string; category: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["skills"]["Insert"]>;
      };
      user_skills: {
        Row: { user_id: string; skill_id: string; can_help: boolean; needs_help: boolean };
        Insert: { user_id: string; skill_id: string; can_help?: boolean; needs_help?: boolean };
        Update: Partial<Database["public"]["Tables"]["user_skills"]["Insert"]>;
      };
      interests: {
        Row: { id: string; name: string };
        Insert: { id?: string; name: string };
        Update: Partial<Database["public"]["Tables"]["interests"]["Insert"]>;
      };
      user_interests: {
        Row: { user_id: string; interest_id: string };
        Insert: { user_id: string; interest_id: string };
        Update: Partial<Database["public"]["Tables"]["user_interests"]["Insert"]>;
      };
      requests: {
        Row: {
          id: string;
          author_id: string;
          title: string;
          description: string;
          category: string | null;
          urgency: "low" | "medium" | "high" | "critical";
          status: "open" | "in_progress" | "solved" | "closed";
          tags: string[];
          location: string | null;
          ai_category: string | null;
          ai_urgency_score: number | null;
          ai_summary: string | null;
          created_at: string;
          updated_at: string;
          solved_at: string | null;
        };
        Insert: {
          id?: string;
          author_id: string;
          title: string;
          description: string;
          category?: string | null;
          urgency?: "low" | "medium" | "high" | "critical";
          status?: "open" | "in_progress" | "solved" | "closed";
          tags?: string[];
          location?: string | null;
          ai_category?: string | null;
          ai_urgency_score?: number | null;
          ai_summary?: string | null;
          created_at?: string;
          updated_at?: string;
          solved_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["requests"]["Insert"]>;
      };
      request_helpers: {
        Row: {
          id: string;
          request_id: string;
          helper_id: string;
          status: "offered" | "accepted" | "completed" | "declined";
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          request_id: string;
          helper_id: string;
          status?: "offered" | "accepted" | "completed" | "declined";
          note?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["request_helpers"]["Insert"]>;
      };
      conversations: {
        Row: {
          id: string;
          request_id: string | null;
          user_a: string;
          user_b: string;
          created_at: string;
          last_message_at: string;
        };
        Insert: {
          id?: string;
          request_id?: string | null;
          user_a: string;
          user_b: string;
          created_at?: string;
          last_message_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["conversations"]["Insert"]>;
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          body: string;
          created_at: string;
          read_at: string | null;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          body: string;
          created_at?: string;
          read_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["messages"]["Insert"]>;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: "new_helper" | "request_solved" | "new_message" | "badge_earned" | "request_commented" | "status_change" | "system";
          payload: Json;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: "new_helper" | "request_solved" | "new_message" | "badge_earned" | "request_commented" | "status_change" | "system";
          payload?: Json;
          read?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["notifications"]["Insert"]>;
      };
      badges: {
        Row: { id: string; slug: string; name: string; description: string; icon: string; criteria: Json };
        Insert: { id?: string; slug: string; name: string; description: string; icon: string; criteria: Json };
        Update: Partial<Database["public"]["Tables"]["badges"]["Insert"]>;
      };
      user_badges: {
        Row: { user_id: string; badge_id: string; earned_at: string };
        Insert: { user_id: string; badge_id: string; earned_at?: string };
        Update: Partial<Database["public"]["Tables"]["user_badges"]["Insert"]>;
      };
      trust_events: {
        Row: { id: string; user_id: string; event_type: string; delta: number; ref_id: string | null; created_at: string };
        Insert: { id?: string; user_id: string; event_type: string; delta: number; ref_id?: string | null; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["trust_events"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      trust_emit: {
        Args: { p_user: string; p_type: string; p_delta: number; p_ref?: string };
        Returns: void;
      };
      is_admin: {
        Args: { uid: string };
        Returns: boolean;
      };
    };
    Enums: {
      user_role: "admin" | "user";
    };
  };
};
