import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zpjhujlpklewcywbjbmh.supabase.co';
const supabaseAnonKey = 'sb_publishable_X3q0-8__jEVIriDWAqdQ1w_UA-pHioG';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);