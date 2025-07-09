@echo off
chcp 65001 > nul
title GitHub認証設定 - INTERCONNECT

echo.
echo ============================================
echo    GitHub認証設定ツール - INTERCONNECT
echo ============================================
echo.
echo このツールは3つの情報が必要です：
echo.
echo 1. GitHub Personal Access Token
echo    （ghp_で始まる文字列）
echo.
echo 2. あなたの名前
echo    （例: Taro Yamada）
echo.
echo 3. メールアドレス
echo    （GitHubに登録したもの）
echo.
echo ============================================
echo.
echo 準備ができたらEnterキーを押してください...
pause > nul

cls
echo.
echo ステップ 1/3: GitHub Token
echo ============================
echo.
echo トークンを入力してください
echo （Ctrl+V で貼り付けできます）
echo.
set /p GITHUB_TOKEN=Token: 

cls
echo.
echo ステップ 2/3: お名前
echo ============================
echo.
echo あなたの名前を入力してください
echo （日本語でもOK）
echo.
set /p GIT_USER_NAME=名前: 

cls
echo.
echo ステップ 3/3: メールアドレス
echo ============================
echo.
echo GitHubに登録したメールアドレス
echo.
set /p GIT_USER_EMAIL=メール: 

cls
echo.
echo 確認画面
echo ============================
echo.
echo Token: %GITHUB_TOKEN:~0,20%...
echo 名前: %GIT_USER_NAME%
echo メール: %GIT_USER_EMAIL%
echo.
echo この内容で設定しますか？
echo.
set /p CONFIRM=よければ y を入力: 

if /i "%CONFIRM%" neq "y" (
    echo.
    echo キャンセルしました
    pause
    exit
)

echo.
echo 設定を保存しています...

:: .envファイルを作成
(
echo # GitHub Personal Access Token
echo GITHUB_TOKEN=%GITHUB_TOKEN%
echo GIT_USER_NAME=%GIT_USER_NAME%
echo GIT_USER_EMAIL=%GIT_USER_EMAIL%
) > .env

:: Git設定
git config user.name "%GIT_USER_NAME%"
git config user.email "%GIT_USER_EMAIL%"
git config --global credential.helper manager-core

echo.
echo ✅ 設定完了！
echo.
echo テストしています...
echo.

:: テストプッシュ
git push https://%GITHUB_TOKEN%@github.com/REVIRALL/interconnect.git main 2>&1

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo    ✅ 成功！
    echo    自動プッシュの準備ができました
    echo ========================================
) else (
    echo.
    echo ========================================
    echo    ❌ エラーが発生しました
    echo    トークンを確認してください
    echo ========================================
)

echo.
echo 終了するにはEnterキーを押してください...
pause > nul