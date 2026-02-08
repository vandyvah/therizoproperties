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
      activity_log: {
        Row: {
          action: string
          created_at: string
          description: string | null
          entity_id: string
          entity_type: Database["public"]["Enums"]["activity_entity_type"]
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          description?: string | null
          entity_id: string
          entity_type: Database["public"]["Enums"]["activity_entity_type"]
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          description?: string | null
          entity_id?: string
          entity_type?: Database["public"]["Enums"]["activity_entity_type"]
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          metadata: Json | null
          read: boolean
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          metadata?: Json | null
          read?: boolean
          title: string
          type?: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          metadata?: Json | null
          read?: boolean
          title?: string
          type?: string
        }
        Relationships: []
      }
      announcements: {
        Row: {
          category: string
          content: string
          created_at: string
          created_by_id: string | null
          id: string
          is_featured: boolean
          published_at: string
          title: string
        }
        Insert: {
          category?: string
          content: string
          created_at?: string
          created_by_id?: string | null
          id?: string
          is_featured?: boolean
          published_at?: string
          title: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          created_by_id?: string | null
          id?: string
          is_featured?: boolean
          published_at?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_created_by_id_fkey"
            columns: ["created_by_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          actor_user_id: string | null
          created_at: string
          details: Json | null
          id: string
          target_user_id: string | null
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          target_user_id?: string | null
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          target_user_id?: string | null
        }
        Relationships: []
      }
      blog_clusters: {
        Row: {
          created_at: string
          custom_content: string | null
          description: string | null
          featured_image_url: string | null
          id: string
          is_auto_generated: boolean
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          custom_content?: string | null
          description?: string | null
          featured_image_url?: string | null
          id?: string
          is_auto_generated?: boolean
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          custom_content?: string | null
          description?: string | null
          featured_image_url?: string | null
          id?: string
          is_auto_generated?: boolean
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      blog_internal_links: {
        Row: {
          created_at: string
          id: string
          source_post_id: string
          target_post_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          source_post_id: string
          target_post_id: string
        }
        Update: {
          created_at?: string
          id?: string
          source_post_id?: string
          target_post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_internal_links_source_post_id_fkey"
            columns: ["source_post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_internal_links_target_post_id_fkey"
            columns: ["target_post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_post_images: {
        Row: {
          alt_text: string
          caption: string | null
          created_at: string
          id: string
          image_url: string
          post_id: string
          sort_order: number | null
        }
        Insert: {
          alt_text: string
          caption?: string | null
          created_at?: string
          id?: string
          image_url: string
          post_id: string
          sort_order?: number | null
        }
        Update: {
          alt_text?: string
          caption?: string | null
          created_at?: string
          id?: string
          image_url?: string
          post_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_post_images_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          accuracy_confirmed: boolean
          author_name: string
          body_content: string
          category: string
          cluster_id: string | null
          created_at: string
          created_by_id: string | null
          featured_image_alt: string
          featured_image_caption: string | null
          featured_image_url: string
          id: string
          no_filler_confirmed: boolean
          originality_confirmed: boolean
          primary_keyword: string
          published_at: string | null
          query_targets: string[]
          slug: string
          status: string
          summary_answer: string
          tags: string[] | null
          title: string
          updated_at: string
          word_count: number
        }
        Insert: {
          accuracy_confirmed?: boolean
          author_name: string
          body_content: string
          category: string
          cluster_id?: string | null
          created_at?: string
          created_by_id?: string | null
          featured_image_alt: string
          featured_image_caption?: string | null
          featured_image_url: string
          id?: string
          no_filler_confirmed?: boolean
          originality_confirmed?: boolean
          primary_keyword: string
          published_at?: string | null
          query_targets?: string[]
          slug: string
          status?: string
          summary_answer: string
          tags?: string[] | null
          title: string
          updated_at?: string
          word_count?: number
        }
        Update: {
          accuracy_confirmed?: boolean
          author_name?: string
          body_content?: string
          category?: string
          cluster_id?: string | null
          created_at?: string
          created_by_id?: string | null
          featured_image_alt?: string
          featured_image_caption?: string | null
          featured_image_url?: string
          id?: string
          no_filler_confirmed?: boolean
          originality_confirmed?: boolean
          primary_keyword?: string
          published_at?: string | null
          query_targets?: string[]
          slug?: string
          status?: string
          summary_answer?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          word_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_cluster_id_fkey"
            columns: ["cluster_id"]
            isOneToOne: false
            referencedRelation: "blog_clusters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_posts_created_by_id_fkey"
            columns: ["created_by_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          assigned_consultant_id: string | null
          client_type: Database["public"]["Enums"]["client_type"]
          created_at: string
          email: string | null
          full_name: string
          id: string
          notes: string | null
          phone: string | null
          source: Database["public"]["Enums"]["client_source"]
        }
        Insert: {
          assigned_consultant_id?: string | null
          client_type: Database["public"]["Enums"]["client_type"]
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          notes?: string | null
          phone?: string | null
          source?: Database["public"]["Enums"]["client_source"]
        }
        Update: {
          assigned_consultant_id?: string | null
          client_type?: Database["public"]["Enums"]["client_type"]
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          notes?: string | null
          phone?: string | null
          source?: Database["public"]["Enums"]["client_source"]
        }
        Relationships: [
          {
            foreignKeyName: "clients_assigned_consultant_id_fkey"
            columns: ["assigned_consultant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_submissions: {
        Row: {
          budget: string | null
          client_type: string | null
          created_at: string
          email: string
          id: string
          message: string
          name: string
          page: string | null
          phone: string | null
          preferred_location: string | null
          status: string
        }
        Insert: {
          budget?: string | null
          client_type?: string | null
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          page?: string | null
          phone?: string | null
          preferred_location?: string | null
          status?: string
        }
        Update: {
          budget?: string | null
          client_type?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          page?: string | null
          phone?: string | null
          preferred_location?: string | null
          status?: string
        }
        Relationships: []
      }
      deal_consultant_shares: {
        Row: {
          amount_ngn: number
          consultant_id: string
          created_at: string
          deal_id: string
          id: string
          role_type: Database["public"]["Enums"]["consultant_role_type"]
          share_percentage_of_net: number
        }
        Insert: {
          amount_ngn?: number
          consultant_id: string
          created_at?: string
          deal_id: string
          id?: string
          role_type: Database["public"]["Enums"]["consultant_role_type"]
          share_percentage_of_net?: number
        }
        Update: {
          amount_ngn?: number
          consultant_id?: string
          created_at?: string
          deal_id?: string
          id?: string
          role_type?: Database["public"]["Enums"]["consultant_role_type"]
          share_percentage_of_net?: number
        }
        Relationships: [
          {
            foreignKeyName: "deal_consultant_shares_consultant_id_fkey"
            columns: ["consultant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_consultant_shares_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          buyer_client_id: string | null
          closing_date: string | null
          created_at: string
          direct_deal_costs_ngn: number
          gross_commission_amount_ngn: number
          gross_commission_rate: number
          id: string
          lead_id: string | null
          net_company_commission_ngn: number
          notes: string | null
          property_id: string
          sale_price_ngn: number
          seller_client_id: string | null
          status: Database["public"]["Enums"]["deal_status"]
          updated_at: string
        }
        Insert: {
          buyer_client_id?: string | null
          closing_date?: string | null
          created_at?: string
          direct_deal_costs_ngn?: number
          gross_commission_amount_ngn?: number
          gross_commission_rate?: number
          id?: string
          lead_id?: string | null
          net_company_commission_ngn?: number
          notes?: string | null
          property_id: string
          sale_price_ngn?: number
          seller_client_id?: string | null
          status?: Database["public"]["Enums"]["deal_status"]
          updated_at?: string
        }
        Update: {
          buyer_client_id?: string | null
          closing_date?: string | null
          created_at?: string
          direct_deal_costs_ngn?: number
          gross_commission_amount_ngn?: number
          gross_commission_rate?: number
          id?: string
          lead_id?: string | null
          net_company_commission_ngn?: number
          notes?: string | null
          property_id?: string
          sale_price_ngn?: number
          seller_client_id?: string | null
          status?: Database["public"]["Enums"]["deal_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deals_buyer_client_id_fkey"
            columns: ["buyer_client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_seller_client_id_fkey"
            columns: ["seller_client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      due_diligence_checks: {
        Row: {
          check_type: Database["public"]["Enums"]["check_type"]
          checked_at: string | null
          checked_by_id: string | null
          created_at: string
          id: string
          notes: string | null
          property_id: string
          status: Database["public"]["Enums"]["check_status"]
        }
        Insert: {
          check_type: Database["public"]["Enums"]["check_type"]
          checked_at?: string | null
          checked_by_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          property_id: string
          status?: Database["public"]["Enums"]["check_status"]
        }
        Update: {
          check_type?: Database["public"]["Enums"]["check_type"]
          checked_at?: string | null
          checked_by_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          property_id?: string
          status?: Database["public"]["Enums"]["check_status"]
        }
        Relationships: [
          {
            foreignKeyName: "due_diligence_checks_checked_by_id_fkey"
            columns: ["checked_by_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "due_diligence_checks_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          assigned_consultant_id: string | null
          budget_max_ngn: number | null
          budget_min_ngn: number | null
          client_id: string
          created_at: string
          created_by_id: string | null
          id: string
          lost_reason: string | null
          preferred_city: string | null
          preferred_neighbourhoods: string | null
          property_id: string | null
          stage: Database["public"]["Enums"]["lead_stage"]
          updated_at: string
        }
        Insert: {
          assigned_consultant_id?: string | null
          budget_max_ngn?: number | null
          budget_min_ngn?: number | null
          client_id: string
          created_at?: string
          created_by_id?: string | null
          id?: string
          lost_reason?: string | null
          preferred_city?: string | null
          preferred_neighbourhoods?: string | null
          property_id?: string | null
          stage?: Database["public"]["Enums"]["lead_stage"]
          updated_at?: string
        }
        Update: {
          assigned_consultant_id?: string | null
          budget_max_ngn?: number | null
          budget_min_ngn?: number | null
          client_id?: string
          created_at?: string
          created_by_id?: string | null
          id?: string
          lost_reason?: string | null
          preferred_city?: string | null
          preferred_neighbourhoods?: string | null
          property_id?: string | null
          stage?: Database["public"]["Enums"]["lead_stage"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_assigned_consultant_id_fkey"
            columns: ["assigned_consultant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_created_by_id_fkey"
            columns: ["created_by_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      material_request_items: {
        Row: {
          category: string
          id: string
          notes: string | null
          quantity_unit: string
          request_id: string
          specification: string
        }
        Insert: {
          category: string
          id?: string
          notes?: string | null
          quantity_unit: string
          request_id: string
          specification: string
        }
        Update: {
          category?: string
          id?: string
          notes?: string | null
          quantity_unit?: string
          request_id?: string
          specification?: string
        }
        Relationships: [
          {
            foreignKeyName: "material_request_items_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "material_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      material_requests: {
        Row: {
          access_constraints: string | null
          boq_file_url: string | null
          company_name: string | null
          created_at: string
          delivery_timeline: string
          email: string | null
          full_name: string
          id: string
          internal_notes: string | null
          payment_preference: string
          phone: string
          request_type: string
          role: string
          site_location: string
          status: string
        }
        Insert: {
          access_constraints?: string | null
          boq_file_url?: string | null
          company_name?: string | null
          created_at?: string
          delivery_timeline: string
          email?: string | null
          full_name: string
          id?: string
          internal_notes?: string | null
          payment_preference: string
          phone: string
          request_type: string
          role: string
          site_location: string
          status?: string
        }
        Update: {
          access_constraints?: string | null
          boq_file_url?: string | null
          company_name?: string | null
          created_at?: string
          delivery_timeline?: string
          email?: string | null
          full_name?: string
          id?: string
          internal_notes?: string | null
          payment_preference?: string
          phone?: string
          request_type?: string
          role?: string
          site_location?: string
          status?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          active: boolean
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          email: string
          full_name: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          airbnb_potential_nightly_ngn: number | null
          area: string | null
          asking_price_ngn: number
          assigned_consultant_id: string | null
          city: string
          created_at: string
          created_by_id: string | null
          description: string | null
          id: string
          is_featured: boolean
          min_price_ngn: number | null
          owner_contact: string | null
          owner_name: string | null
          property_type: string
          rental_potential_monthly_ngn: number | null
          risk_rating: Database["public"]["Enums"]["risk_rating"]
          slug: string | null
          status: Database["public"]["Enums"]["property_status"]
          title: string
          updated_at: string
        }
        Insert: {
          airbnb_potential_nightly_ngn?: number | null
          area?: string | null
          asking_price_ngn?: number
          assigned_consultant_id?: string | null
          city: string
          created_at?: string
          created_by_id?: string | null
          description?: string | null
          id?: string
          is_featured?: boolean
          min_price_ngn?: number | null
          owner_contact?: string | null
          owner_name?: string | null
          property_type: string
          rental_potential_monthly_ngn?: number | null
          risk_rating?: Database["public"]["Enums"]["risk_rating"]
          slug?: string | null
          status?: Database["public"]["Enums"]["property_status"]
          title: string
          updated_at?: string
        }
        Update: {
          airbnb_potential_nightly_ngn?: number | null
          area?: string | null
          asking_price_ngn?: number
          assigned_consultant_id?: string | null
          city?: string
          created_at?: string
          created_by_id?: string | null
          description?: string | null
          id?: string
          is_featured?: boolean
          min_price_ngn?: number | null
          owner_contact?: string | null
          owner_name?: string | null
          property_type?: string
          rental_potential_monthly_ngn?: number | null
          risk_rating?: Database["public"]["Enums"]["risk_rating"]
          slug?: string | null
          status?: Database["public"]["Enums"]["property_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "properties_assigned_consultant_id_fkey"
            columns: ["assigned_consultant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_created_by_id_fkey"
            columns: ["created_by_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      property_documents: {
        Row: {
          doc_type: Database["public"]["Enums"]["doc_type"]
          file_url: string | null
          id: string
          property_id: string
          title: string
          uploaded_at: string
          uploaded_by_id: string | null
        }
        Insert: {
          doc_type: Database["public"]["Enums"]["doc_type"]
          file_url?: string | null
          id?: string
          property_id: string
          title: string
          uploaded_at?: string
          uploaded_by_id?: string | null
        }
        Update: {
          doc_type?: Database["public"]["Enums"]["doc_type"]
          file_url?: string | null
          id?: string
          property_id?: string
          title?: string
          uploaded_at?: string
          uploaded_by_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_documents_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_documents_uploaded_by_id_fkey"
            columns: ["uploaded_by_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      property_media: {
        Row: {
          created_at: string
          file_name: string
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          property_id: string
          sort_order: number | null
          uploaded_by_id: string | null
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size?: number | null
          file_type: string
          file_url: string
          id?: string
          property_id: string
          sort_order?: number | null
          uploaded_by_id?: string | null
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          property_id?: string
          sort_order?: number | null
          uploaded_by_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_media_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_media_uploaded_by_id_fkey"
            columns: ["uploaded_by_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      roi_calculations: {
        Row: {
          airbnb_nightly_rate_ngn: number | null
          airbnb_occupancy_rate_pct: number | null
          annual_insurance_ngn: number
          annual_maintenance_ngn: number
          annual_property_tax_ngn: number
          cap_rate_pct: number
          cash_on_cash_return_pct: number
          client_id: string | null
          created_at: string
          created_by_id: string | null
          gross_annual_income_ngn: number
          id: string
          management_fee_pct: number
          monthly_rent_ngn: number | null
          net_annual_income_ngn: number
          other_acquisition_costs_ngn: number
          payback_period_years: number
          property_id: string | null
          property_location: string | null
          purchase_price_ngn: number
          renovation_cost_ngn: number
          strategy: Database["public"]["Enums"]["roi_strategy"]
        }
        Insert: {
          airbnb_nightly_rate_ngn?: number | null
          airbnb_occupancy_rate_pct?: number | null
          annual_insurance_ngn?: number
          annual_maintenance_ngn?: number
          annual_property_tax_ngn?: number
          cap_rate_pct?: number
          cash_on_cash_return_pct?: number
          client_id?: string | null
          created_at?: string
          created_by_id?: string | null
          gross_annual_income_ngn?: number
          id?: string
          management_fee_pct?: number
          monthly_rent_ngn?: number | null
          net_annual_income_ngn?: number
          other_acquisition_costs_ngn?: number
          payback_period_years?: number
          property_id?: string | null
          property_location?: string | null
          purchase_price_ngn?: number
          renovation_cost_ngn?: number
          strategy: Database["public"]["Enums"]["roi_strategy"]
        }
        Update: {
          airbnb_nightly_rate_ngn?: number | null
          airbnb_occupancy_rate_pct?: number | null
          annual_insurance_ngn?: number
          annual_maintenance_ngn?: number
          annual_property_tax_ngn?: number
          cap_rate_pct?: number
          cash_on_cash_return_pct?: number
          client_id?: string | null
          created_at?: string
          created_by_id?: string | null
          gross_annual_income_ngn?: number
          id?: string
          management_fee_pct?: number
          monthly_rent_ngn?: number | null
          net_annual_income_ngn?: number
          other_acquisition_costs_ngn?: number
          payback_period_years?: number
          property_id?: string | null
          property_location?: string | null
          purchase_price_ngn?: number
          renovation_cost_ngn?: number
          strategy?: Database["public"]["Enums"]["roi_strategy"]
        }
        Relationships: [
          {
            foreignKeyName: "roi_calculations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roi_calculations_created_by_id_fkey"
            columns: ["created_by_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roi_calculations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
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
      viewings: {
        Row: {
          created_at: string
          created_by_id: string | null
          id: string
          lead_id: string
          notes: string | null
          property_id: string
          scheduled_at: string
          status: Database["public"]["Enums"]["viewing_status"]
        }
        Insert: {
          created_at?: string
          created_by_id?: string | null
          id?: string
          lead_id: string
          notes?: string | null
          property_id: string
          scheduled_at: string
          status?: Database["public"]["Enums"]["viewing_status"]
        }
        Update: {
          created_at?: string
          created_by_id?: string | null
          id?: string
          lead_id?: string
          notes?: string | null
          property_id?: string
          scheduled_at?: string
          status?: Database["public"]["Enums"]["viewing_status"]
        }
        Relationships: [
          {
            foreignKeyName: "viewings_created_by_id_fkey"
            columns: ["created_by_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "viewings_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "viewings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_profile_id: { Args: never; Returns: string }
      get_profile_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_super_admin: { Args: never; Returns: boolean }
      set_user_role: {
        Args: {
          new_role: Database["public"]["Enums"]["app_role"]
          target_user_id: string
        }
        Returns: Json
      }
    }
    Enums: {
      activity_entity_type:
        | "property"
        | "lead"
        | "client"
        | "deal"
        | "viewing"
        | "roi"
      app_role: "admin" | "spc" | "support" | "super_admin"
      check_status: "pending" | "in_progress" | "completed" | "failed"
      check_type:
        | "ownership_verified"
        | "title_verified"
        | "survey_verified"
        | "planning_approval_checked"
        | "price_sanity_check"
        | "rental_comp_check"
        | "risk_review"
      client_source:
        | "referral"
        | "social_media"
        | "website_form"
        | "walk_in"
        | "other"
      client_type:
        | "buyer"
        | "seller"
        | "investor_developer"
        | "landowner"
        | "other"
      consultant_role_type: "originator" | "assistant"
      deal_status: "in_progress" | "under_contract" | "closed" | "cancelled"
      doc_type:
        | "c_of_o"
        | "deed_of_assignment"
        | "survey_plan"
        | "building_approval"
        | "estate_agreement"
        | "other"
      lead_stage:
        | "new"
        | "qualified"
        | "viewing_scheduled"
        | "offer_made"
        | "under_negotiation"
        | "closed_won"
        | "closed_lost"
      property_status: "draft" | "under_review" | "listed" | "on_hold" | "sold"
      risk_rating: "low" | "medium" | "high"
      roi_strategy: "long_term_rental" | "airbnb" | "compare"
      viewing_status: "scheduled" | "completed" | "cancelled" | "no_show"
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
      activity_entity_type: [
        "property",
        "lead",
        "client",
        "deal",
        "viewing",
        "roi",
      ],
      app_role: ["admin", "spc", "support", "super_admin"],
      check_status: ["pending", "in_progress", "completed", "failed"],
      check_type: [
        "ownership_verified",
        "title_verified",
        "survey_verified",
        "planning_approval_checked",
        "price_sanity_check",
        "rental_comp_check",
        "risk_review",
      ],
      client_source: [
        "referral",
        "social_media",
        "website_form",
        "walk_in",
        "other",
      ],
      client_type: [
        "buyer",
        "seller",
        "investor_developer",
        "landowner",
        "other",
      ],
      consultant_role_type: ["originator", "assistant"],
      deal_status: ["in_progress", "under_contract", "closed", "cancelled"],
      doc_type: [
        "c_of_o",
        "deed_of_assignment",
        "survey_plan",
        "building_approval",
        "estate_agreement",
        "other",
      ],
      lead_stage: [
        "new",
        "qualified",
        "viewing_scheduled",
        "offer_made",
        "under_negotiation",
        "closed_won",
        "closed_lost",
      ],
      property_status: ["draft", "under_review", "listed", "on_hold", "sold"],
      risk_rating: ["low", "medium", "high"],
      roi_strategy: ["long_term_rental", "airbnb", "compare"],
      viewing_status: ["scheduled", "completed", "cancelled", "no_show"],
    },
  },
} as const
