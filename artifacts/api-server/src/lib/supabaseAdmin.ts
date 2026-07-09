import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://dpxkklbkvnirkxtnhkko.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRweGtrbGJrdm5pcmt4dG5oa2tvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyMDUwMTAsImV4cCI6MjA5NTc4MTAxMH0.GPUqtru2u28xcg1_dJHVNuBOCjwkZcCmpr8cvszQxHE";

export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
