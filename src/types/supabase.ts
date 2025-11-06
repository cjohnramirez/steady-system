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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      admin: {
        Row: {
          admin_id: number | null
          email: string | null
          first_name: string | null
          id: string
          is_active: boolean | null
          last_name: string | null
          phone: string| null
          user_id: string | null
          username: string | null
        }
        Insert: {
          admin_id?: number | null
          email?: string | null
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          last_name?: string | null
          phone?: string | null
          user_id?: string | null
          username?: string | null
        }
        Update: {
          admin_id?: number | null
          email?: string | null
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          last_name?: string | null
          phone?: string | null
          user_id?: string | null
          username?: string | null
        }
        Relationships: []
      }
      announcement: {
        Row: {
          announcement_image: string | null
          description: string | null
          end_date: string
          id: string
          location: string
          start_date: string
          title: string
        }
        Insert: {
          announcement_image?: string | null
          description?: string | null
          end_date: string
          id?: string
          location: string
          start_date: string
          title: string
        }
        Update: {
          announcement_image?: string | null
          description?: string | null
          end_date?: string
          id?: string
          location?: string
          start_date?: string
          title?: string
        }
        Relationships: []
      }
      appointment: {
        Row: {
          counselor_id: string | null
          created_at: string | null
          id: string
          notes: string | null
          scheduled_at: string
          status: string | null
          student_id: string | null
        }
        Insert: {
          counselor_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          scheduled_at: string
          status?: string | null
          student_id?: string | null
        }
        Update: {
          counselor_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          scheduled_at?: string
          status?: string | null
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointment_counselor_id_fkey"
            columns: ["counselor_id"]
            isOneToOne: false
            referencedRelation: "counselor"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student"
            referencedColumns: ["id"]
          },
        ]
      }
      article: {
        Row: {
          added_at: string | null
          article_image: string | null
          author_name: string | null
          content: string
          id: string
          publisher_id: string | null
          title: string
        }
        Insert: {
          added_at?: string | null
          article_image?: string | null
          author_name?: string | null
          content: string
          id?: string
          publisher_id?: string | null
          title: string
        }
        Update: {
          added_at?: string | null
          article_image?: string | null
          author_name?: string | null
          content?: string
          id?: string
          publisher_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_publisher_id_fkey"
            columns: ["publisher_id"]
            isOneToOne: false
            referencedRelation: "publisher"
            referencedColumns: ["id"]
          },
        ]
      }
      availability: {
        Row: {
          day_of_week: boolean[] | null
          id: string
          is_active: boolean
          is_recurring: boolean | null
        }
        Insert: {
          day_of_week?: boolean[] | null
          id?: string
          is_active?: boolean
          is_recurring?: boolean | null
        }
        Update: {
          day_of_week?: boolean[] | null
          id?: string
          is_active?: boolean
          is_recurring?: boolean | null
        }
        Relationships: []
      }
      college: {
        Row: {
          abbreviation: string | null
          full_name: string | null
          icon: string | null
          id: string
        }
        Insert: {
          abbreviation?: string | null
          full_name?: string | null
          icon?: string | null
          id?: string
        }
        Update: {
          abbreviation?: string | null
          full_name?: string | null
          icon?: string | null
          id?: string
        }
        Relationships: []
      }
      counselor: {
        Row: {
          availability_id: string
          college_id: string
          counselor_id: number | null
          email: string
          first_name: string
          id: string
          last_name: string | null
          user_id: string | null
        }
        Insert: {
          availability_id: string
          college_id: string
          counselor_id?: number | null
          email: string
          first_name: string
          id?: string
          last_name?: string | null
          user_id?: string | null
        }
        Update: {
          availability_id?: string
          college_id?: string
          counselor_id?: number | null
          email?: string
          first_name?: string
          id?: string
          last_name?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "counselor_availability_id_fkey"
            columns: ["availability_id"]
            isOneToOne: false
            referencedRelation: "availability"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "counselor_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "college"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "counselor_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "student_with_details"
            referencedColumns: ["college_id"]
          },
        ]
      }
      department: {
        Row: {
          college_id: string
          id: string
          title: string
        }
        Insert: {
          college_id: string
          id?: string
          title: string
        }
        Update: {
          college_id?: string
          id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "department_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "college"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "department_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "student_with_details"
            referencedColumns: ["college_id"]
          },
        ]
      }
      emotional_status: {
        Row: {
          id: string
          name: string | null
        }
        Insert: {
          id?: string
          name?: string | null
        }
        Update: {
          id?: string
          name?: string | null
        }
        Relationships: []
      }
      playlist: {
        Row: {
          creator: string | null
          emotional_status_id: string | null
          id: string
          image: string | null
          link: string
          title: string
        }
        Insert: {
          creator?: string | null
          emotional_status_id?: string | null
          id?: string
          image?: string | null
          link: string
          title: string
        }
        Update: {
          creator?: string | null
          emotional_status_id?: string | null
          id?: string
          image?: string | null
          link?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "playlist_emotional_status_id_fkey"
            columns: ["emotional_status_id"]
            isOneToOne: false
            referencedRelation: "emotional_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playlist_emotional_status_id_fkey"
            columns: ["emotional_status_id"]
            isOneToOne: false
            referencedRelation: "student_with_details"
            referencedColumns: ["emotional_status_id"]
          },
        ]
      }
      publisher: {
        Row: {
          id: string
          publisher_icon: string | null
          publisher_name: string
        }
        Insert: {
          id?: string
          publisher_icon?: string | null
          publisher_name: string
        }
        Update: {
          id?: string
          publisher_icon?: string | null
          publisher_name?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          id: number
          permission: Database["public"]["Enums"]["app_permission"]
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          id?: number
          permission: Database["public"]["Enums"]["app_permission"]
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          id?: number
          permission?: Database["public"]["Enums"]["app_permission"]
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      student: {
        Row: {
          department_id: string | null
          email: string
          emotional_status_id: string | null
          first_name: string
          id: string
          last_name: string | null
          student_id: number
          user_id: string | null
          username: string | null
          year_level: number
        }
        Insert: {
          department_id?: string | null
          email: string
          emotional_status_id?: string | null
          first_name: string
          id?: string
          last_name?: string | null
          student_id: number
          user_id?: string | null
          username?: string | null
          year_level: number
        }
        Update: {
          department_id?: string | null
          email?: string
          emotional_status_id?: string | null
          first_name?: string
          id?: string
          last_name?: string | null
          student_id?: number
          user_id?: string | null
          username?: string | null
          year_level?: number
        }
        Relationships: [
          {
            foreignKeyName: "student_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "department"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "student_with_details"
            referencedColumns: ["department_id"]
          },
          {
            foreignKeyName: "student_emotional_status_id_fkey"
            columns: ["emotional_status_id"]
            isOneToOne: false
            referencedRelation: "emotional_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_emotional_status_id_fkey"
            columns: ["emotional_status_id"]
            isOneToOne: false
            referencedRelation: "student_with_details"
            referencedColumns: ["emotional_status_id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: number
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: number
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: number
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      appointment_with_details: {
        Row: {
          first_counselor_name: string | null
          first_student_name: string | null
          last_counselor_name: string | null
          last_student_name: string | null
          notes: string | null
          scheduled_at: string | null
          status: string | null
        }
        Relationships: []
      }
      article_with_details: {
        Row: {
          added_at: string | null
          article_image: string | null
          author_name: string | null
          content: string | null
          id: string | null
          publisher_icon: string | null
          publisher_name: string | null
          title: string | null
        }
        Relationships: []
      }
      counselor_with_details: {
        Row: {
          availability_id: boolean[] | null
          college_id: string | null
          counselor_id: number | null
          email: string | null
          first_name: string | null
          is_active: boolean | null
          last_name: string | null
        }
        Relationships: []
      }
      playlist_with_details: {
        Row: {
          creator: string | null
          emotional_status_name: string | null
          id: string | null
          image: string | null
          link: string | null
          title: string | null
        }
        Relationships: []
      }
      student_with_details: {
        Row: {
          college_id: string | null
          college_name: string | null
          department_id: string | null
          department_name: string | null
          email: string | null
          emotional_status_id: string | null
          emotional_status_name: string | null
          first_name: string | null
          last_name: string | null
          student_id: number | null
          year_level: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      authorize: {
        Args: {
          requested_permission: Database["public"]["Enums"]["app_permission"]
        }
        Returns: boolean
      }
      custom_access_token_hook: { Args: { event: Json }; Returns: Json }
      has_permission: {
        Args: {
          perm: Database["public"]["Enums"]["app_permission"]
          user_uuid: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_permission:
        | "admin.select"
        | "admin.insert"
        | "admin.update"
        | "admin.delete"
        | "student.select"
        | "student.insert"
        | "student.update"
        | "student.delete"
        | "counselor.select"
        | "counselor.insert"
        | "counselor.update"
        | "counselor.delete"
        | "appointment.select"
        | "appointment.insert"
        | "appointment.update"
        | "appointment.delete"
        | "college.select"
        | "college.insert"
        | "college.update"
        | "college.delete"
        | "emotional_status.select"
        | "emotional_status.insert"
        | "emotional_status.update"
        | "emotional_status.delete"
        | "publisher.select"
        | "publisher.insert"
        | "publisher.update"
        | "publisher.delete"
        | "article.select"
        | "article.insert"
        | "article.update"
        | "article.delete"
        | "announcement.select"
        | "announcement.insert"
        | "announcement.update"
        | "announcement.delete"
        | "platform.select"
        | "platform.insert"
        | "platform.update"
        | "platform.delete"
        | "playlist.select"
        | "playlist.insert"
        | "playlist.update"
        | "playlist.delete"
        | "availability.select"
        | "availability.insert"
        | "availability.update"
        | "availability.delete"
        | "department.delete"
        | "department.update"
        | "department.insert"
      app_role: "admin" | "counselor" | "student"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      app_permission: [
        "admin.select",
        "admin.insert",
        "admin.update",
        "admin.delete",
        "student.select",
        "student.insert",
        "student.update",
        "student.delete",
        "counselor.select",
        "counselor.insert",
        "counselor.update",
        "counselor.delete",
        "appointment.select",
        "appointment.insert",
        "appointment.update",
        "appointment.delete",
        "college.select",
        "college.insert",
        "college.update",
        "college.delete",
        "emotional_status.select",
        "emotional_status.insert",
        "emotional_status.update",
        "emotional_status.delete",
        "publisher.select",
        "publisher.insert",
        "publisher.update",
        "publisher.delete",
        "article.select",
        "article.insert",
        "article.update",
        "article.delete",
        "announcement.select",
        "announcement.insert",
        "announcement.update",
        "announcement.delete",
        "platform.select",
        "platform.insert",
        "platform.update",
        "platform.delete",
        "playlist.select",
        "playlist.insert",
        "playlist.update",
        "playlist.delete",
        "availability.select",
        "availability.insert",
        "availability.update",
        "availability.delete",
        "department.delete",
        "department.update",
        "department.insert",
      ],
      app_role: ["admin", "counselor", "student"],
    },
  },
} as const
