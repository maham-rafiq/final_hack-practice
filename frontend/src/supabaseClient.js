import { createClient } from '@supabase/supabase-js';

// Hackathon wale din Supabase Dashboard se ye do URLs milenge, bas yahan paste karne hain
const supabaseUrl = 'https://ihpzneqayheriafvetre.supabase.co';
const supabaseAnonKey = 'sb_publishable_k-IF3nCixlgEId4qbXWbig_cEa-Cvnd';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
