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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      about_content: {
        Row: {
          content: string | null
          created_at: string
          data: Json | null
          id: string
          published: boolean
          section_key: string
          sort_order: number
          title: string | null
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          published?: boolean
          section_key: string
          sort_order?: number
          title?: string | null
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          published?: boolean
          section_key?: string
          sort_order?: number
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      board_members: {
        Row: {
          bio: string | null
          created_at: string
          full_name: string
          id: string
          photo_url: string | null
          position: string
          published: boolean
          sort_order: number
          updated_at: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          full_name: string
          id?: string
          photo_url?: string | null
          position: string
          published?: boolean
          sort_order?: number
          updated_at?: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          full_name?: string
          id?: string
          photo_url?: string | null
          position?: string
          published?: boolean
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          admin_notes: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          message: string
          phone: string
          purpose: string | null
          status: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          message: string
          phone: string
          purpose?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          message?: string
          phone?: string
          purpose?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      custom_form_submissions: {
        Row: {
          admin_notes: string | null
          created_at: string
          data: Json
          form_id: string
          id: string
          status: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          data?: Json
          form_id: string
          id?: string
          status?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          data?: Json
          form_id?: string
          id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_form_submissions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "custom_forms"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_forms: {
        Row: {
          audience: string
          created_at: string
          description: string | null
          duration: string | null
          featured: boolean
          fields: Json
          icon: string | null
          id: string
          published: boolean
          slug: string
          sort_order: number
          success_message: string | null
          title: string
          updated_at: string
        }
        Insert: {
          audience?: string
          created_at?: string
          description?: string | null
          duration?: string | null
          featured?: boolean
          fields?: Json
          icon?: string | null
          id?: string
          published?: boolean
          slug: string
          sort_order?: number
          success_message?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          audience?: string
          created_at?: string
          description?: string | null
          duration?: string | null
          featured?: boolean
          fields?: Json
          icon?: string | null
          id?: string
          published?: boolean
          slug?: string
          sort_order?: number
          success_message?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      custom_pages: {
        Row: {
          content: string | null
          created_at: string
          id: string
          meta_description: string | null
          parent_slug: string | null
          published: boolean
          show_in_menu: boolean
          slug: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          meta_description?: string | null
          parent_slug?: string | null
          published?: boolean
          show_in_menu?: boolean
          slug: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          meta_description?: string | null
          parent_slug?: string | null
          published?: boolean
          show_in_menu?: boolean
          slug?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      governance_documents: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          file_size: number | null
          file_url: string
          id: string
          published: boolean
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          file_size?: number | null
          file_url: string
          id?: string
          published?: boolean
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          file_size?: number | null
          file_url?: string
          id?: string
          published?: boolean
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      hero_slides: {
        Row: {
          created_at: string
          cta_label: string | null
          cta_url: string | null
          id: string
          image_url: string | null
          published: boolean
          sort_order: number
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          cta_label?: string | null
          cta_url?: string | null
          id?: string
          image_url?: string | null
          published?: boolean
          sort_order?: number
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          cta_label?: string | null
          cta_url?: string | null
          id?: string
          image_url?: string | null
          published?: boolean
          sort_order?: number
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      legal_pages: {
        Row: {
          content: string | null
          created_at: string
          id: string
          published: boolean
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          published?: boolean
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          published?: boolean
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      membership_requests: {
        Row: {
          admin_notes: string | null
          created_at: string
          education: string | null
          email: string
          employer: string | null
          full_name: string
          gender: string | null
          id: string
          job_title: string | null
          national_id: string
          phone: string
          status: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          education?: string | null
          email: string
          employer?: string | null
          full_name: string
          gender?: string | null
          id?: string
          job_title?: string | null
          national_id: string
          phone: string
          status?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          education?: string | null
          email?: string
          employer?: string | null
          full_name?: string
          gender?: string | null
          id?: string
          job_title?: string | null
          national_id?: string
          phone?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      news: {
        Row: {
          category: string | null
          content: string | null
          cover_image_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          published: boolean
          published_at: string | null
          slug: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          content?: string | null
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published?: boolean
          published_at?: string | null
          slug: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          content?: string | null
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published?: boolean
          published_at?: string | null
          slug?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      page_content: {
        Row: {
          content: string | null
          created_at: string
          data: Json | null
          id: string
          page_key: string
          published: boolean
          section_key: string
          sort_order: number
          title: string | null
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          page_key: string
          published?: boolean
          section_key: string
          sort_order?: number
          title?: string | null
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          page_key?: string
          published?: boolean
          section_key?: string
          sort_order?: number
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      page_feedback: {
        Row: {
          comment: string | null
          created_at: string
          helpful: boolean
          id: string
          page_path: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          helpful: boolean
          id?: string
          page_path: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          helpful?: boolean
          id?: string
          page_path?: string
        }
        Relationships: []
      }
      partners: {
        Row: {
          created_at: string
          id: string
          logo_url: string | null
          name: string
          published: boolean
          sort_order: number
          updated_at: string
          website_url: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          published?: boolean
          sort_order?: number
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          published?: boolean
          sort_order?: number
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      programs: {
        Row: {
          cover_image_url: string | null
          created_at: string
          description: string | null
          featured: boolean
          icon: string | null
          id: string
          long_description: string | null
          published: boolean
          slug: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean
          icon?: string | null
          id?: string
          long_description?: string | null
          published?: boolean
          slug: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean
          icon?: string | null
          id?: string
          long_description?: string | null
          published?: boolean
          slug?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          contact_address: string | null
          contact_email: string | null
          contact_phone: string | null
          favicon_url: string | null
          footer_text: string | null
          id: string
          logo_url: string | null
          primary_color: string | null
          secondary_color: string | null
          site_name: string | null
          social_instagram: string | null
          social_linkedin: string | null
          social_twitter: string | null
          social_youtube: string | null
          updated_at: string
        }
        Insert: {
          contact_address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          favicon_url?: string | null
          footer_text?: string | null
          id?: string
          logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          site_name?: string | null
          social_instagram?: string | null
          social_linkedin?: string | null
          social_twitter?: string | null
          social_youtube?: string | null
          updated_at?: string
        }
        Update: {
          contact_address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          favicon_url?: string | null
          footer_text?: string | null
          id?: string
          logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          site_name?: string | null
          social_instagram?: string | null
          social_linkedin?: string | null
          social_twitter?: string | null
          social_youtube?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      survey_questions: {
        Row: {
          created_at: string
          id: string
          options: Json | null
          question: string
          required: boolean
          scale: Json | null
          sort_order: number
          survey_id: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          options?: Json | null
          question: string
          required?: boolean
          scale?: Json | null
          sort_order?: number
          survey_id: string
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          options?: Json | null
          question?: string
          required?: boolean
          scale?: Json | null
          sort_order?: number
          survey_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_questions_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_responses: {
        Row: {
          answers: Json
          id: string
          submitted_at: string
          survey_id: string
        }
        Insert: {
          answers: Json
          id?: string
          submitted_at?: string
          survey_id: string
        }
        Update: {
          answers?: Json
          id?: string
          submitted_at?: string
          survey_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_responses_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      surveys: {
        Row: {
          created_at: string
          description: string | null
          ends_at: string | null
          id: string
          participants: number
          published: boolean
          show_public_results: boolean
          slug: string
          sort_order: number
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          participants?: number
          published?: boolean
          show_public_results?: boolean
          slug: string
          sort_order?: number
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          participants?: number
          published?: boolean
          show_public_results?: boolean
          slug?: string
          sort_order?: number
          status?: string
          title?: string
          updated_at?: string
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
      volunteer_requests: {
        Row: {
          admin_notes: string | null
          availability: string | null
          birth_date: string | null
          city: string | null
          created_at: string
          education: string | null
          employer: string | null
          full_name: string
          gender: string | null
          has_prior_experience: string | null
          id: string
          id_number: string
          job: string | null
          marital_status: string | null
          nationality: string | null
          other_location: string | null
          phone: string
          preferred_activities: string | null
          previous_org: string | null
          referral_source: string | null
          skills: string | null
          status: string
          updated_at: string
          volunteer_location: string | null
        }
        Insert: {
          admin_notes?: string | null
          availability?: string | null
          birth_date?: string | null
          city?: string | null
          created_at?: string
          education?: string | null
          employer?: string | null
          full_name: string
          gender?: string | null
          has_prior_experience?: string | null
          id?: string
          id_number: string
          job?: string | null
          marital_status?: string | null
          nationality?: string | null
          other_location?: string | null
          phone: string
          preferred_activities?: string | null
          previous_org?: string | null
          referral_source?: string | null
          skills?: string | null
          status?: string
          updated_at?: string
          volunteer_location?: string | null
        }
        Update: {
          admin_notes?: string | null
          availability?: string | null
          birth_date?: string | null
          city?: string | null
          created_at?: string
          education?: string | null
          employer?: string | null
          full_name?: string
          gender?: string | null
          has_prior_experience?: string | null
          id?: string
          id_number?: string
          job?: string | null
          marital_status?: string | null
          nationality?: string | null
          other_location?: string | null
          phone?: string
          preferred_activities?: string | null
          previous_org?: string | null
          referral_source?: string | null
          skills?: string | null
          status?: string
          updated_at?: string
          volunteer_location?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "editor"
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
      app_role: ["admin", "editor"],
    },
  },
} as const
