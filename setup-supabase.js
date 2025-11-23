import { randomBytes } from 'crypto'
import { writeFileSync, readFileSync } from 'fs'
import { join } from 'path'

console.log('🔮 Haunted Energy Dashboard - Supabase Setup\n')

// Generate secure random secrets
const generateSecret = (length = 32) => {
  return randomBytes(length).toString('hex')
}

const jwtSecret = generateSecret(32)
const sessionSecret = generateSecret(32)

console.log('✨ Generated secrets:')
console.log(`JWT_SECRET=${jwtSecret}`)
console.log(`SESSION_SECRET=${sessionSecret}\n`)

// Read the .kiro/environment file
const envPath = join(process.cwd(), '.kiro', 'environment')
let envContent = readFileSync(envPath, 'utf-8')

// Replace placeholders
envContent = envContent.replace('{{generate:32}}', jwtSecret)
envContent = envContent.replace('{{generate:32}}', sessionSecret)

// Write back
writeFileSync(envPath, envContent)
console.log('✅ Updated .kiro/environment with generated secrets\n')

// Update server/.env
const serverEnvPath = join(process.cwd(), 'server', '.env')
let serverEnv = readFileSync(serverEnvPath, 'utf-8')

serverEnv = serverEnv.replace(/JWT_SECRET=.*/, `JWT_SECRET=${jwtSecret}`)
serverEnv = serverEnv.replace(/SESSION_SECRET=.*/, `SESSION_SECRET=${sessionSecret}`)

writeFileSync(serverEnvPath, serverEnv)
console.log('✅ Updated server/.env with generated secrets\n')

console.log('📝 Next steps:')
console.log('1. Get your Supabase Service Role Key from: https://supabase.com/dashboard/project/juzleommevvicyqdebfi/settings/api')
console.log('2. Add it to server/.env as SUPABASE_SERVICE_KEY=your_key_here')
console.log('3. Run: cd server && npm install')
console.log('4. Run: cd client && npm install')
console.log('5. Start the servers with npm run dev\n')

console.log('🎃 Setup complete! Your dashboard is ready for Supabase integration.')
