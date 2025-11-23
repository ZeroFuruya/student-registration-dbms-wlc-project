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
      courses: {
        Row: {
          course_code: string
          course_id: number
          course_name: string
          created_at: string | null
          semester: number | null
          status: string | null
          units: number
          year_id: number
        }
        Insert: {
          course_code: string
          course_id?: number
          course_name: string
          created_at?: string | null
          semester?: number | null
          status?: string | null
          units: number
          year_id: number
        }
        Update: {
          course_code?: string
          course_id?: number
          course_name?: string
          created_at?: string | null
          semester?: number | null
          status?: string | null
          units?: number
          year_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "courses_year_id_fkey"
            columns: ["year_id"]
            isOneToOne: false
            referencedRelation: "years"
            referencedColumns: ["year_id"]
          },
        ]
      }
      enrollment_documents: {
        Row: {
          document_type: string
          enrollment_id: number
          file_url: string
          id: number
          status: string | null
          uploaded_at: string | null
          verified_at: string | null
          verified_by: number | null
        }
        Insert: {
          document_type: string
          enrollment_id: number
          file_url: string
          id?: number
          status?: string | null
          uploaded_at?: string | null
          verified_at?: string | null
          verified_by?: number | null
        }
        Update: {
          document_type?: string
          enrollment_id?: number
          file_url?: string
          id?: number
          status?: string | null
          uploaded_at?: string | null
          verified_at?: string | null
          verified_by?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "enrollment_documents_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          academic_year: string
          amount_paid: number | null
          approved_at: string | null
          approved_by: number | null
          created_at: string | null
          documents_submitted: boolean | null
          enrollment_status: string | null
          id: number
          payment_status: string | null
          semester: number
          student_id: number
          total_amount: number | null
        }
        Insert: {
          academic_year: string
          amount_paid?: number | null
          approved_at?: string | null
          approved_by?: number | null
          created_at?: string | null
          documents_submitted?: boolean | null
          enrollment_status?: string | null
          id?: number
          payment_status?: string | null
          semester: number
          student_id: number
          total_amount?: number | null
        }
        Update: {
          academic_year?: string
          amount_paid?: number | null
          approved_at?: string | null
          approved_by?: number | null
          created_at?: string | null
          documents_submitted?: boolean | null
          enrollment_status?: string | null
          id?: number
          payment_status?: string | null
          semester?: number
          student_id?: number
          total_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          enrollment_id: number
          id: number
          payment_date: string
          payment_method: string
          reference_number: string | null
          verified_at: string | null
          verified_by: number | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          enrollment_id: number
          id?: number
          payment_date: string
          payment_method: string
          reference_number?: string | null
          verified_at?: string | null
          verified_by?: number | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          enrollment_id?: number
          id?: number
          payment_date?: string
          payment_method?: string
          reference_number?: string | null
          verified_at?: string | null
          verified_by?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      programs: {
        Row: {
          created_at: string | null
          id: number
          program_code: string
          program_name: string
          status: string | null
          total_units: number
          years_to_complete: number
        }
        Insert: {
          created_at?: string | null
          id?: number
          program_code: string
          program_name: string
          status?: string | null
          total_units: number
          years_to_complete: number
        }
        Update: {
          created_at?: string | null
          id?: number
          program_code?: string
          program_name?: string
          status?: string | null
          total_units?: number
          years_to_complete?: number
        }
        Relationships: []
      }
      registrations: {
        Row: {
          address: string | null
          contact_number: string | null
          created_at: string | null
          email: string
          first_name: string
          id: number
          is_returning_student: boolean | null
          last_name: string
          middle_name: string | null
          program_id: number
          remarks: string | null
          reviewed_at: string | null
          reviewed_by: number | null
          status: string | null
          year_level: number
        }
        Insert: {
          address?: string | null
          contact_number?: string | null
          created_at?: string | null
          email: string
          first_name: string
          id?: number
          is_returning_student?: boolean | null
          last_name: string
          middle_name?: string | null
          program_id: number
          remarks?: string | null
          reviewed_at?: string | null
          reviewed_by?: number | null
          status?: string | null
          year_level: number
        }
        Update: {
          address?: string | null
          contact_number?: string | null
          created_at?: string | null
          email?: string
          first_name?: string
          id?: number
          is_returning_student?: boolean | null
          last_name?: string
          middle_name?: string | null
          program_id?: number
          remarks?: string | null
          reviewed_at?: string | null
          reviewed_by?: number | null
          status?: string | null
          year_level?: number
        }
        Relationships: [
          {
            foreignKeyName: "registrations_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          address: string | null
          contact_number: string | null
          created_at: string | null
          email: string
          first_name: string
          id: number
          is_returning_student: boolean | null
          last_name: string
          middle_name: string | null
          program_id: number
          registration_id: number | null
          status: string | null
          student_number: string
          year_level: number
        }
        Insert: {
          address?: string | null
          contact_number?: string | null
          created_at?: string | null
          email: string
          first_name: string
          id?: number
          is_returning_student?: boolean | null
          last_name: string
          middle_name?: string | null
          program_id: number
          registration_id?: number | null
          status?: string | null
          student_number: string
          year_level: number
        }
        Update: {
          address?: string | null
          contact_number?: string | null
          created_at?: string | null
          email?: string
          first_name?: string
          id?: number
          is_returning_student?: boolean | null
          last_name?: string
          middle_name?: string | null
          program_id?: number
          registration_id?: number | null
          status?: string | null
          student_number?: string
          year_level?: number
        }
        Relationships: [
          {
            foreignKeyName: "students_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: true
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      years: {
        Row: {
          created_at: string | null
          program_id: number
          status: string
          year_id: number
          year_level: number
        }
        Insert: {
          created_at?: string | null
          program_id: number
          status?: string
          year_id?: number
          year_level: number
        }
        Update: {
          created_at?: string | null
          program_id?: number
          status?: string
          year_id?: number
          year_level?: number
        }
        Relationships: [
          {
            foreignKeyName: "years_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
