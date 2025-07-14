#!/usr/bin/env node

/**
 * Pre-deployment check script to verify environment and dependencies
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 Running pre-deployment checks...\n');

// Check if required files exist
const requiredFiles = [
  'dist/index.js',
  'dist/public/index.html',
  'dist/public/assets'
];

let filesOk = true;
console.log('📁 Checking build files:');
requiredFiles.forEach(file => {
  const exists = existsSync(join(__dirname, file));
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
  if (!exists) filesOk = false;
});

// Check environment variables
console.log('\n🔧 Checking environment variables:');
const requiredEnvVars = [
  { key: 'DATABASE_URL', required: true },
  { key: 'JWT_SECRET', required: false, fallback: 'default provided' },
  { key: 'OPENAI_API_KEY', required: false, fallback: 'AI features disabled' },
  { key: 'SENDGRID_API_KEY', required: false, fallback: 'Email features disabled' }
];

let envOk = true;
requiredEnvVars.forEach(({ key, required, fallback }) => {
  const value = process.env[key];
  const hasValue = value && value !== 'default_key';
  
  if (required && !hasValue) {
    console.log(`  ❌ ${key} - REQUIRED but missing`);
    envOk = false;
  } else if (!hasValue && fallback) {
    console.log(`  ⚠️  ${key} - Missing (${fallback})`);
  } else {
    console.log(`  ✅ ${key} - Configured`);
  }
});

// Check Node.js version
console.log('\n🟢 Checking Node.js version:');
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
console.log(`  Node.js version: ${nodeVersion}`);
if (majorVersion < 18) {
  console.log('  ⚠️  Recommended Node.js version is 18 or higher');
} else {
  console.log('  ✅ Node.js version is compatible');
}

// Final verdict
console.log('\n🎯 Deployment Readiness:');
if (filesOk && envOk) {
  console.log('  ✅ Ready for deployment!');
  process.exit(0);
} else {
  console.log('  ❌ Issues found - please fix before deploying');
  process.exit(1);
}