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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      bank_accounts: {
        Row: {
          account_holder: string
          account_number: string
          account_type: string
          bank_name: string
          created_at: string
          id: string
          is_active: boolean
          notes: string | null
          ruc: string | null
          updated_at: string
        }
        Insert: {
          account_holder: string
          account_number: string
          account_type: string
          bank_name: string
          created_at?: string
          id?: string
          is_active?: boolean
          notes?: string | null
          ruc?: string | null
          updated_at?: string
        }
        Update: {
          account_holder?: string
          account_number?: string
          account_type?: string
          bank_name?: string
          created_at?: string
          id?: string
          is_active?: boolean
          notes?: string | null
          ruc?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      bank_reports: {
        Row: {
          bank_account_id: string | null
          created_at: string | null
          created_by: string | null
          filename: string
          id: string
          status: string | null
        }
        Insert: {
          bank_account_id?: string | null
          created_at?: string | null
          created_by?: string | null
          filename: string
          id?: string
          status?: string | null
        }
        Update: {
          bank_account_id?: string | null
          created_at?: string | null
          created_by?: string | null
          filename?: string
          id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bank_reports_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_reports_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bank_transactions: {
        Row: {
          amount: number
          bank_name: string | null
          created_at: string | null
          date: string
          description: string | null
          id: string
          metadata: Json | null
          reference: string | null
          report_id: string | null
        }
        Insert: {
          amount: number
          bank_name?: string | null
          created_at?: string | null
          date: string
          description?: string | null
          id?: string
          metadata?: Json | null
          reference?: string | null
          report_id?: string | null
        }
        Update: {
          amount?: number
          bank_name?: string | null
          created_at?: string | null
          date?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          reference?: string | null
          report_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bank_transactions_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "bank_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          archived_at: string | null
          created_at: string | null
          email: string
          id: string
          is_archived: boolean | null
          message: string
          name: string
          phone: string | null
          replied_at: string | null
          replied_by: string | null
          reply_content: string | null
          status: string | null
        }
        Insert: {
          archived_at?: string | null
          created_at?: string | null
          email: string
          id?: string
          is_archived?: boolean | null
          message: string
          name: string
          phone?: string | null
          replied_at?: string | null
          replied_by?: string | null
          reply_content?: string | null
          status?: string | null
        }
        Update: {
          archived_at?: string | null
          created_at?: string | null
          email?: string
          id?: string
          is_archived?: boolean | null
          message?: string
          name?: string
          phone?: string | null
          replied_at?: string | null
          replied_by?: string | null
          reply_content?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_messages_replied_by_fkey"
            columns: ["replied_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          all_day: boolean | null
          archived_at: string | null
          color: string | null
          create_form: boolean | null
          created_at: string | null
          description: string | null
          end_time: string | null
          form_id: string | null
          id: string
          is_archived: boolean
          is_multi_day: boolean | null
          is_recurring: boolean | null
          location: string | null
          poster_h: number | null
          poster_url: string | null
          poster_w: number | null
          recurrence_pattern: string | null
          registration_link: string | null
          slug: string | null
          start_time: string
          title: string
          user_id: string | null
        }
        Insert: {
          all_day?: boolean | null
          archived_at?: string | null
          color?: string | null
          create_form?: boolean | null
          created_at?: string | null
          description?: string | null
          end_time?: string | null
          form_id?: string | null
          id?: string
          is_archived?: boolean
          is_multi_day?: boolean | null
          is_recurring?: boolean | null
          location?: string | null
          poster_h?: number | null
          poster_url?: string | null
          poster_w?: number | null
          recurrence_pattern?: string | null
          registration_link?: string | null
          slug?: string | null
          start_time: string
          title: string
          user_id?: string | null
        }
        Update: {
          all_day?: boolean | null
          archived_at?: string | null
          color?: string | null
          create_form?: boolean | null
          created_at?: string | null
          description?: string | null
          end_time?: string | null
          form_id?: string | null
          id?: string
          is_archived?: boolean
          is_multi_day?: boolean | null
          is_recurring?: boolean | null
          location?: string | null
          poster_h?: number | null
          poster_url?: string | null
          poster_w?: number | null
          recurrence_pattern?: string | null
          registration_link?: string | null
          slug?: string | null
          start_time?: string
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_form"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
        ]
      }
      form_fields: {
        Row: {
          attachment_type: string | null
          attachment_url: string | null
          created_at: string | null
          form_id: string
          help_text: string | null
          id: string
          label: string
          next_section_id: string | null
          options: Json | null
          order_index: number
          placeholder: string | null
          required: boolean | null
          type: string
          validation: Json | null
          width: string | null
        }
        Insert: {
          attachment_type?: string | null
          attachment_url?: string | null
          created_at?: string | null
          form_id: string
          help_text?: string | null
          id?: string
          label: string
          next_section_id?: string | null
          options?: Json | null
          order_index?: number
          placeholder?: string | null
          required?: boolean | null
          type?: string
          validation?: Json | null
          width?: string | null
        }
        Update: {
          attachment_type?: string | null
          attachment_url?: string | null
          created_at?: string | null
          form_id?: string
          help_text?: string | null
          id?: string
          label?: string
          next_section_id?: string | null
          options?: Json | null
          order_index?: number
          placeholder?: string | null
          required?: boolean | null
          type?: string
          validation?: Json | null
          width?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "form_fields_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
        ]
      }
      form_submission_admin_comments: {
        Row: {
          body: string
          created_at: string
          created_by: string | null
          id: string
          submission_id: string
          updated_at: string
        }
        Insert: {
          body: string
          created_at?: string
          created_by?: string | null
          id?: string
          submission_id: string
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          created_by?: string | null
          id?: string
          submission_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_submission_admin_comments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_submission_admin_comments_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "form_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      form_submission_payments: {
        Row: {
          amount_claimed: number | null
          bank_transaction_id: string | null
          created_at: string | null
          extracted_data: Json | null
          id: string
          manual_disposition: string | null
          manual_disposition_at: string | null
          manual_disposition_by: string | null
          manual_disposition_notes: string | null
          receipt_path: string | null
          reconciliation_notes: string | null
          status: string | null
          submission_id: string
        }
        Insert: {
          amount_claimed?: number | null
          bank_transaction_id?: string | null
          created_at?: string | null
          extracted_data?: Json | null
          id?: string
          manual_disposition?: string | null
          manual_disposition_at?: string | null
          manual_disposition_by?: string | null
          manual_disposition_notes?: string | null
          receipt_path?: string | null
          reconciliation_notes?: string | null
          status?: string | null
          submission_id: string
        }
        Update: {
          amount_claimed?: number | null
          bank_transaction_id?: string | null
          created_at?: string | null
          extracted_data?: Json | null
          id?: string
          manual_disposition?: string | null
          manual_disposition_at?: string | null
          manual_disposition_by?: string | null
          manual_disposition_notes?: string | null
          receipt_path?: string | null
          reconciliation_notes?: string | null
          status?: string | null
          submission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_submission_payments_bank_transaction_id_fkey"
            columns: ["bank_transaction_id"]
            isOneToOne: false
            referencedRelation: "bank_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_submission_payments_manual_disposition_by_fkey"
            columns: ["manual_disposition_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_submission_payments_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "form_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      form_submissions: {
        Row: {
          access_token: string | null
          admin_notes: string | null
          answers: Json
          archived_at: string | null
          coverage_amount: number | null
          coverage_backup_path: string | null
          coverage_created_at: string | null
          coverage_created_by: string | null
          coverage_mode: string | null
          covered_by_submission_id: string | null
          created_at: string | null
          data: Json
          external_activity_name: string | null
          form_id: string
          id: string
          ip_address: string | null
          is_archived: boolean | null
          is_manual: boolean
          notification_email: string | null
          payment_reminder_last_sent_at: string | null
          status: string | null
          submission_status: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          access_token?: string | null
          admin_notes?: string | null
          answers?: Json
          archived_at?: string | null
          coverage_amount?: number | null
          coverage_backup_path?: string | null
          coverage_created_at?: string | null
          coverage_created_by?: string | null
          coverage_mode?: string | null
          covered_by_submission_id?: string | null
          created_at?: string | null
          data?: Json
          external_activity_name?: string | null
          form_id: string
          id?: string
          ip_address?: string | null
          is_archived?: boolean | null
          is_manual?: boolean
          notification_email?: string | null
          payment_reminder_last_sent_at?: string | null
          status?: string | null
          submission_status?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          access_token?: string | null
          admin_notes?: string | null
          answers?: Json
          archived_at?: string | null
          coverage_amount?: number | null
          coverage_backup_path?: string | null
          coverage_created_at?: string | null
          coverage_created_by?: string | null
          coverage_mode?: string | null
          covered_by_submission_id?: string | null
          created_at?: string | null
          data?: Json
          external_activity_name?: string | null
          form_id?: string
          id?: string
          ip_address?: string | null
          is_archived?: boolean | null
          is_manual?: boolean
          notification_email?: string | null
          payment_reminder_last_sent_at?: string | null
          status?: string | null
          submission_status?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "form_submissions_coverage_created_by_fkey"
            columns: ["coverage_created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_submissions_covered_by_submission_id_fkey"
            columns: ["covered_by_submission_id"]
            isOneToOne: false
            referencedRelation: "form_submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_submissions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      forms: {
        Row: {
          archived_at: string | null
          closed_by_limit: boolean
          created_at: string | null
          description: string | null
          destination_account_id: string | null
          enabled: boolean | null
          financial_field_id: string | null
          financial_field_label: string | null
          google_drive_folder_id: string | null
          google_sheet_id: string | null
          google_sheet_url: string | null
          id: string
          image_url: string | null
          is_archived: boolean
          is_financial: boolean | null
          is_internal: boolean | null
          last_synced_at: string | null
          max_installments: number | null
          max_responses: number | null
          payment_reminder_interval_days: number | null
          payment_type: string | null
          slug: string | null
          title: string
          total_amount: number | null
          total_confirmed_balance: number | null
          user_id: string | null
        }
        Insert: {
          archived_at?: string | null
          closed_by_limit?: boolean
          created_at?: string | null
          description?: string | null
          destination_account_id?: string | null
          enabled?: boolean | null
          financial_field_id?: string | null
          financial_field_label?: string | null
          google_drive_folder_id?: string | null
          google_sheet_id?: string | null
          google_sheet_url?: string | null
          id?: string
          image_url?: string | null
          is_archived?: boolean
          is_financial?: boolean | null
          is_internal?: boolean | null
          last_synced_at?: string | null
          max_installments?: number | null
          max_responses?: number | null
          payment_reminder_interval_days?: number | null
          payment_type?: string | null
          slug?: string | null
          title: string
          total_amount?: number | null
          total_confirmed_balance?: number | null
          user_id?: string | null
        }
        Update: {
          archived_at?: string | null
          closed_by_limit?: boolean
          created_at?: string | null
          description?: string | null
          destination_account_id?: string | null
          enabled?: boolean | null
          financial_field_id?: string | null
          financial_field_label?: string | null
          google_drive_folder_id?: string | null
          google_sheet_id?: string | null
          google_sheet_url?: string | null
          id?: string
          image_url?: string | null
          is_archived?: boolean
          is_financial?: boolean | null
          is_internal?: boolean | null
          last_synced_at?: string | null
          max_installments?: number | null
          max_responses?: number | null
          payment_reminder_interval_days?: number | null
          payment_type?: string | null
          slug?: string | null
          title?: string
          total_amount?: number | null
          total_confirmed_balance?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forms_destination_account_id_fkey"
            columns: ["destination_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forms_financial_field_id_fkey"
            columns: ["financial_field_id"]
            isOneToOne: false
            referencedRelation: "form_fields"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forms_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      google_integration: {
        Row: {
          access_token: string | null
          account_email: string | null
          account_name: string | null
          created_at: string
          expires_at: string | null
          id: number
          refresh_token: string
          updated_at: string
        }
        Insert: {
          access_token?: string | null
          account_email?: string | null
          account_name?: string | null
          created_at?: string
          expires_at?: string | null
          id: number
          refresh_token: string
          updated_at?: string
        }
        Update: {
          access_token?: string | null
          account_email?: string | null
          account_name?: string | null
          created_at?: string
          expires_at?: string | null
          id?: number
          refresh_token?: string
          updated_at?: string
        }
        Relationships: []
      }
      lom_passages: {
        Row: {
          archived_at: string | null
          created_at: string | null
          day_of_week: string
          id: number
          is_archived: boolean
          passage_reference: string
          user_id: string | null
          week_number: number | null
          week_start_date: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string | null
          day_of_week: string
          id?: number
          is_archived?: boolean
          passage_reference: string
          user_id?: string | null
          week_number?: number | null
          week_start_date: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string | null
          day_of_week?: string
          id?: number
          is_archived?: boolean
          passage_reference?: string
          user_id?: string | null
          week_number?: number | null
          week_start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "lom_passages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lom_posts: {
        Row: {
          archived_at: string | null
          content: string
          created_at: string | null
          id: string
          is_archived: boolean
          publication_date: string
          slug: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          archived_at?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_archived?: boolean
          publication_date?: string
          slug?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          archived_at?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_archived?: boolean
          publication_date?: string
          slug?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lom_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      news: {
        Row: {
          archived_at: string | null
          created_at: string | null
          description: string | null
          id: string
          image_h: number | null
          image_url: string | null
          image_w: number | null
          is_archived: boolean
          publish_at: string | null
          slug: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          archived_at?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_h?: number | null
          image_url?: string | null
          image_w?: number | null
          is_archived?: boolean
          publish_at?: string | null
          slug?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          archived_at?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_h?: number | null
          image_url?: string | null
          image_w?: number | null
          is_archived?: boolean
          publish_at?: string | null
          slug?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "news_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          link: string | null
          message: string
          read: boolean
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          link?: string | null
          message: string
          read?: boolean
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          link?: string | null
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      prayer_requests: {
        Row: {
          archived_at: string | null
          created_at: string | null
          id: string
          is_anonymous: boolean | null
          is_archived: boolean
          is_public: boolean | null
          name: string | null
          request_text: string
          status: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string | null
          id?: string
          is_anonymous?: boolean | null
          is_archived?: boolean
          is_public?: boolean | null
          name?: string | null
          request_text: string
          status?: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string | null
          id?: string
          is_anonymous?: boolean | null
          is_archived?: boolean
          is_public?: boolean | null
          name?: string | null
          request_text?: string
          status?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          email: string | null
          full_name: string | null
          id: string
          is_super_admin: boolean | null
          notify_dash_contact: boolean | null
          notify_dash_internal: boolean | null
          notify_dash_prayer: boolean | null
          notify_email_contact: boolean | null
          notify_email_internal: boolean | null
          notify_email_prayer: boolean | null
          perm_comunidad: boolean | null
          perm_events: boolean | null
          perm_finanzas: boolean | null
          perm_forms: boolean | null
          perm_internal_forms: boolean | null
          perm_lom: boolean | null
          perm_news: boolean | null
          updated_at: string
        }
        Insert: {
          email?: string | null
          full_name?: string | null
          id: string
          is_super_admin?: boolean | null
          notify_dash_contact?: boolean | null
          notify_dash_internal?: boolean | null
          notify_dash_prayer?: boolean | null
          notify_email_contact?: boolean | null
          notify_email_internal?: boolean | null
          notify_email_prayer?: boolean | null
          perm_comunidad?: boolean | null
          perm_events?: boolean | null
          perm_finanzas?: boolean | null
          perm_forms?: boolean | null
          perm_internal_forms?: boolean | null
          perm_lom?: boolean | null
          perm_news?: boolean | null
          updated_at?: string
        }
        Update: {
          email?: string | null
          full_name?: string | null
          id?: string
          is_super_admin?: boolean | null
          notify_dash_contact?: boolean | null
          notify_dash_internal?: boolean | null
          notify_dash_prayer?: boolean | null
          notify_email_contact?: boolean | null
          notify_email_internal?: boolean | null
          notify_email_prayer?: boolean | null
          perm_comunidad?: boolean | null
          perm_events?: boolean | null
          perm_finanzas?: boolean | null
          perm_forms?: boolean | null
          perm_internal_forms?: boolean | null
          perm_lom?: boolean | null
          perm_news?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          announcement_enabled: boolean | null
          announcement_link: string | null
          announcement_text: string | null
          id: number
          maintenance_mode: boolean | null
          notification_email: string | null
          updated_at: string | null
        }
        Insert: {
          announcement_enabled?: boolean | null
          announcement_link?: string | null
          announcement_text?: string | null
          id?: number
          maintenance_mode?: boolean | null
          notification_email?: string | null
          updated_at?: string | null
        }
        Update: {
          announcement_enabled?: boolean | null
          announcement_link?: string | null
          announcement_text?: string | null
          id?: number
          maintenance_mode?: boolean | null
          notification_email?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_form_financial_summary: {
        Args: { target_form_id: string }
        Returns: {
          total_amount: number
          total_submissions: number
          verified_submissions: number
        }[]
      }
    }
    Enums: {
      financial_status_type:
        | "pending"
        | "verified"
        | "rejected"
        | "manual_review"
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
      financial_status_type: [
        "pending",
        "verified",
        "rejected",
        "manual_review",
      ],
    },
  },
} as const
