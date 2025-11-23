// Test script to debug server startup
console.log('Starting server test...')

try {
  console.log('Importing server...')
  const server = await import('./server.js')
  console.log('Server imported successfully!')
  console.log('Server exports:', Object.keys(server))
} catch (error) {
  console.error('Error importing server:', error)
  console.error('Stack:', error.stack)
  process.exit(1)
}
