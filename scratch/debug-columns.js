const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkColumns() {
    const { data, error } = await supabase.from('Threat').select('*').limit(1);
    if (error) console.log('Error:', error.message);
    else if (data && data.length > 0) console.log('Columns:', Object.keys(data[0]));
    else {
        // If no data, try to get from another table that has data
        const { data: repData } = await supabase.from('Report').select('*').limit(1);
        console.log('Report Columns:', Object.keys(repData[0]));
        
        // I'll try to insert a dummy record to see the error message which might contain column hints
        const { error: insError } = await supabase.from('Threat').insert({ dummy_col: 'test' });
        console.log('Insert Error (expected):', insError.message);
    }
}
checkColumns();
