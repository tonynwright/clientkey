export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      assessments: {
        Row: {
          client_id: string
          created_at: string
          dominant_type: string
          id: string
          responses: Json
          scores: Json
        }
        Insert: {
          client_id: string
          created_at?: string
          dominant_type: string
          id?: string
          responses: Json
          scores: Json
        }
        Update: {
          client_id?: string
          created_at?: string
          dominant_type?: string
          id?: string
          responses?: Json
          scores?: Json
        }
        Relationships: [
          {
            foreignKeyName: "assessments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_onboarding_progress: {
        Row: {
          client_id: string
          completed_at: string | null
          created_at: string
          current_step: number
          id: string
          is_paused: boolean
          last_email_sent_at: string | null
          sequence_id: string
          started_at: string
          updated_at: string
        }
        Insert: {
          client_id: string
          completed_at?: string | null
          created_at?: string
          current_step?: number
          id?: string
          is_paused?: boolean
          last_email_sent_at?: string | null
          sequence_id: string
          started_at?: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          completed_at?: string | null
          created_at?: string
          current_step?: number
          id?: string
          is_paused?: boolean
          last_email_sent_at?: string | null
          sequence_id?: string
          started_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_onboarding_progress_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_onboarding_progress_sequence_id_fkey"
            columns: ["sequence_id"]
            isOneToOne: false
            referencedRelation: "onboarding_sequences"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          company: string | null
          created_at: string
          disc_scores: Json | null
          disc_type: string | null
          email: string
          id: string
          name: string
          tags: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          disc_scores?: Json | null
          disc_type?: string | null
          email: string
          id?: string
          name: string
          tags?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          company?: string | null
          created_at?: string
          disc_scores?: Json | null
          disc_type?: string | null
          email?: string
          id?: string
          name?: string
          tags?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      demo_seed_log: {
        Row: {
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      disc_insights: {
        Row: {
          client_id: string
          created_at: string
          disc_type: string
          id: string
          insights: string
          scores: Json
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          disc_type: string
          id?: string
          insights: string
          scores: Json
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          disc_type?: string
          id?: string
          insights?: string
          scores?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "disc_insights_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      early_bird_notifications: {
        Row: {
          created_at: string
          id: string
          notification_sent_at: string
          price_increase_date: string
          subscription_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notification_sent_at?: string
          price_increase_date: string
          subscription_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notification_sent_at?: string
          price_increase_date?: string
          subscription_id?: string
          user_id?: string
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          company_logo_url: string | null
          company_name: string | null
          content: string
          created_at: string
          id: string
          primary_color: string | null
          subject: string
          template_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company_logo_url?: string | null
          company_name?: string | null
          content: string
          created_at?: string
          id?: string
          primary_color?: string | null
          subject: string
          template_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company_logo_url?: string | null
          company_name?: string | null
          content?: string
          created_at?: string
          id?: string
          primary_color?: string | null
          subject?: string
          template_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_tracking: {
        Row: {
          client_id: string
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
        }
        Insert: {
          client_id: string
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
        }
        Update: {
          client_id?: string
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "email_tracking_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      nps_responses: {
        Row: {
          client_id: string
          created_at: string | null
          feedback: string | null
          id: string
          response_date: string | null
          score: number
        }
        Insert: {
          client_id: string
          created_at?: string | null
          feedback?: string | null
          id?: string
          response_date?: string | null
          score: number
        }
        Update: {
          client_id?: string
          created_at?: string | null
          feedback?: string | null
          id?: string
          response_date?: string | null
          score?: number
        }
        Relationships: [
          {
            foreignKeyName: "nps_responses_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      nps_settings: {
        Row: {
          created_at: string | null
          id: string
          is_enabled: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      onboarding_sequence_steps: {
        Row: {
          created_at: string
          delay_days: number
          email_content: string
          email_subject: string
          id: string
          sequence_id: string
          step_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          delay_days?: number
          email_content: string
          email_subject: string
          id?: string
          sequence_id: string
          step_order: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          delay_days?: number
          email_content?: string
          email_subject?: string
          id?: string
          sequence_id?: string
          step_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_sequence_steps_sequence_id_fkey"
            columns: ["sequence_id"]
            isOneToOne: false
            referencedRelation: "onboarding_sequences"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_sequences: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reminder_settings: {
        Row: {
          created_at: string
          id: string
          max_reminders: number
          reminder_delay_days: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          max_reminders?: number
          reminder_delay_days?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          max_reminders?: number
          reminder_delay_days?: number
          updated_at?: string
        }
        Relationships: []
      }
      security_scans: {
        Row: {
          created_at: string
          findings: Json
          findings_count: number
          id: string
          new_findings_count: number | null
          scan_date: string
        }
        Insert: {
          created_at?: string
          findings: Json
          findings_count: number
          id?: string
          new_findings_count?: number | null
          scan_date?: string
        }
        Update: {
          created_at?: string
          findings?: Json
          findings_count?: number
          id?: string
          new_findings_count?: number | null
          scan_date?: string
        }
        Relationships: []
      }
      signup_counter: {
        Row: {
          early_bird_count: number
          early_bird_limit: number
          id: string
          updated_at: string
        }
        Insert: {
          early_bird_count?: number
          early_bird_limit?: number
          id?: string
          updated_at?: string
        }
        Update: {
          early_bird_count?: number
          early_bird_limit?: number
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      staff: {
        Row: {
          created_at: string
          disc_scores: Json | null
          disc_type: string | null
          email: string
          id: string
          name: string
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          disc_scores?: Json | null
          disc_type?: string | null
          email: string
          id?: string
          name: string
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          disc_scores?: Json | null
          disc_type?: string | null
          email?: string
          id?: string
          name?: string
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          addon_client_packs: number
          cancel_at_period_end: boolean | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          monthly_price: number
          pricing_tier: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          addon_client_packs?: number
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          monthly_price: number
          pricing_tier: string
          status: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          addon_client_packs?: number
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          monthly_price?: number
          pricing_tier?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      survey_campaigns: {
        Row: {
          created_at: string | null
          id: string
          name: string
          sent_at: string | null
          status: string | null
          template_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          sent_at?: string | null
          status?: string | null
          template_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          sent_at?: string | null
          status?: string | null
          template_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_campaigns_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "survey_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_questions: {
        Row: {
          created_at: string | null
          id: string
          is_required: boolean | null
          options: Json | null
          question_order: number
          question_text: string
          question_type: string
          template_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          options?: Json | null
          question_order: number
          question_text: string
          question_type: string
          template_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          options?: Json | null
          question_order?: number
          question_text?: string
          question_type?: string
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_questions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "survey_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_quota: {
        Row: {
          created_at: string | null
          id: string
          max_surveys: number | null
          month_year: string
          surveys_sent: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          max_surveys?: number | null
          month_year: string
          surveys_sent?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          max_surveys?: number | null
          month_year?: string
          surveys_sent?: number | null
          user_id?: string
        }
        Relationships: []
      }
      survey_recipients: {
        Row: {
          campaign_id: string
          client_id: string
          completed_at: string | null
          created_at: string | null
          id: string
          opened_at: string | null
          sent_at: string | null
          status: string | null
        }
        Insert: {
          campaign_id: string
          client_id: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          opened_at?: string | null
          sent_at?: string | null
          status?: string | null
        }
        Update: {
          campaign_id?: string
          client_id?: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          opened_at?: string | null
          sent_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "survey_recipients_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "survey_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_recipients_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_responses: {
        Row: {
          answer_text: string | null
          answer_value: number | null
          created_at: string | null
          id: string
          question_id: string
          recipient_id: string
        }
        Insert: {
          answer_text?: string | null
          answer_value?: number | null
          created_at?: string | null
          id?: string
          question_id: string
          recipient_id: string
        }
        Update: {
          answer_text?: string | null
          answer_value?: number | null
          created_at?: string | null
          id?: string
          question_id?: string
          recipient_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "survey_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_responses_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "survey_recipients"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_templates: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_preset: boolean | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_preset?: boolean | null
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_preset?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tag_presets: {
        Row: {
          created_at: string
          id: string
          name: string
          tags: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          tags?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          tags?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_client_count_for_user: {
        Args: { p_user_id: string }
        Returns: number
      }
      get_client_limit_for_user: {
        Args: { p_user_id: string }
        Returns: number
      }
      has_role: {
        Args: {
          check_role: Database["public"]["Enums"]["app_role"]
          check_user_id: string
        }
        Returns: boolean
      }
      increment_early_bird_counter: { Args: never; Returns: number }
      is_admin: { Args: { check_user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
