export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

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
        Update: {
          id?: string;
          email?: string;
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
        Relationships: [];
      };
      skills: {
        Row: {
          id: string;
          name: string;
          category: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      user_skills: {
        Row: {
          user_id: string;
          skill_id: string;
          can_help: boolean;
          needs_help: boolean;
        };
        Insert: {
          user_id: string;
          skill_id: string;
          can_help?: boolean;
          needs_help?: boolean;
        };
        Update: {
          user_id?: string;
          skill_id?: string;
          can_help?: boolean;
          needs_help?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "user_skills_skill_id_fkey";
            columns: ["skill_id"];
            isOneToOne: false;
            referencedRelation: "skills";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_skills_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      interests: {
        Row: {
          id: string;
          name: string;
        };
        Insert: {
          id?: string;
          name: string;
        };
        Update: {
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      user_interests: {
        Row: {
          user_id: string;
          interest_id: string;
        };
        Insert: {
          user_id: string;
          interest_id: string;
        };
        Update: {
          user_id?: string;
          interest_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_interests_interest_id_fkey";
            columns: ["interest_id"];
            isOneToOne: false;
            referencedRelation: "interests";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_interests_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
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
        Update: {
          id?: string;
          author_id?: string;
          title?: string;
          description?: string;
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
        Relationships: [
          {
            foreignKeyName: "requests_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
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
        Update: {
          id?: string;
          request_id?: string;
          helper_id?: string;
          status?: "offered" | "accepted" | "completed" | "declined";
          note?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "request_helpers_helper_id_fkey";
            columns: ["helper_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "request_helpers_request_id_fkey";
            columns: ["request_id"];
            isOneToOne: false;
            referencedRelation: "requests";
            referencedColumns: ["id"];
          },
        ];
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
        Update: {
          id?: string;
          request_id?: string | null;
          user_a?: string;
          user_b?: string;
          created_at?: string;
          last_message_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "conversations_request_id_fkey";
            columns: ["request_id"];
            isOneToOne: false;
            referencedRelation: "requests";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "conversations_user_a_fkey";
            columns: ["user_a"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "conversations_user_b_fkey";
            columns: ["user_b"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
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
        Update: {
          id?: string;
          conversation_id?: string;
          sender_id?: string;
          body?: string;
          created_at?: string;
          read_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_sender_id_fkey";
            columns: ["sender_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type:
            | "new_helper"
            | "request_solved"
            | "new_message"
            | "badge_earned"
            | "request_commented"
            | "status_change"
            | "system";
          payload: Json;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type:
            | "new_helper"
            | "request_solved"
            | "new_message"
            | "badge_earned"
            | "request_commented"
            | "status_change"
            | "system";
          payload?: Json;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?:
            | "new_helper"
            | "request_solved"
            | "new_message"
            | "badge_earned"
            | "request_commented"
            | "status_change"
            | "system";
          payload?: Json;
          read?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      badges: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string;
          icon: string;
          criteria: Json;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description: string;
          icon: string;
          criteria: Json;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          description?: string;
          icon?: string;
          criteria?: Json;
        };
        Relationships: [];
      };
      user_badges: {
        Row: {
          user_id: string;
          badge_id: string;
          earned_at: string;
        };
        Insert: {
          user_id: string;
          badge_id: string;
          earned_at?: string;
        };
        Update: {
          user_id?: string;
          badge_id?: string;
          earned_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey";
            columns: ["badge_id"];
            isOneToOne: false;
            referencedRelation: "badges";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_badges_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      trust_events: {
        Row: {
          id: string;
          user_id: string;
          event_type: string;
          delta: number;
          ref_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          event_type: string;
          delta: number;
          ref_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          event_type?: string;
          delta?: number;
          ref_id?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "trust_events_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      trust_emit: {
        Args: {
          p_user: string;
          p_type: string;
          p_delta: number;
          p_ref?: string | null;
        };
        Returns: undefined;
      };
      is_admin: {
        Args: {
          uid: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      user_role: "admin" | "user";
    };
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type Inserts<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type Updates<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
