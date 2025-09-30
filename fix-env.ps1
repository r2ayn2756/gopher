# PowerShell script to help fix .env.local configuration

Write-Host "================================================" -ForegroundColor Cyan
Write-Host " Gopher Environment Configuration Helper" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "ERROR: .env.local file not found!" -ForegroundColor Red
    exit 1
}

Write-Host "This script will help you add your API keys to .env.local" -ForegroundColor Yellow
Write-Host ""

# Function to validate Supabase URL
function Test-SupabaseUrl {
    param($url)
    return $url -match "^https://[a-z0-9]+\.supabase\.co$"
}

# Function to validate Supabase keys
function Test-SupabaseKey {
    param($key)
    return ($key.StartsWith("eyJ") -and $key.Length -gt 100)
}

# Function to validate OpenAI key
function Test-OpenAIKey {
    param($key)
    return ($key.StartsWith("sk-") -and $key.Length -gt 20)
}

# Get Supabase URL
Write-Host "Step 1: SUPABASE PROJECT URL" -ForegroundColor Green
Write-Host "Go to: https://supabase.com/dashboard -> Settings -> API" -ForegroundColor Cyan
Write-Host "Copy your 'Project URL' (looks like: https://abcdefg.supabase.co)" -ForegroundColor Gray
Write-Host ""
$supabaseUrl = Read-Host "Paste your Supabase Project URL"

if (-not (Test-SupabaseUrl $supabaseUrl)) {
    Write-Host "WARNING: This doesn't look like a valid Supabase URL" -ForegroundColor Yellow
    $confirm = Read-Host "Continue anyway? (y/n)"
    if ($confirm -ne "y") { exit 1 }
}

# Get Supabase Anon Key
Write-Host ""
Write-Host "Step 2: SUPABASE ANON KEY" -ForegroundColor Green
Write-Host "From the same page, copy your 'anon' public key" -ForegroundColor Cyan
Write-Host "It starts with: eyJ..." -ForegroundColor Gray
Write-Host ""
$supabaseAnon = Read-Host "Paste your Supabase Anon Key"

if (-not (Test-SupabaseKey $supabaseAnon)) {
    Write-Host "WARNING: This doesn't look like a valid Supabase key" -ForegroundColor Yellow
    $confirm = Read-Host "Continue anyway? (y/n)"
    if ($confirm -ne "y") { exit 1 }
}

# Get Supabase Service Key
Write-Host ""
Write-Host "Step 3: SUPABASE SERVICE ROLE KEY" -ForegroundColor Green
Write-Host "From the same page, copy your 'service_role' key (keep this secret!)" -ForegroundColor Cyan
Write-Host "It also starts with: eyJ..." -ForegroundColor Gray
Write-Host ""
$supabaseService = Read-Host "Paste your Supabase Service Role Key"

if (-not (Test-SupabaseKey $supabaseService)) {
    Write-Host "WARNING: This doesn't look like a valid Supabase key" -ForegroundColor Yellow
    $confirm = Read-Host "Continue anyway? (y/n)"
    if ($confirm -ne "y") { exit 1 }
}

# Get OpenAI Key
Write-Host ""
Write-Host "Step 4: OPENAI API KEY" -ForegroundColor Green
Write-Host "Go to: https://platform.openai.com/api-keys" -ForegroundColor Cyan
Write-Host "Create or copy an API key (starts with: sk-...)" -ForegroundColor Gray
Write-Host ""
$openaiKey = Read-Host "Paste your OpenAI API Key"

if (-not (Test-OpenAIKey $openaiKey)) {
    Write-Host "WARNING: This doesn't look like a valid OpenAI key" -ForegroundColor Yellow
    $confirm = Read-Host "Continue anyway? (y/n)"
    if ($confirm -ne "y") { exit 1 }
}

# Create backup
Write-Host ""
Write-Host "Creating backup of current .env.local..." -ForegroundColor Yellow
Copy-Item ".env.local" ".env.local.backup" -Force
Write-Host "Backup saved as: .env.local.backup" -ForegroundColor Green

# Update the file
Write-Host ""
Write-Host "Updating .env.local with your keys..." -ForegroundColor Yellow

$envContent = @"
# Gopher App - Local Environment Variables
# Fill in values then restart with npm run dev

NEXT_PUBLIC_SUPABASE_URL=$supabaseUrl
NEXT_PUBLIC_SUPABASE_ANON_KEY=$supabaseAnon
SUPABASE_SERVICE_ROLE_KEY=$supabaseService

AI_PROVIDER=openai
OPENAI_API_KEY=$openaiKey

NEXT_PUBLIC_APP_URL=http://localhost:3000
SESSION_SECRET=dev-session-secret-change-me
NODE_ENV=development

FEATURE_FLAGS=
REDIS_URL=
API_RATE_LIMIT_PER_MINUTE=10
SENTRY_DSN=
VERCEL_ANALYTICS_ID=
"@

$envContent | Out-File -FilePath ".env.local" -Encoding UTF8

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host " SUCCESS! Your .env.local has been updated!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Run: node test-env.js" -ForegroundColor White
Write-Host "   (to verify everything is working)" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Restart your server:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "Your app should now connect to Supabase and OpenAI!" -ForegroundColor Green

