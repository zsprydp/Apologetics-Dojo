/**
 * Domain and database types for Apologetics Dojo.
 * Align with Supabase tables: profiles, families, belt_config, debate_sessions, skill_scores, learning_tracks.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface BeltConfig {
  id: string;
  name: string;
  level: number;
  min_score_threshold: number;
  color_hex: string | null;
  sort_order: number;
  created_at: string;
}

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  current_belt_id: string | null;
  stripe_customer_id: string | null;
  stripe_plan: string;
  created_at: string;
  updated_at: string;
}

export interface Family {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface DebateSession {
  id: string;
  user_id: string;
  opponent_persona_id: string | null;
  family_id: string | null;
  difficulty: string;
  started_at: string;
  ended_at: string | null;
  outcome: string | null;
  transcript_summary: string | null;
  created_at: string;
}

export interface SkillScore {
  id: string;
  profile_id: string;
  family_id: string;
  score: number;
  belt_id: string | null;
  updated_at: string;
}

export interface DebateMessage {
  id: string;
  session_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface LearningTrack {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

/** Supabase schema type (for typed client) */
export interface Database {
  public: {
    Tables: {
      belt_config: {
        Row: BeltConfig;
        Insert: Omit<BeltConfig, "id"> & { id?: string };
        Update: Partial<BeltConfig>;
        Relationships: [];
      };
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at" | "updated_at"> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Profile>;
        Relationships: [];
      };
      families: {
        Row: Family;
        Insert: Omit<Family, "id" | "created_at" | "updated_at"> & { id?: string };
        Update: Partial<Family>;
        Relationships: [];
      };
      debate_messages: {
        Row: DebateMessage;
        Insert: Omit<DebateMessage, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<DebateMessage>;
        Relationships: [];
      };
      debate_sessions: {
        Row: DebateSession;
        Insert: Omit<DebateSession, "id" | "created_at"> & { id?: string };
        Update: Partial<DebateSession>;
        Relationships: [];
      };
      skill_scores: {
        Row: SkillScore;
        Insert: Omit<SkillScore, "id"> & { id?: string };
        Update: Partial<SkillScore>;
        Relationships: [];
      };
      learning_tracks: {
        Row: LearningTrack;
        Insert: Omit<LearningTrack, "id" | "created_at" | "updated_at"> & {
          id?: string;
        };
        Update: Partial<LearningTrack>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
