# homeTeam Backend API Test Script

# Admin JWT Token (her test için gerekli)
$adminToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQGhvbWV0ZWFtLmFwcCIsInN1YiI6IjY4ODE2YjYxZjM1ZWFmYTI5MWJlYWRhMyIsInJvbGUiOiJhZG1pbiIsImZpcnN0TmFtZSI6IkFkbWluIiwibGFzdE5hbWUiOiJVc2VyIiwiaWF0IjoxNzUzMzEyMTMxLCJleHAiOjE3NTM5MTY5MzF9.Zx7a8--y6QEeV1GeXJGr5sOuMxIg11sUMlc-BkQPxo8"

# Base URL
$baseUrl = "http://localhost:3001"

Write-Host "🚀 homeTeam Backend API Test Suite Başlatılıyor..." -ForegroundColor Green
Write-Host "================================================="

# Test fonksiyonu
function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Endpoint,
        [string]$Description,
        [hashtable]$Data = @{},
        [bool]$RequireAuth = $true
    )
    
    Write-Host "`n🔍 Testing: $Method $Endpoint - $Description" -ForegroundColor Yellow
    
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    if ($RequireAuth) {
        $headers["Authorization"] = "Bearer $adminToken"
    }
    
    try {
        if ($Method -eq "GET") {
            $response = Invoke-RestMethod -Uri "$baseUrl$Endpoint" -Method $Method -Headers $headers
        } else {
            $body = $Data | ConvertTo-Json -Depth 10
            $response = Invoke-RestMethod -Uri "$baseUrl$Endpoint" -Method $Method -Headers $headers -Body $body
        }
        
        Write-Host "✅ Success: $Method $Endpoint" -ForegroundColor Green
        Write-Host "Response: $($response | ConvertTo-Json -Depth 2)" -ForegroundColor Cyan
        return $response
    } catch {
        Write-Host "❌ Failed: $Method $Endpoint" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# 1. AUTH ENDPOINTS TEST
Write-Host "`n📁 AUTHENTICATION ENDPOINTS" -ForegroundColor Magenta
Write-Host "================================"

# Auth Profile (authenticated endpoint)
Test-Endpoint -Method "GET" -Endpoint "/auth/profile" -Description "Get admin profile" -RequireAuth $true

# Auth Verify Token (requires auth header)
Test-Endpoint -Method "POST" -Endpoint "/auth/verify-token" -Description "Verify JWT token" -RequireAuth $true

# 2. USERS ENDPOINTS TEST
Write-Host "`n👥 USERS ENDPOINTS" -ForegroundColor Magenta
Write-Host "==================="

# Get all users
Test-Endpoint -Method "GET" -Endpoint "/users" -Description "Get all users" -RequireAuth $true

# Get user profile
Test-Endpoint -Method "GET" -Endpoint "/users/profile" -Description "Get current user profile" -RequireAuth $true

# 3. GROUPS ENDPOINTS TEST
Write-Host "`n👨‍👩‍👧‍👦 GROUPS ENDPOINTS" -ForegroundColor Magenta
Write-Host "======================"

# Get all groups
Test-Endpoint -Method "GET" -Endpoint "/groups" -Description "Get all groups" -RequireAuth $true

# Create a test group with unique name
$timestamp = [int][double]::Parse((Get-Date -UFormat %s))
$groupData = @{
    name = "API Test Group $timestamp"
    description = "API Test Group Created at $(Get-Date)"
    type = "team"
    settings = @{
        privacy = "private"
        memberLimit = 10
        allowInvites = $true
    }
}
Test-Endpoint -Method "POST" -Endpoint "/groups" -Description "Create test group" -Data $groupData -RequireAuth $true

# 4. TASKS ENDPOINTS TEST
Write-Host "`n📋 TASKS ENDPOINTS" -ForegroundColor Magenta
Write-Host "=================="

# Get all tasks
Test-Endpoint -Method "GET" -Endpoint "/tasks" -Description "Get all tasks" -RequireAuth $true

# Get task stats
Test-Endpoint -Method "GET" -Endpoint "/tasks/stats/overview" -Description "Get task statistics" -RequireAuth $true

# Get my pending tasks
Test-Endpoint -Method "GET" -Endpoint "/tasks/my/pending" -Description "Get my pending tasks" -RequireAuth $true

# Create a test task
$taskData = @{
    title = "API Test Task"
    description = "Test task created via API"
    priority = "medium"
    dueDate = (Get-Date).AddDays(7).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    tags = @("test", "api")
}
Test-Endpoint -Method "POST" -Endpoint "/tasks" -Description "Create test task" -Data $taskData -RequireAuth $true

# 5. NOTIFICATIONS ENDPOINTS TEST
Write-Host "`n🔔 NOTIFICATIONS ENDPOINTS" -ForegroundColor Magenta
Write-Host "==========================="

# Get all notifications
Test-Endpoint -Method "GET" -Endpoint "/notifications" -Description "Get all notifications" -RequireAuth $true

# Get notification stats
Test-Endpoint -Method "GET" -Endpoint "/notifications/stats" -Description "Get notification statistics" -RequireAuth $true

# 6. MUSIC ENDPOINTS TEST
Write-Host "`n🎵 MUSIC ENDPOINTS" -ForegroundColor Magenta
Write-Host "=================="

# Get music integrations
Test-Endpoint -Method "GET" -Endpoint "/music/integrations" -Description "Get music integrations" -RequireAuth $true

# Get music stats
Test-Endpoint -Method "GET" -Endpoint "/music/stats" -Description "Get music statistics" -RequireAuth $true

# 7. LOGS ENDPOINTS TEST (Error Monitoring)
Write-Host "`n📊 LOGS ENDPOINTS (Error Monitoring)" -ForegroundColor Magenta
Write-Host "====================================="

# Get recent logs
Test-Endpoint -Method "GET" -Endpoint "/logs/recent" -Description "Get recent error logs" -RequireAuth $true

# Get log stats
Test-Endpoint -Method "GET" -Endpoint "/logs/stats" -Description "Get error log statistics" -RequireAuth $true

# Get log categories
Test-Endpoint -Method "GET" -Endpoint "/logs/categories" -Description "Get log categories" -RequireAuth $true

Write-Host "`n✅ API Test Suite Tamamlandı!" -ForegroundColor Green
Write-Host "=============================="
