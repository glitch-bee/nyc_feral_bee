import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://xgjlhtvbfgrwjfpekixb.supabase.co',  // <-- paste your Project URL
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnamxodHZiZmdyd2pmcGVraXhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzODMyNjUsImV4cCI6MjA2NDk1OTI2NX0.Ceh2RvOBmN8NNxdt07zFx6Nox1qyaHzSTKxtqef_qCw'                   // <-- paste your anon public key
);
