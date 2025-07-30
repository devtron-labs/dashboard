#!/usr/bin/env node

const { spawn } = require('child_process')
const path = require('path')
const { EXIT_CODES } = require('./constants')

// Run update-secret.js first
const updateSecrets = spawn('node', [path.join(__dirname, 'update-secret.js'), ...process.argv.slice(2)], {
    stdio: 'inherit',
})

updateSecrets.on('close', (code) => {
    if (code === EXIT_CODES.HELP) {
        process.exit(0)
    } else if (code !== EXIT_CODES.SUCCESS) {
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
