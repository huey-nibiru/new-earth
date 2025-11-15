import { createClient } from "@supabase/supabase-js";
const supabaseUrl = "https://zdxxtzzwkwsnvsaastuz.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkeHh0enp3a3dzbnZzYWFzdHV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4ODQwOTAsImV4cCI6MjA3NTQ2MDA5MH0.FePNhpET6cbCvNpp5ijKBsFXraHl44QF1-C_C4rU2Bk";
const supabase = createClient(supabaseUrl, supabaseKey);
export default supabase;
