import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://dpxkklbkvnirkxtnhkko.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRweGtrbGJrdm5pcmt4dG5oa2tvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyMDUwMTAsImV4cCI6MjA5NTc4MTAxMH0.GPUqtru2u28xcg1_dJHVNuBOCjwkZcCmpr8cvszQxHE"
);
