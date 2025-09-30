#!/usr/bin/env node

/**
 * Environment Variable Test Script
 * Run this to verify your API keys are properly configured
 * Usage: node test-env.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  bold: '\x1b[1m'
};

// Load environment variables
function loadEnv() {
  const envPath = path.join(__dirname, '.env.local');
  
  if (!fs.existsSync(envPath)) {
    console.log(`${colors.red}❌ .env.local file not found!${colors.reset}`);
    console.log(`${colors.yellow}Please create .env.local by copying .env.example${colors.reset}`);
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const env = {};
  
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=').trim();
      if (key && value) {
        env[key.trim()] = value.replace(/^["']|["']$/g, '');
      }
    }
  });
  
  return env;
}

// Test Supabase connection
async function testSupabase(env) {
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  console.log(`\n${colors.blue}${colors.bold}Testing Supabase Connection...${colors.reset}`);
  
  if (!url || !anonKey) {
    console.log(`${colors.red}❌ Missing Supabase credentials${colors.reset}`);
    console.log(`  - NEXT_PUBLIC_SUPABASE_URL: ${url ? '✓ Set' : '✗ Missing'}`);
    console.log(`  - NEXT_PUBLIC_SUPABASE_ANON_KEY: ${anonKey ? '✓ Set' : '✗ Missing'}`);
    return false;
  }
  
  try {
    const urlObj = new URL(url);
    
    return new Promise((resolve) => {
      const options = {
        hostname: urlObj.hostname,
        port: 443,
        path: '/rest/v1/',
        method: 'GET',
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`
        }
      };
      
      const req = https.request(options, (res) => {
        if (res.statusCode === 200 || res.statusCode === 401) {
          console.log(`${colors.green}✅ Supabase connection successful!${colors.reset}`);
          console.log(`  - URL: ${url}`);
          console.log(`  - Key: ${anonKey.substring(0, 20)}...`);
          resolve(true);
        } else {
          console.log(`${colors.red}❌ Supabase connection failed (Status: ${res.statusCode})${colors.reset}`);
          resolve(false);
        }
      });
      
      req.on('error', (error) => {
        console.log(`${colors.red}❌ Supabase connection error: ${error.message}${colors.reset}`);
        resolve(false);
      });
      
      req.end();
    });
  } catch (error) {
    console.log(`${colors.red}❌ Invalid Supabase URL: ${error.message}${colors.reset}`);
    return false;
  }
}

// Test OpenAI connection
async function testOpenAI(env) {
  const apiKey = env.OPENAI_API_KEY;
  
  console.log(`\n${colors.blue}${colors.bold}Testing OpenAI Connection...${colors.reset}`);
  
  if (!apiKey) {
    console.log(`${colors.red}❌ Missing OpenAI API key${colors.reset}`);
    console.log(`  - OPENAI_API_KEY: ✗ Missing`);
    return false;
  }
  
  if (!apiKey.startsWith('sk-')) {
    console.log(`${colors.yellow}⚠️  OpenAI key doesn't start with 'sk-' - might be invalid${colors.reset}`);
  }
  
  return new Promise((resolve) => {
    const data = JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Say "test"' }],
      max_tokens: 5
    });
    
    const options = {
      hostname: 'api.openai.com',
      port: 443,
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': data.length
      }
    };
    
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`${colors.green}✅ OpenAI connection successful!${colors.reset}`);
          console.log(`  - Key: ${apiKey.substring(0, 7)}...${apiKey.substring(apiKey.length - 4)}`);
          resolve(true);
        } else if (res.statusCode === 401) {
          console.log(`${colors.red}❌ OpenAI authentication failed - invalid API key${colors.reset}`);
          resolve(false);
        } else if (res.statusCode === 429) {
          console.log(`${colors.yellow}⚠️  OpenAI rate limit exceeded (but key is valid)${colors.reset}`);
          resolve(true);
        } else {
          console.log(`${colors.red}❌ OpenAI connection failed (Status: ${res.statusCode})${colors.reset}`);
          try {
            const error = JSON.parse(responseData);
            console.log(`  - Error: ${error.error?.message || responseData}`);
          } catch {
            console.log(`  - Response: ${responseData}`);
          }
          resolve(false);
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`${colors.red}❌ OpenAI connection error: ${error.message}${colors.reset}`);
      resolve(false);
    });
    
    req.write(data);
    req.end();
  });
}

// Check other important variables
function checkOtherVars(env) {
  console.log(`\n${colors.blue}${colors.bold}Checking Other Variables...${colors.reset}`);
  
  const checks = [
    {
      key: 'SUPABASE_SERVICE_ROLE_KEY',
      required: true,
      validate: (val) => val && val.length > 50
    },
    {
      key: 'NEXT_PUBLIC_APP_URL',
      required: true,
      validate: (val) => val && (val.includes('http://localhost') || val.includes('https://'))
    },
    {
      key: 'SESSION_SECRET',
      required: false,
      validate: (val) => val && val.length > 10
    },
    {
      key: 'AI_PROVIDER',
      required: false,
      validate: (val) => !val || ['openai', 'anthropic'].includes(val)
    }
  ];
  
  let allGood = true;
  
  checks.forEach(check => {
    const value = env[check.key];
    const isValid = check.validate(value);
    
    if (check.required && !value) {
      console.log(`  ${colors.red}✗ ${check.key}: Missing (Required)${colors.reset}`);
      allGood = false;
    } else if (value && !isValid) {
      console.log(`  ${colors.yellow}⚠️  ${check.key}: Set but might be invalid${colors.reset}`);
    } else if (value) {
      console.log(`  ${colors.green}✓ ${check.key}: Set${colors.reset}`);
    } else {
      console.log(`  ${colors.gray}○ ${check.key}: Not set (Optional)${colors.reset}`);
    }
  });
  
  return allGood;
}

// Main execution
async function main() {
  console.log(`${colors.bold}🔍 Gopher Environment Test${colors.reset}`);
  console.log('=' .repeat(50));
  
  const env = loadEnv();
  
  const supabaseOk = await testSupabase(env);
  const openaiOk = await testOpenAI(env);
  const othersOk = checkOtherVars(env);
  
  console.log('\n' + '=' .repeat(50));
  
  if (supabaseOk && openaiOk && othersOk) {
    console.log(`${colors.green}${colors.bold}✅ All environment variables are properly configured!${colors.reset}`);
    console.log(`${colors.green}Your app should be working now. Try restarting with: npm run dev${colors.reset}`);
    process.exit(0);
  } else {
    console.log(`${colors.red}${colors.bold}❌ Some environment variables need attention${colors.reset}`);
    console.log(`${colors.yellow}Please check the ENV_SETUP_GUIDE.md for instructions${colors.reset}`);
    process.exit(1);
  }
}

// Run the tests
main().catch(error => {
  console.error(`${colors.red}Unexpected error: ${error.message}${colors.reset}`);
  process.exit(1);
});

