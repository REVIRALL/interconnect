#!/bin/bash

# 残りのwindow.supabase参照を修正

echo "残りのwindow.supabase参照を修正中..."

# 修正対象のJSファイルリスト（追加分）
files=(
    "js/global-user-profiles-fix.js"
    "js/events-supabase.js"
    "js/profile-sync.js"
    "js/profile.js"
    "js/members-supabase.js"
    "js/supabase-wait-fix.js"
    "js/profile-viewer.js"
    "js/production-ready-check.js"
    "js/notifications-supabase.js"
    "js/notifications-realtime-actions.js"
    "js/notifications-read-manager.js"
    "js/notifications-delete.js"
    "js/notifications-complete-implementation.js"
    "js/notifications-complete-check.js"
    "js/notifications-actions-fix.js"
    "js/notification-sender.js"
    "js/messages-external-contacts.js"
    "js/message-integration.js"
    "js/members-connection.js"
    "js/guest-mode-manager.js"
    "js/global-functions.js"
    "js/forgot-password.js"
    "js/dashboard-updater.js"
    "js/dashboard-realtime-calculator.js"
    "js/dashboard-message-calculator.js"
    "js/dashboard-fix-loading.js"
    "js/dashboard-event-participation.js"
    "js/dashboard-event-fix.js"
    "js/registration-flow.js"
)

# バックアップディレクトリを作成
mkdir -p js/_backup_supabase_fix2

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "修正中: $file"
        
        # バックアップを作成
        cp "$file" "js/_backup_supabase_fix2/$(basename $file).bak"
        
        # window.supabase || window.supabaseClientはそのまま残す
        # window.supabaseClient || window.supabaseもそのまま残す
        
        # 単独のwindow.supabaseをwindow.supabaseClientに置換
        sed -i 's/\bwindow\.supabase\b\([^C|]\)/window.supabaseClient\1/g' "$file"
        
        # window.supabase.をwindow.supabaseClient.に置換
        sed -i 's/window\.supabase\./window.supabaseClient./g' "$file"
        
        # if (window.supabase) をif (window.supabaseClient) に置換
        sed -i 's/if (window\.supabase)/if (window.supabaseClient)/g' "$file"
        sed -i 's/if (!window\.supabase)/if (!window.supabaseClient)/g' "$file"
        
        # !!window.supabaseを!!window.supabaseClientに置換
        sed -i 's/!!window\.supabase\b/!!window.supabaseClient/g' "$file"
        
        # window.supabase &&をwindow.supabaseClient &&に置換
        sed -i 's/window\.supabase &&/window.supabaseClient \&\&/g' "$file"
        
        # window.supabase?をwindow.supabaseClient?に置換
        sed -i 's/window\.supabase\?/window.supabaseClient?/g' "$file"
        
        # const client = window.supabaseClient || window.supabaseのパターンは保持
        # window._patched関連も保持
        
        echo "  ✓ 完了"
    else
        echo "  ⚠ ファイルが見つかりません: $file"
    fi
done

echo ""
echo "修正完了！"
echo "バックアップは js/_backup_supabase_fix2/ に保存されました"