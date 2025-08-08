#!/bin/bash

# window.supabaseをwindow.supabaseClientに置換するスクリプト

echo "window.supabase参照を修正中..."

# 修正対象のJSファイルリスト
files=(
    "js/activity-event-filter.js"
    "js/activities.js"
    "js/dashboard-data.js"
    "js/dashboard-charts.js"
    "js/auth-supabase.js"
    "js/calendly-booking.js"
    "js/check-supabase-tables.js"
    "js/dashboard-bundle.js"
    "js/dashboard.js"
    "js/timerex-booking.js"
    "js/user-profiles-fix.js"
    "js/error-diagnostic.js"
    "js/line-callback-debug.js"
    "js/auth-clean.js"
)

# バックアップディレクトリを作成
mkdir -p js/_backup_supabase_fix

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "修正中: $file"
        
        # バックアップを作成
        cp "$file" "js/_backup_supabase_fix/$(basename $file).bak"
        
        # window.supabaseをwindow.supabaseClientに置換
        # ただし、window.supabaseClientはスキップ
        sed -i 's/window\.supabase\([^C]\)/window.supabaseClient\1/g' "$file"
        
        # window.supabase.をwindow.supabaseClient.に置換
        sed -i 's/window\.supabase\./window.supabaseClient./g' "$file"
        
        # if (window.supabase) をif (window.supabaseClient) に置換
        sed -i 's/if (window\.supabase)/if (window.supabaseClient)/g' "$file"
        sed -i 's/if (!window\.supabase)/if (!window.supabaseClient)/g' "$file"
        
        # !!window.supabaseを!!window.supabaseClientに置換
        sed -i 's/!!window\.supabase/!!window.supabaseClient/g' "$file"
        
        # window.supabase &&をwindow.supabaseClient &&に置換
        sed -i 's/window\.supabase &&/window.supabaseClient \&\&/g' "$file"
        
        # window.supabase ||をwindow.supabaseClient ||に置換
        sed -i 's/window\.supabase ||/window.supabaseClient ||/g' "$file"
        
        # window.supabase?をwindow.supabaseClient?に置換
        sed -i 's/window\.supabase?/window.supabaseClient?/g' "$file"
        
        echo "  ✓ 完了"
    else
        echo "  ⚠ ファイルが見つかりません: $file"
    fi
done

echo ""
echo "修正完了！"
echo "バックアップは js/_backup_supabase_fix/ に保存されました"