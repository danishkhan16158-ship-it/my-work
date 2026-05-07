# Test Script for Danah Web Backend
# Run this to verify your backend works before deploying

# Set Node.js path
$env:Path += ";C:\Program Files\nodejs"

# Navigate to project directory
cd "c:\Users\HP\Desktop\danah web"

# Test 1: Check if server starts
Write-Host "🧪 Testing backend startup..." -ForegroundColor Cyan
try {
    $job = Start-Job -ScriptBlock {
        $env:Path += ";C:\Program Files\nodejs"
        cd "c:\Users\HP\Desktop\danah web"
        & "C:\Program Files\nodejs\node.exe" server.js
    }

    Start-Sleep -Seconds 3

    # Test 2: Check health endpoint
    Write-Host "🏥 Testing health endpoint..." -ForegroundColor Cyan
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/health" -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend is running successfully!" -ForegroundColor Green
        Write-Host "📄 Health response:" $response.Content -ForegroundColor Gray
    } else {
        Write-Host "❌ Health check failed" -ForegroundColor Red
    }

    # Stop the server
    Stop-Job -Job $job
    Remove-Job -Job $job

} catch {
    Write-Host "❌ Backend test failed:" $_.Exception.Message -ForegroundColor Red
}

Write-Host "`n🎯 Ready for Railway deployment!" -ForegroundColor Yellow
Write-Host "📋 Next: Follow QUICK_RAILWAY_DEPLOY.md" -ForegroundColor Yellow