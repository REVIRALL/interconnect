@echo off
echo GitHub認証情報セットアップ
echo ========================
echo.
echo このスクリプトはGitHub認証情報を保存します。
echo.
echo GitHub Personal Access Tokenが必要です。
echo まだ作成していない場合は、以下のURLから作成してください：
echo https://github.com/settings/tokens/new
echo.
echo 必要なスコープ: repo (Full control of private repositories)
echo.
set /p GITHUB_TOKEN=GitHub Personal Access Token を入力してください: 
set /p GIT_USER_NAME=あなたの名前を入力してください (例: Taro Yamada): 
set /p GIT_USER_EMAIL=あなたのメールアドレスを入力してください: 

echo.
echo 設定内容:
echo - Token: %GITHUB_TOKEN:~0,10%...
echo - Name: %GIT_USER_NAME%
echo - Email: %GIT_USER_EMAIL%
echo.

:: .envファイルを作成
echo # GitHub Personal Access Token> .env
echo GITHUB_TOKEN=%GITHUB_TOKEN%>> .env
echo GIT_USER_NAME=%GIT_USER_NAME%>> .env
echo GIT_USER_EMAIL=%GIT_USER_EMAIL%>> .env

:: Git設定
git config user.name "%GIT_USER_NAME%"
git config user.email "%GIT_USER_EMAIL%"

:: Credential Managerに保存
git config --global credential.helper manager-core

echo.
echo ✅ 設定が完了しました！
echo.
echo テストプッシュを実行しますか？
set /p TEST_PUSH=実行する場合は y を入力してください (y/n): 

if /i "%TEST_PUSH%"=="y" (
    echo.
    echo プッシュテスト中...
    git push https://%GITHUB_TOKEN%@github.com/REVIRALL/interconnect.git main
    if %ERRORLEVEL% EQU 0 (
        echo ✅ プッシュ成功！自動プッシュの準備が整いました。
    ) else (
        echo ❌ プッシュ失敗。トークンを確認してください。
    )
)

echo.
pause