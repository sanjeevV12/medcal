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
      ambulances: {
        Row: {
          created_at: string
          driver_name: string
          driver_phone: string
          id: string
          latitude: number
          longitude: number
          photo_url: string | null
          rating: number | null
          status: string
          total_trips: number | null
          updated_at: string
          vehicle_number: string
          vehicle_type: string
        }
        Insert: {
          created_at?: string
          driver_name: string
          driver_phone: string
          id?: string
          latitude: number
          longitude: number
          photo_url?: string | null
          rating?: number | null
          status?: string
          total_trips?: number | null
          updated_at?: string
          vehicle_number: string
          vehicle_type?: string
        }
        Update: {
          created_at?: string
          driver_name?: string
          driver_phone?: string
          id?: string
          latitude?: number
          longitude?: number
          photo_url?: string | null
          rating?: number | null
          status?: string
          total_trips?: number | null
          updated_at?: string
          vehicle_number?: string
          vehicle_type?: string
        }
        Relationships: []
      }
      booking_records: {
        Row: {
          address: string | null
          amount: string | null
          booking_date: string
          booking_time: string | null
          created_at: string
          id: string
          notes: string | null
          payment_method: string | null
          service_type: string
          status: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          amount?: string | null
          booking_date: string
          booking_time?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          service_type: string
          status?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          amount?: string | null
          booking_date?: string
          booking_time?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          service_type?: string
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      drivers: {
        Row: {
          created_at: string
          experience_years: number | null
          full_name: string
          id: string
          is_available: boolean | null
          latitude: number | null
          license_number: string
          longitude: number | null
          phone: string
          rating: number | null
          total_trips: number | null
          updated_at: string
          vehicle_number: string
          vehicle_type: string
          whatsapp_number: string
        }
        Insert: {
          created_at?: string
          experience_years?: number | null
          full_name: string
          id?: string
          is_available?: boolean | null
          latitude?: number | null
          license_number: string
          longitude?: number | null
          phone: string
          rating?: number | null
          total_trips?: number | null
          updated_at?: string
          vehicle_number: string
          vehicle_type?: string
          whatsapp_number: string
        }
        Update: {
          created_at?: string
          experience_years?: number | null
          full_name?: string
          id?: string
          is_available?: boolean | null
          latitude?: number | null
          license_number?: string
          longitude?: number | null
          phone?: string
          rating?: number | null
          total_trips?: number | null
          updated_at?: string
          vehicle_number?: string
          vehicle_type?: string
          whatsapp_number?: string
        }
        Relationships: []
      }
      emergency_contacts: {
        Row: {
          created_at: string
          id: string
          is_primary: boolean | null
          name: string
          phone: string
          relationship: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_primary?: boolean | null
          name: string
          phone: string
          relationship?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_primary?: boolean | null
          name?: string
          phone?: string
          relationship?: string | null
          user_id?: string
        }
        Relationships: []
      }
      hospitals: {
        Row: {
          address: string
          created_at: string
          email: string | null
          emergency_available: boolean | null
          id: string
          image_url: string | null
          is_partner: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          phone: string | null
          rating: number | null
          specializations: string[] | null
          total_reviews: number | null
        }
        Insert: {
          address: string
          created_at?: string
          email?: string | null
          emergency_available?: boolean | null
          id?: string
          image_url?: string | null
          is_partner?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          phone?: string | null
          rating?: number | null
          specializations?: string[] | null
          total_reviews?: number | null
        }
        Update: {
          address?: string
          created_at?: string
          email?: string | null
          emergency_available?: boolean | null
          id?: string
          image_url?: string | null
          is_partner?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          phone?: string | null
          rating?: number | null
          specializations?: string[] | null
          total_reviews?: number | null
        }
        Relationships: []
      }
      medical_history: {
        Row: {
          condition: string
          created_at: string
          diagnosis_date: string | null
          id: string
          is_ongoing: boolean | null
          notes: string | null
          user_id: string
        }
        Insert: {
          condition: string
          created_at?: string
          diagnosis_date?: string | null
          id?: string
          is_ongoing?: boolean | null
          notes?: string | null
          user_id: string
        }
        Update: {
          condition?: string
          created_at?: string
          diagnosis_date?: string | null
          id?: string
          is_ongoing?: boolean | null
          notes?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          blood_group: string | null
          created_at: string
          date_of_birth: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          blood_group?: string | null
          created_at?: string
          date_of_birth?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          blood_group?: string | null
          created_at?: string
          date_of_birth?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ride_requests: {
        Row: {
          ambulance_id: string | null
          completed_at: string | null
          created_at: string
          destination_hospital_id: string | null
          distance_km: number | null
          fare_estimate: number | null
          final_fare: number | null
          id: string
          payment_method: string | null
          payment_status: string | null
          pickup_lat: number
          pickup_lng: number
          ride_type: string
          started_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          ambulance_id?: string | null
          completed_at?: string | null
          created_at?: string
          destination_hospital_id?: string | null
          distance_km?: number | null
          fare_estimate?: number | null
          final_fare?: number | null
          id?: string
          payment_method?: string | null
          payment_status?: string | null
          pickup_lat: number
          pickup_lng: number
          ride_type?: string
          started_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          ambulance_id?: string | null
          completed_at?: string | null
          created_at?: string
          destination_hospital_id?: string | null
          distance_km?: number | null
          fare_estimate?: number | null
          final_fare?: number | null
          id?: string
          payment_method?: string | null
          payment_status?: string | null
          pickup_lat?: number
          pickup_lng?: number
          ride_type?: string
          started_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ride_requests_ambulance_id_fkey"
            columns: ["ambulance_id"]
            isOneToOne: false
            referencedRelation: "ambulances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ride_requests_destination_hospital_id_fkey"
            columns: ["destination_hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
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
