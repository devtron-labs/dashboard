#!/usr/bin/env node

const { spawn } = require('child_process')
const path = require('path')

// Get namespace from command line arguments
const namespace = process.argv[2]

if (!namespace) {
    console.error('Please provide a namespace as an argument.')
    console.error('Usage: yarn dev:secrets <namespace>')
    process.exit(1)
}

console.log(`🔄 Updating secrets for namespace: ${namespace}`)

// Run update-secret.js first
const updateSecrets = spawn('node', [path.join(__dirname, 'update-secret.js'), namespace], {
    stdio: 'inherit',
})

updateSecrets.on('close', (code) => {
    if (code !== 0) {
        console.error('❌ Failed to update secrets')
        process.exit(code)
    }

    console.log('✅ Secrets updated successfully')
    console.log('🚀 Starting development server...')

    // Start the development server
    const startDev = spawn('yarn', ['start'], {
        stdio: 'inherit',
    })

    startDev.on('close', (code) => {
        process.exit(code)
    })
})
