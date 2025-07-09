# Simple test script for GitHub push
Write-Host "GitHub Connection Test" -ForegroundColor Cyan
Write-Host ""

# Read .env file
if (Test-Path .env) {
    Get-Content .env | Where-Object { $_ -match '^[^#].*=' } | ForEach-Object {
        $name, $value = $_ -split '=', 2
        Set-Item -Path "env:$name" -Value $value
    }
    
    Write-Host "Settings loaded" -ForegroundColor Green
    Write-Host "Token: $($env:GITHUB_TOKEN.Substring(0, 10))..." -ForegroundColor Yellow
    Write-Host "Name: $env:GIT_USER_NAME" -ForegroundColor Yellow
    Write-Host "Email: $env:GIT_USER_EMAIL" -ForegroundColor Yellow
    Write-Host ""
    
    # Git configuration
    git config user.name $env:GIT_USER_NAME
    git config user.email $env:GIT_USER_EMAIL
    
    Write-Host "Testing push..." -ForegroundColor Cyan
    $result = git push "https://$($env:GITHUB_TOKEN)@github.com/REVIRALL/interconnect.git" main 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "SUCCESS! GitHub connection confirmed" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "ERROR: $result" -ForegroundColor Red
        Write-Host ""
    }
} else {
    Write-Host "ERROR: .env file not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "Press Enter to exit..."
Read-Host