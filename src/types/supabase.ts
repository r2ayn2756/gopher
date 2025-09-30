// Supabase Database types for Gopher (Step 2.5)
// Mirrors tables defined in supabase/schema.sql

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          role: Database["public"]["Enums"]["app_role"]
          school_id: string | null
          grade_level: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          school_id?: string | null
          grade_level?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          school_id?: string | null
          grade_level?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedSchema?: "auth"
            referencedColumns: ["id"]
          }
        ]
      }
      conversations: {
        Row: {
          id: string
          user_id: string
          title: string | null
          subject: string | null
          problem_statement: string | null
          status: Database["public"]["Enums"]["conversation_status"]
          started_at: string
          ended_at: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string | null
          subject?: string | null
          problem_statement?: string | null
          status?: Database["public"]["Enums"]["conversation_status"]
          started_at?: string
          ended_at?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string | null
          subject?: string | null
          problem_statement?: string | null
          status?: Database["public"]["Enums"]["conversation_status"]
          started_at?: string
          ended_at?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          role: Database["public"]["Enums"]["message_role"]
          content: string
          hint_level: number | null
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          role: Database["public"]["Enums"]["message_role"]
          content: string
          hint_level?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          role?: Database["public"]["Enums"]["message_role"]
          content?: string
          hint_level?: number | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          }
        ]
      }
      analytics: {
        Row: {
          id: string
          user_id: string | null
          event_type: string
          event_data: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          event_type: string
          event_data?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          event_type?: string
          event_data?: Json
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "analytics_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      conversation_stats: {
        Row: {
          id: string
          user_id: string
          started_at: string
          ended_at: string | null
          duration_seconds: number
        }
      }
    }
    Functions: {
      current_user_id: {
        Args: Record<string, never>
        Returns: string | null
      }
      bump_hint_level: {
        Args: { p_conversation_id: string }
        Returns: number
      }
    }
    Enums: {
      app_role: "student" | "admin"
      conversation_status: "active" | "ended" | "deleted"
      message_role: "user" | "assistant" | "system"
    }
  }
}

// Helper types for typed Supabase client usage
export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"]
export type TablesInsert<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Insert"]
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Update"]

// Common joined result types
export type ConversationWithMessages = Tables<"conversations"> & {
  messages: Tables<"messages">[]
}

export type ProfileWithConversations = Tables<"profiles"> & {
  conversations: (Pick<Tables<"conversations">, "id" | "title" | "status" | "started_at" | "ended_at">)[]
}


