# PowerShell用のテストスクリプト
Write-Host "GitHub接続テスト" -ForegroundColor Cyan
Write-Host ""

# .envファイルを読み込む
if (Test-Path .env) {
    Get-Content .env | Where-Object { $_ -match '^[^#].*=' } | ForEach-Object {
        $name, $value = $_ -split '=', 2
        Set-Item -Path "env:$name" -Value $value
    }
    
    Write-Host "設定を読み込みました" -ForegroundColor Green
    Write-Host "Token: $($env:GITHUB_TOKEN.Substring(0, 10))..." -ForegroundColor Yellow
    Write-Host "Name: $env:GIT_USER_NAME" -ForegroundColor Yellow
    Write-Host "Email: $env:GIT_USER_EMAIL" -ForegroundColor Yellow
    Write-Host ""
    
    # Git設定
    git config user.name $env:GIT_USER_NAME
    git config user.email $env:GIT_USER_EMAIL
    
    Write-Host "プッシュテスト中..." -ForegroundColor Cyan
    $result = git push "https://$($env:GITHUB_TOKEN)@github.com/REVIRALL/interconnect.git" main 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ 成功！GitHubへの接続が確認できました" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "❌ エラー: $result" -ForegroundColor Red
        Write-Host ""
        Write-Host "トークンを確認してください" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ .envファイルが見つかりません" -ForegroundColor Red
    Write-Host ""
    Write-Host "先に .env ファイルを作成してください：" -ForegroundColor Yellow
    Write-Host "1. メモ帳で .env ファイルを作成" -ForegroundColor White
    Write-Host "2. 以下の内容を入力：" -ForegroundColor White
    Write-Host ""
    Write-Host "GITHUB_TOKEN=あなたのトークン" -ForegroundColor Cyan
    Write-Host "GIT_USER_NAME=あなたの名前" -ForegroundColor Cyan
    Write-Host "GIT_USER_EMAIL=あなたのメール" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "終了するにはEnterキーを押してください..."
Read-Host