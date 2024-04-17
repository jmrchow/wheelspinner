import { createClient } from "@supabase/supabase-js";
const supabaseUrl = "https://pmbbkcvucgjnzbzmabpu.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtYmJrY3Z1Y2dqbnpiem1hYnB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTEzOTE3ODEsImV4cCI6MjAyNjk2Nzc4MX0.ZysFc7Bu4U1yfo9xmsZe4zSSOnNiDy0SE71TQaXrbrk";
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
