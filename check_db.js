
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Try to find .env file
const envPath = path.join(__dirname, 'apps', 'admin', '.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase credentials not found in env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
    const { error: e1 } = await supabase.from('homepage_sections').select('content');
    if (e1) console.log('Content check:', e1.message);
    else console.log('Content exists!');

    const { error: e2 } = await supabase.from('homepage_sections').select('settings');
    if (e2) console.log('Settings check:', e2.message);
    else console.log('Settings exists!');

    const { error: e3 } = await supabase.from('homepage_sections').select('metadata');
    if (e3) console.log('Metadata check:', e3.message);
    else console.log('Metadata exists!');
}

checkColumns();

async function checkColumns() {
    const { data, error } = await supabase.from('homepage_sections').insert({}).select('*');
    if (error) {
        console.log('Insert Error Message:', error.message);
        console.log('Insert Error Details:', error.details);
        console.log('Insert Error Hint:', error.hint);
    } else {
        console.log('Insert result:', data);
        if (data && data.length > 0) {
            console.log('Columns:', Object.keys(data[0]));
        }
    }
}

checkColumns();

async function checkApi() {
    try {
        const res = await fetch('http://localhost:5000/api/v1/homepage/sections');
        const data = await res.json();
        console.log('API Status:', res.status);
        console.log('API Data:', data);
    } catch (err) {
        console.error('API Error:', err.message);
    }
}

checkApi();
