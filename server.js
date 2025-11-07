// Simple Express server for production deployment
// This handles SPA routing by serving index.html for all routes
// 
// Installation: npm install express
// Usage: npm run build && npm start

import express from 'express'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFileSync, existsSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000
const distPath = join(__dirname, 'dist')
const indexPath = join(distPath, 'index.html')

// Check if dist folder exists
if (!existsSync(distPath)) {
  console.error('Error: dist folder not found. Please run "npm run build" first.')
  process.exit(1)
}

// Serve static files from the dist directory
app.use(express.static(distPath))

// Handle SPA routing - serve index.html for all routes
// This ensures direct URL access works (e.g., /job-demand, /dashboard, etc.)
app.get('*', (req, res) => {
  try {
    if (existsSync(indexPath)) {
      const indexHtml = readFileSync(indexPath, 'utf-8')
      res.setHeader('Content-Type', 'text/html')
      res.send(indexHtml)
    } else {
      res.status(404).send('index.html not found. Please build the application first.')
    }
  } catch (error) {
    console.error('Error serving index.html:', error)
    res.status(500).send('Internal server error')
  }
})

app.listen(PORT, () => {
  console.log(`\n✅ Server running on http://localhost:${PORT}`)
  console.log('✅ SPA routing enabled - all routes will serve index.html')
  console.log('\nTest direct URL access:')
  console.log(`   http://localhost:${PORT}/job-demand`)
  console.log(`   http://localhost:${PORT}/dashboard`)
  console.log(`   http://localhost:${PORT}/learning\n`)
})

