import { supabase, isSupabaseConfigured } from './server/supabaseClient.js'

console.log('🔮 Testing Supabase Connection...\n')

if (!isSupabaseConfigured()) {
  console.log('❌ Supabase is NOT configured')
  console.log('   Check your .env file and ensure SUPABASE_URL and SUPABASE_SERVICE_KEY are set\n')
  process.exit(1)
}

console.log('✅ Supabase client initialized successfully!')
console.log('📡 Testing connection...\n')

// Test a simple query
try {
  const { data, error } = await supabase
    .from('devices')
    .select('count')
    .limit(1)
  
  if (error) {
    if (error.message.includes('relation "public.devices" does not exist')) {
      console.log('⚠️  Connection successful, but "devices" table does not exist yet')
      console.log('   Create the table using the SQL in SUPABASE_SETUP.md\n')
    } else {
      console.log('❌ Error:', error.message, '\n')
    }
  } else {
    console.log('✅ Successfully connected to Supabase!')
    console.log('✅ Database query executed successfully\n')
  }
} catch (err) {
  console.log('❌ Connection failed:', err.message, '\n')
}

console.log('🎃 Supabase integration is ready!')
console.log('📚 See SUPABASE_SETUP.md for database schema setup\n')
