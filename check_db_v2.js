
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Try to find .env file in root first, then apps/admin
const rootEnv = path.join(__dirname, '.env');
const adminEnv = path.join(__dirname, 'apps', 'admin', '.env.local');

dotenv.config({ path: rootEnv });
dotenv.config({ path: adminEnv });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase credentials not found in env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log('Checking table: homepage_sections');

    // Try to fetch one row with all columns
    const { data, error } = await supabase.from('homepage_sections').select('*').limit(1);

    if (error) {
        console.error('Select * error:', error.message);
    } else {
        console.log('Data:', data);
        if (data && data.length > 0) {
            console.log('Columns found:', Object.keys(data[0]));
        } else {
            console.log('Table is empty, trying to probe columns...');
        }
    }

    // Probe for 'config'
    const { error: configError } = await supabase.from('homepage_sections').select('config').limit(1);
    if (configError) {
        console.error('Config column check FAILED:', configError.message);
    } else {
        console.log('Config column EXISTS!');
    }
}

run();
