// TypeScript shape of the Supabase database (matches supabase/migrations/0001_initial.sql).
// Lets the Supabase client type every query result.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      organizers: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          subscription_plan: string;
          subscription_status: string;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          phone?: string | null;
          subscription_plan?: string;
          subscription_status?: string;
        };
        Update: Partial<Database["public"]["Tables"]["organizers"]["Insert"]>;
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          organizer_id: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          plan: string;
          billing: string;
          status: string;
          current_period_end: string | null;
          cancel_at_period_end: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organizer_id: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          plan: string;
          billing?: string;
          status?: string;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["subscriptions"]["Insert"]>;
        Relationships: [];
      };
      tournaments: {
        Row: {
          id: string;
          organizer_id: string;
          slug: string;
          name: string;
          sport: string;
          location: string | null;
          date: string | null;
          days: number;
          weeks: number;
          is_liga: boolean;
          format: string;
          score_format: string;
          courts: number;
          max_pairs: number | null;
          group_size: number;
          min_matches: number | null;
          start_time: string;
          end_time: string;
          match_duration: number;
          final_time: string | null;
          dead_start: string | null;
          dead_end: string | null;
          price: number | null;
          pay_link: string | null;
          deadline: string | null;
          consolation: boolean;
          includes_shirt: boolean;
          categories: Json;
          status: string;
          engine: Json | null;
          ranked: boolean;
          state: string | null;
          municipality: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organizer_id: string;
          slug: string;
          name: string;
          sport?: string;
          location?: string | null;
          date?: string | null;
          days?: number;
          weeks?: number;
          is_liga?: boolean;
          format?: string;
          score_format?: string;
          courts?: number;
          max_pairs?: number | null;
          group_size?: number;
          min_matches?: number | null;
          start_time?: string;
          end_time?: string;
          match_duration?: number;
          final_time?: string | null;
          dead_start?: string | null;
          dead_end?: string | null;
          price?: number | null;
          pay_link?: string | null;
          deadline?: string | null;
          consolation?: boolean;
          includes_shirt?: boolean;
          categories?: Json;
          status?: string;
          engine?: Json | null;
          ranked?: boolean;
          state?: string | null;
          municipality?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["tournaments"]["Insert"]>;
        Relationships: [];
      };
      teams: {
        Row: {
          id: string;
          tournament_id: string;
          name: string;
          player1_name: string;
          player1_phone: string | null;
          player1_email: string | null;
          player1_shirt_size: string | null;
          player2_name: string | null;
          player2_phone: string | null;
          player2_email: string | null;
          player2_shirt_size: string | null;
          category: string | null;
          status: string;
          registered_at: string;
        };
        Insert: {
          id?: string;
          tournament_id: string;
          name: string;
          player1_name: string;
          player1_phone?: string | null;
          player1_email?: string | null;
          player1_shirt_size?: string | null;
          player2_name?: string | null;
          player2_phone?: string | null;
          player2_email?: string | null;
          player2_shirt_size?: string | null;
          category?: string | null;
          status?: string;
        };
        Update: Partial<Database["public"]["Tables"]["teams"]["Insert"]>;
        Relationships: [];
      };
      matches: {
        Row: {
          id: string;
          tournament_id: string;
          round: number | null;
          round_name: string | null;
          group_name: string | null;
          court: string | null;
          scheduled_time: string | null;
          team1_id: string | null;
          team2_id: string | null;
          score1: number | null;
          score2: number | null;
          sets: Json | null;
          winner_id: string | null;
          status: string;
          jornada: number | null;
          consolation: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          tournament_id: string;
          round?: number | null;
          round_name?: string | null;
          group_name?: string | null;
          court?: string | null;
          scheduled_time?: string | null;
          team1_id?: string | null;
          team2_id?: string | null;
          score1?: number | null;
          score2?: number | null;
          sets?: Json | null;
          winner_id?: string | null;
          status?: string;
          jornada?: number | null;
          consolation?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["matches"]["Insert"]>;
        Relationships: [];
      };
      contacts: {
        Row: {
          id: string;
          organizer_id: string;
          name: string;
          phone: string | null;
          email: string | null;
          category: string | null;
          tournaments_played: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          organizer_id: string;
          name: string;
          phone?: string | null;
          email?: string | null;
          category?: string | null;
          tournaments_played?: string[];
        };
        Update: Partial<Database["public"]["Tables"]["contacts"]["Insert"]>;
        Relationships: [];
      };
      jornadas: {
        Row: {
          id: string;
          tournament_id: string;
          number: number;
          court_assignments: Json | null;
          done: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          tournament_id: string;
          number: number;
          court_assignments?: Json | null;
          done?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["jornadas"]["Insert"]>;
        Relationships: [];
      };
      players: {
        Row: {
          id: string;
          display_name: string;
          normalized_name: string;
          phone: string | null;
          state: string | null;
          municipality: string | null;
          claimed_by: string | null;
          rating: number;
          peak_rating: number;
          matches_played: number;
          wins: number;
          losses: number;
          current_streak: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          display_name: string;
          normalized_name: string;
          phone?: string | null;
          state?: string | null;
          municipality?: string | null;
          claimed_by?: string | null;
          rating?: number;
          peak_rating?: number;
          matches_played?: number;
          wins?: number;
          losses?: number;
          current_streak?: number;
        };
        Update: Partial<Database["public"]["Tables"]["players"]["Insert"]>;
        Relationships: [];
      };
      player_matches: {
        Row: {
          id: string;
          player_id: string;
          partner_id: string | null;
          opponent1_id: string | null;
          opponent2_id: string | null;
          tournament_id: string | null;
          tournament_name: string | null;
          category: string | null;
          won: boolean;
          score: string | null;
          rating_before: number;
          rating_after: number;
          rating_delta: number;
          played_at: string;
        };
        Insert: {
          id?: string;
          player_id: string;
          partner_id?: string | null;
          opponent1_id?: string | null;
          opponent2_id?: string | null;
          tournament_id?: string | null;
          tournament_name?: string | null;
          category?: string | null;
          won: boolean;
          score?: string | null;
          rating_before: number;
          rating_after: number;
          rating_delta: number;
          played_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["player_matches"]["Insert"]>;
        Relationships: [];
      };
      friend_groups: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          slug: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          slug: string;
        };
        Update: Partial<Database["public"]["Tables"]["friend_groups"]["Insert"]>;
        Relationships: [];
      };
      friend_group_members: {
        Row: {
          id: string;
          group_id: string;
          player_id: string;
          added_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          player_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["friend_group_members"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
}
