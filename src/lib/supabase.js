import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

// Create Supabase client only if valid credentials are provided
let supabase = null;

try {
    if (supabaseUrl && supabaseKey &&
        supabaseUrl !== 'YOUR_SUPABASE_URL' &&
        supabaseKey !== 'YOUR_SUPABASE_ANON_KEY') {
        supabase = createClient(supabaseUrl, supabaseKey);
        console.log('✅ Supabase client initialized successfully');
    } else {
        console.warn('⚠️ Supabase not configured - using placeholder values');
    }
} catch (error) {
    console.error('❌ Failed to initialize Supabase client:', error);
}

export { supabase }

// Database table names
export const TABLES = {
    EVENTS: 'events',
    CATEGORIES: 'categories',
    EVENT_DESCRIPTIONS: 'event_descriptions'
}
