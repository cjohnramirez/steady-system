export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.17";
  };
  public: {
    Tables: {
      action_item: {
        Row: {
          appointment_id: string | null;
          counselor_id: string | null;
          created_at: string;
          due_date: string | null;
          id: string;
          is_completed: boolean;
          student_id: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          appointment_id?: string | null;
          counselor_id?: string | null;
          created_at?: string;
          due_date?: string | null;
          id?: string;
          is_completed?: boolean;
          student_id: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          appointment_id?: string | null;
          counselor_id?: string | null;
          created_at?: string;
          due_date?: string | null;
          id?: string;
          is_completed?: boolean;
          student_id?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "action_item_appointment_id_fkey";
            columns: ["appointment_id"];
            isOneToOne: false;
            referencedRelation: "admin_appointment_audit";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "action_item_appointment_id_fkey";
            columns: ["appointment_id"];
            isOneToOne: false;
            referencedRelation: "appointment";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "action_item_appointment_id_fkey";
            columns: ["appointment_id"];
            isOneToOne: false;
            referencedRelation: "appointment_with_details";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "action_item_counselor_id_fkey";
            columns: ["counselor_id"];
            isOneToOne: false;
            referencedRelation: "counselor";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "action_item_counselor_id_fkey";
            columns: ["counselor_id"];
            isOneToOne: false;
            referencedRelation: "counselor_with_details";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "action_item_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "student";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "action_item_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "student_with_details";
            referencedColumns: ["id"];
          },
        ];
      };
      admin: {
        Row: {
          avatar: string;
          email: string;
          first_name: string;
          id: string;
          is_active: boolean;
          last_name: string;
          phone: string;
          university_id: number;
          user_id: string | null;
          username: string;
        };
        Insert: {
          avatar?: string;
          email: string;
          first_name: string;
          id?: string;
          is_active?: boolean;
          last_name?: string;
          phone?: string;
          university_id?: number;
          user_id?: string | null;
          username: string;
        };
        Update: {
          avatar?: string;
          email?: string;
          first_name?: string;
          id?: string;
          is_active?: boolean;
          last_name?: string;
          phone?: string;
          university_id?: number;
          user_id?: string | null;
          username?: string;
        };
        Relationships: [];
      };
      analytics_daily_login: {
        Row: {
          date: string;
          number_of_logins: number;
        };
        Insert: {
          date: string;
          number_of_logins?: number;
        };
        Update: {
          date?: string;
          number_of_logins?: number;
        };
        Relationships: [];
      };
      analytics_daily_visitor: {
        Row: {
          date: string;
          number_of_visitors: number;
        };
        Insert: {
          date: string;
          number_of_visitors?: number;
        };
        Update: {
          date?: string;
          number_of_visitors?: number;
        };
        Relationships: [];
      };
      announcement: {
        Row: {
          announcement_image: string;
          description: string;
          end_date: string;
          id: string;
          location: string;
          start_date: string;
          title: string;
        };
        Insert: {
          announcement_image?: string;
          description?: string;
          end_date: string;
          id?: string;
          location: string;
          start_date: string;
          title: string;
        };
        Update: {
          announcement_image?: string;
          description?: string;
          end_date?: string;
          id?: string;
          location?: string;
          start_date?: string;
          title?: string;
        };
        Relationships: [];
      };
      appointment: {
        Row: {
          completed_at: string | null;
          counselor_id: string | null;
          created_at: string;
          created_by_role: Database["public"]["Enums"]["app_role"];
          duration_minutes: number;
          id: string;
          notes: string;
          reason: string;
          scheduled_at: string;
          started_at: string | null;
          status: Database["public"]["Enums"]["appointment_status"];
          student_id: string | null;
          updated_at: string;
          urgency: Database["public"]["Enums"]["urgency_level"];
        };
        Insert: {
          completed_at?: string | null;
          counselor_id?: string | null;
          created_at?: string;
          created_by_role?: Database["public"]["Enums"]["app_role"];
          duration_minutes?: number;
          id?: string;
          notes?: string;
          reason?: string;
          scheduled_at: string;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["appointment_status"];
          student_id?: string | null;
          updated_at?: string;
          urgency?: Database["public"]["Enums"]["urgency_level"];
        };
        Update: {
          completed_at?: string | null;
          counselor_id?: string | null;
          created_at?: string;
          created_by_role?: Database["public"]["Enums"]["app_role"];
          duration_minutes?: number;
          id?: string;
          notes?: string;
          reason?: string;
          scheduled_at?: string;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["appointment_status"];
          student_id?: string | null;
          updated_at?: string;
          urgency?: Database["public"]["Enums"]["urgency_level"];
        };
        Relationships: [
          {
            foreignKeyName: "appointment_counselor_id_fkey";
            columns: ["counselor_id"];
            isOneToOne: false;
            referencedRelation: "counselor";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointment_counselor_id_fkey";
            columns: ["counselor_id"];
            isOneToOne: false;
            referencedRelation: "counselor_with_details";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointment_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "student";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointment_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "student_with_details";
            referencedColumns: ["id"];
          },
        ];
      };
      article: {
        Row: {
          added_at: string;
          article_image: string;
          author_name: string;
          content: string;
          emotional_status_id: string;
          id: string;
          link: string;
          publisher_name: string;
          title: string;
        };
        Insert: {
          added_at?: string;
          article_image?: string;
          author_name?: string;
          content: string;
          emotional_status_id: string;
          id?: string;
          link?: string;
          publisher_name?: string;
          title: string;
        };
        Update: {
          added_at?: string;
          article_image?: string;
          author_name?: string;
          content?: string;
          emotional_status_id?: string;
          id?: string;
          link?: string;
          publisher_name?: string;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "article_emotional_status_id_fkey";
            columns: ["emotional_status_id"];
            isOneToOne: false;
            referencedRelation: "emotional_status";
            referencedColumns: ["id"];
          },
        ];
      };
      clinical_note: {
        Row: {
          appointment_id: string;
          content: Json;
          counselor_id: string;
          created_at: string;
          format: Database["public"]["Enums"]["note_format"];
          id: string;
          locked_at: string | null;
          updated_at: string;
        };
        Insert: {
          appointment_id: string;
          content?: Json;
          counselor_id: string;
          created_at?: string;
          format?: Database["public"]["Enums"]["note_format"];
          id?: string;
          locked_at?: string | null;
          updated_at?: string;
        };
        Update: {
          appointment_id?: string;
          content?: Json;
          counselor_id?: string;
          created_at?: string;
          format?: Database["public"]["Enums"]["note_format"];
          id?: string;
          locked_at?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "clinical_note_appointment_id_fkey";
            columns: ["appointment_id"];
            isOneToOne: true;
            referencedRelation: "admin_appointment_audit";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "clinical_note_appointment_id_fkey";
            columns: ["appointment_id"];
            isOneToOne: true;
            referencedRelation: "appointment";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "clinical_note_appointment_id_fkey";
            columns: ["appointment_id"];
            isOneToOne: true;
            referencedRelation: "appointment_with_details";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "clinical_note_counselor_id_fkey";
            columns: ["counselor_id"];
            isOneToOne: false;
            referencedRelation: "counselor";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "clinical_note_counselor_id_fkey";
            columns: ["counselor_id"];
            isOneToOne: false;
            referencedRelation: "counselor_with_details";
            referencedColumns: ["id"];
          },
        ];
      };
      college: {
        Row: {
          abbreviation: string;
          full_name: string;
          id: string;
        };
        Insert: {
          abbreviation?: string;
          full_name?: string;
          id?: string;
        };
        Update: {
          abbreviation?: string;
          full_name?: string;
          id?: string;
        };
        Relationships: [];
      };
      contact_person: {
        Row: {
          created_at: string;
          first_name: string;
          id: number;
          last_name: string;
          middle_name: string | null;
          phone: string;
          student_id: string;
        };
        Insert: {
          created_at?: string;
          first_name: string;
          id?: never;
          last_name: string;
          middle_name?: string | null;
          phone: string;
          student_id: string;
        };
        Update: {
          created_at?: string;
          first_name?: string;
          id?: never;
          last_name?: string;
          middle_name?: string | null;
          phone?: string;
          student_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "contact_person_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "student";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "contact_person_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "student_with_details";
            referencedColumns: ["id"];
          },
        ];
      };
      counselor: {
        Row: {
          avatar: string;
          bio: string;
          buffer_minutes: number;
          contact_channels: Json;
          day_of_week: boolean[];
          duty_status: Database["public"]["Enums"]["duty_status"];
          email: string;
          end_time: string;
          first_name: string;
          id: string;
          is_active: boolean | null;
          last_name: string;
          lunch_end: string;
          lunch_start: string;
          office_room: string;
          phone: string;
          start_time: string;
          university_id: number;
          user_id: string | null;
          username: string;
        };
        Insert: {
          avatar?: string;
          bio?: string;
          buffer_minutes?: number;
          contact_channels?: Json;
          day_of_week?: boolean[];
          duty_status?: Database["public"]["Enums"]["duty_status"];
          email: string;
          end_time?: string;
          first_name: string;
          id?: string;
          is_active?: boolean | null;
          last_name?: string;
          lunch_end?: string;
          lunch_start?: string;
          office_room?: string;
          phone: string;
          start_time?: string;
          university_id: number;
          user_id?: string | null;
          username: string;
        };
        Update: {
          avatar?: string;
          bio?: string;
          buffer_minutes?: number;
          contact_channels?: Json;
          day_of_week?: boolean[];
          duty_status?: Database["public"]["Enums"]["duty_status"];
          email?: string;
          end_time?: string;
          first_name?: string;
          id?: string;
          is_active?: boolean | null;
          last_name?: string;
          lunch_end?: string;
          lunch_start?: string;
          office_room?: string;
          phone?: string;
          start_time?: string;
          university_id?: number;
          user_id?: string | null;
          username?: string;
        };
        Relationships: [];
      };
      department: {
        Row: {
          college_id: string;
          counselor_id: string | null;
          id: string;
          title: string;
        };
        Insert: {
          college_id: string;
          counselor_id?: string | null;
          id?: string;
          title: string;
        };
        Update: {
          college_id?: string;
          counselor_id?: string | null;
          id?: string;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "department_college_id_fkey";
            columns: ["college_id"];
            isOneToOne: false;
            referencedRelation: "college";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "department_college_id_fkey";
            columns: ["college_id"];
            isOneToOne: false;
            referencedRelation: "student_with_details";
            referencedColumns: ["college_id"];
          },
          {
            foreignKeyName: "department_counselor_id_fkey";
            columns: ["counselor_id"];
            isOneToOne: false;
            referencedRelation: "counselor";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "department_counselor_id_fkey";
            columns: ["counselor_id"];
            isOneToOne: false;
            referencedRelation: "counselor_with_details";
            referencedColumns: ["id"];
          },
        ];
      };
      emotional_status: {
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
      notification: {
        Row: {
          body: string;
          created_at: string;
          id: string;
          link: string | null;
          read_at: string | null;
          title: string;
          type: Database["public"]["Enums"]["notification_type"];
          user_id: string;
        };
        Insert: {
          body?: string;
          created_at?: string;
          id?: string;
          link?: string | null;
          read_at?: string | null;
          title: string;
          type?: Database["public"]["Enums"]["notification_type"];
          user_id: string;
        };
        Update: {
          body?: string;
          created_at?: string;
          id?: string;
          link?: string | null;
          read_at?: string | null;
          title?: string;
          type?: Database["public"]["Enums"]["notification_type"];
          user_id?: string;
        };
        Relationships: [];
      };
      organization: {
        Row: {
          abbreviation: string;
          day_of_week: boolean[];
          email: string;
          end_office_hour: string;
          id: string;
          name: string;
          office_location: string;
          phone: string;
          start_office_hour: string;
        };
        Insert: {
          abbreviation: string;
          day_of_week?: boolean[];
          email: string;
          end_office_hour?: string;
          id?: string;
          name: string;
          office_location: string;
          phone: string;
          start_office_hour?: string;
        };
        Update: {
          abbreviation?: string;
          day_of_week?: boolean[];
          email?: string;
          end_office_hour?: string;
          id?: string;
          name?: string;
          office_location?: string;
          phone?: string;
          start_office_hour?: string;
        };
        Relationships: [];
      };
      organization_contact: {
        Row: {
          contact_detail: string;
          id: string;
          platform: string;
        };
        Insert: {
          contact_detail: string;
          id?: string;
          platform: string;
        };
        Update: {
          contact_detail?: string;
          id?: string;
          platform?: string;
        };
        Relationships: [];
      };
      playlist: {
        Row: {
          creator: string;
          emotional_status_id: string;
          id: string;
          image: string;
          link: string;
          title: string;
        };
        Insert: {
          creator?: string;
          emotional_status_id: string;
          id?: string;
          image?: string;
          link: string;
          title: string;
        };
        Update: {
          creator?: string;
          emotional_status_id?: string;
          id?: string;
          image?: string;
          link?: string;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "playlist_emotional_status_id_fkey";
            columns: ["emotional_status_id"];
            isOneToOne: false;
            referencedRelation: "emotional_status";
            referencedColumns: ["id"];
          },
        ];
      };
      role_permissions: {
        Row: {
          id: number;
          permission: Database["public"]["Enums"]["app_permission"];
          role: Database["public"]["Enums"]["app_role"];
        };
        Insert: {
          id?: never;
          permission: Database["public"]["Enums"]["app_permission"];
          role: Database["public"]["Enums"]["app_role"];
        };
        Update: {
          id?: never;
          permission?: Database["public"]["Enums"]["app_permission"];
          role?: Database["public"]["Enums"]["app_role"];
        };
        Relationships: [];
      };
      student: {
        Row: {
          age: number | null;
          avatar: string;
          consent_accepted_at: string | null;
          department_id: string;
          email: string;
          emotional_status_id: string | null;
          first_name: string;
          gender: string | null;
          id: string;
          is_disabled: boolean;
          last_active_at: string;
          last_name: string;
          middle_name: string | null;
          phone: string | null;
          university_id: number;
          user_id: string | null;
          username: string;
          year_level: number;
        };
        Insert: {
          age?: number | null;
          avatar?: string;
          consent_accepted_at?: string | null;
          department_id: string;
          email: string;
          emotional_status_id?: string | null;
          first_name: string;
          gender?: string | null;
          id?: string;
          is_disabled?: boolean;
          last_active_at?: string;
          last_name?: string;
          middle_name?: string | null;
          phone?: string | null;
          university_id: number;
          user_id?: string | null;
          username: string;
          year_level: number;
        };
        Update: {
          age?: number | null;
          avatar?: string;
          consent_accepted_at?: string | null;
          department_id?: string;
          email?: string;
          emotional_status_id?: string | null;
          first_name?: string;
          gender?: string | null;
          id?: string;
          is_disabled?: boolean;
          last_active_at?: string;
          last_name?: string;
          middle_name?: string | null;
          phone?: string | null;
          university_id?: number;
          user_id?: string | null;
          username?: string;
          year_level?: number;
        };
        Relationships: [
          {
            foreignKeyName: "student_department_id_fkey";
            columns: ["department_id"];
            isOneToOne: false;
            referencedRelation: "department";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "student_emotional_status_id_fkey";
            columns: ["emotional_status_id"];
            isOneToOne: false;
            referencedRelation: "emotional_status";
            referencedColumns: ["id"];
          },
        ];
      };
      user_roles: {
        Row: {
          id: number;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          id?: never;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          id?: never;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
      warm_referral: {
        Row: {
          appointment_id: string | null;
          created_at: string;
          external_clinic: string;
          from_counselor_id: string;
          id: string;
          status: Database["public"]["Enums"]["referral_status"];
          student_id: string;
          summary: string;
          to_counselor_id: string | null;
          updated_at: string;
          urgency: Database["public"]["Enums"]["urgency_level"];
        };
        Insert: {
          appointment_id?: string | null;
          created_at?: string;
          external_clinic?: string;
          from_counselor_id: string;
          id?: string;
          status?: Database["public"]["Enums"]["referral_status"];
          student_id: string;
          summary: string;
          to_counselor_id?: string | null;
          updated_at?: string;
          urgency?: Database["public"]["Enums"]["urgency_level"];
        };
        Update: {
          appointment_id?: string | null;
          created_at?: string;
          external_clinic?: string;
          from_counselor_id?: string;
          id?: string;
          status?: Database["public"]["Enums"]["referral_status"];
          student_id?: string;
          summary?: string;
          to_counselor_id?: string | null;
          updated_at?: string;
          urgency?: Database["public"]["Enums"]["urgency_level"];
        };
        Relationships: [
          {
            foreignKeyName: "warm_referral_appointment_id_fkey";
            columns: ["appointment_id"];
            isOneToOne: false;
            referencedRelation: "admin_appointment_audit";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "warm_referral_appointment_id_fkey";
            columns: ["appointment_id"];
            isOneToOne: false;
            referencedRelation: "appointment";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "warm_referral_appointment_id_fkey";
            columns: ["appointment_id"];
            isOneToOne: false;
            referencedRelation: "appointment_with_details";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "warm_referral_from_counselor_id_fkey";
            columns: ["from_counselor_id"];
            isOneToOne: false;
            referencedRelation: "counselor";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "warm_referral_from_counselor_id_fkey";
            columns: ["from_counselor_id"];
            isOneToOne: false;
            referencedRelation: "counselor_with_details";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "warm_referral_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "student";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "warm_referral_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "student_with_details";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "warm_referral_to_counselor_id_fkey";
            columns: ["to_counselor_id"];
            isOneToOne: false;
            referencedRelation: "counselor";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "warm_referral_to_counselor_id_fkey";
            columns: ["to_counselor_id"];
            isOneToOne: false;
            referencedRelation: "counselor_with_details";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      admin_appointment_audit: {
        Row: {
          college_name: string | null;
          counselor_id: string | null;
          counselor_name: string | null;
          created_at: string | null;
          created_by_role: Database["public"]["Enums"]["app_role"] | null;
          department_name: string | null;
          duration_minutes: number | null;
          has_warm_referral: boolean | null;
          id: string | null;
          obfuscated_student_code: string | null;
          office_room: string | null;
          scheduled_at: string | null;
          status: Database["public"]["Enums"]["appointment_status"] | null;
          updated_at: string | null;
          urgency: Database["public"]["Enums"]["urgency_level"] | null;
        };
        Relationships: [
          {
            foreignKeyName: "appointment_counselor_id_fkey";
            columns: ["counselor_id"];
            isOneToOne: false;
            referencedRelation: "counselor";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointment_counselor_id_fkey";
            columns: ["counselor_id"];
            isOneToOne: false;
            referencedRelation: "counselor_with_details";
            referencedColumns: ["id"];
          },
        ];
      };
      appointment_with_details: {
        Row: {
          counselor_id: string | null;
          created_at: string | null;
          first_counselor_name: string | null;
          first_student_name: string | null;
          id: string | null;
          last_counselor_name: string | null;
          last_student_name: string | null;
          notes: string | null;
          reason: string | null;
          scheduled_at: string | null;
          status: Database["public"]["Enums"]["appointment_status"] | null;
          student_email: string | null;
          student_id: string | null;
          student_university_id: number | null;
          updated_at: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "appointment_counselor_id_fkey";
            columns: ["counselor_id"];
            isOneToOne: false;
            referencedRelation: "counselor";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointment_counselor_id_fkey";
            columns: ["counselor_id"];
            isOneToOne: false;
            referencedRelation: "counselor_with_details";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointment_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "student";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointment_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "student_with_details";
            referencedColumns: ["id"];
          },
        ];
      };
      counselor_with_details: {
        Row: {
          avatar: string | null;
          day_of_week: boolean[] | null;
          department: string | null;
          department_ids: string[] | null;
          email: string | null;
          end_time: string | null;
          first_name: string | null;
          id: string | null;
          is_active: boolean | null;
          last_name: string | null;
          phone: string | null;
          start_time: string | null;
          university_id: number | null;
          user_id: string | null;
          username: string | null;
        };
        Relationships: [];
      };
      playlist_with_details: {
        Row: {
          creator: string | null;
          emotional_status_id: string | null;
          emotional_status_name: string | null;
          id: string | null;
          image: string | null;
          link: string | null;
          title: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "playlist_emotional_status_id_fkey";
            columns: ["emotional_status_id"];
            isOneToOne: false;
            referencedRelation: "emotional_status";
            referencedColumns: ["id"];
          },
        ];
      };
      student_with_details: {
        Row: {
          age: number | null;
          college_id: string | null;
          college_name: string | null;
          counselor_first_name: string | null;
          counselor_id: string | null;
          counselor_last_name: string | null;
          department: string | null;
          department_id: string | null;
          email: string | null;
          emotional_status: string | null;
          emotional_status_id: string | null;
          first_name: string | null;
          gender: string | null;
          id: string | null;
          last_name: string | null;
          middle_name: string | null;
          phone: string | null;
          university_id: number | null;
          user_id: string | null;
          username: string | null;
          year_level: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "department_counselor_id_fkey";
            columns: ["counselor_id"];
            isOneToOne: false;
            referencedRelation: "counselor";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "department_counselor_id_fkey";
            columns: ["counselor_id"];
            isOneToOne: false;
            referencedRelation: "counselor_with_details";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "student_department_id_fkey";
            columns: ["department_id"];
            isOneToOne: false;
            referencedRelation: "department";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "student_emotional_status_id_fkey";
            columns: ["emotional_status_id"];
            isOneToOne: false;
            referencedRelation: "emotional_status";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Functions: {
      admin_dashboard_stats: { Args: { p_days?: number }; Returns: Json };
      app_timezone: { Args: never; Returns: string };
      app_today: { Args: never; Returns: string };
      authorize: {
        Args: {
          requested_permission: Database["public"]["Enums"]["app_permission"];
        };
        Returns: boolean;
      };
      current_app_role: {
        Args: never;
        Returns: Database["public"]["Enums"]["app_role"];
      };
      current_counselor_department_ids: { Args: never; Returns: string[] };
      current_counselor_id: { Args: never; Returns: string };
      current_student_id: { Args: never; Returns: string };
      custom_access_token_hook: { Args: { event: Json }; Returns: Json };
      get_available_slots: {
        Args: { p_counselor_id: string; p_day: string };
        Returns: string[];
      };
      has_permission: {
        Args: { perm: Database["public"]["Enums"]["app_permission"] };
        Returns: boolean;
      };
      increment_daily_login: { Args: never; Returns: undefined };
      increment_daily_visitor: { Args: never; Returns: undefined };
      is_admin: { Args: never; Returns: boolean };
      is_username_available: { Args: { p_username: string }; Returns: boolean };
      notify_role: {
        Args: {
          p_body?: string;
          p_link?: string;
          p_role: Database["public"]["Enums"]["app_role"];
          p_title: string;
        };
        Returns: number;
      };
      replace_contact_persons: {
        Args: { p_contacts: Json; p_student_id: string };
        Returns: {
          created_at: string;
          first_name: string;
          id: number;
          last_name: string;
          middle_name: string | null;
          phone: string;
          student_id: string;
        }[];
        SetofOptions: {
          from: "*";
          to: "contact_person";
          isOneToOne: false;
          isSetofReturn: true;
        };
      };
      slot_duration: { Args: never; Returns: string };
    };
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
        | "organization.update";
      app_role: "admin" | "counselor" | "student";
      appointment_status:
        | "pending"
        | "approved"
        | "completed"
        | "cancelled"
        | "rejected";
      duty_status: "available" | "in_session" | "writing_notes" | "off_duty";
      note_format: "soap" | "sap";
      notification_type: "appointment" | "announcement" | "system";
      referral_status: "pending" | "accepted" | "declined" | "completed";
      urgency_level: "low" | "medium" | "high";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
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
        "organization.update",
      ],
      app_role: ["admin", "counselor", "student"],
      appointment_status: [
        "pending",
        "approved",
        "completed",
        "cancelled",
        "rejected",
      ],
      duty_status: ["available", "in_session", "writing_notes", "off_duty"],
      note_format: ["soap", "sap"],
      notification_type: ["appointment", "announcement", "system"],
      referral_status: ["pending", "accepted", "declined", "completed"],
      urgency_level: ["low", "medium", "high"],
    },
  },
} as const;
