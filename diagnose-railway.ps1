# 🔍 Railway Backend Diagnostic Script

Write-Host "🔍 Checking Railway Backend Status..." -ForegroundColor Cyan

# Test 1: DNS Resolution
Write-Host "`n1. Testing DNS Resolution..." -ForegroundColor Yellow
try {
    $dnsResult = Resolve-DnsName "my-work-production-7848.up.railway.app" -ErrorAction Stop
    Write-Host "✅ DNS Resolution: SUCCESS" -ForegroundColor Green
    Write-Host "   IP Address: $($dnsResult.IPAddress)" -ForegroundColor Gray
} catch {
    Write-Host "❌ DNS Resolution: FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: HTTP Connection
Write-Host "`n2. Testing HTTP Connection..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://my-work-production-7848.up.railway.app/api/health" -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
    Write-Host "✅ HTTP Connection: SUCCESS" -ForegroundColor Green
    Write-Host "   Status Code: $($response.StatusCode)" -ForegroundColor Gray
    Write-Host "   Response: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ HTTP Connection: FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Alternative URLs
Write-Host "`n3. Testing Alternative Railway URLs..." -ForegroundColor Yellow
$possibleUrls = @(
    "https://my-work-production.up.railway.app",
    "https://my-work.up.railway.app",
    "https://danah-web-production.up.railway.app"
)

foreach ($url in $possibleUrls) {
    try {
        $response = Invoke-WebRequest -Uri "$url/api/health" -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        Write-Host "✅ Found working URL: $url" -ForegroundColor Green
        Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Gray
        break
    } catch {
        Write-Host "❌ $url - Not accessible" -ForegroundColor Red
    }
}

# Recommendations
Write-Host "`n📋 TROUBLESHOOTING STEPS:" -ForegroundColor Cyan
Write-Host "1. Go to railway.app and check your project" -ForegroundColor White
Write-Host "2. Click on your service and go to 'Settings' tab" -ForegroundColor White
Write-Host "3. Copy the exact 'Domain' URL" -ForegroundColor White
Write-Host "4. Update api-config.js with the correct URL" -ForegroundColor White
Write-Host "5. Check Railway 'Logs' tab for any errors" -ForegroundColor White
Write-Host "6. Ensure all environment variables are set" -ForegroundColor White

Write-Host "`n🔧 QUICK FIX:" -ForegroundColor Yellow
Write-Host "If Railway URL is wrong, update this line in api-config.js:" -ForegroundColor White
Write-Host "BASE_URL: 'YOUR_CORRECT_RAILWAY_URL'," -ForegroundColor Cyan