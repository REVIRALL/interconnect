#!/bin/bash

# 全HTMLファイルにbutton-mobile-enhance.cssを追加

echo "Adding button-mobile-enhance.css to all HTML files..."

for file in *.html; do
    if [ -f "$file" ]; then
        if grep -q "button-mobile-enhance.css" "$file"; then
            echo "$file already has button-mobile-enhance.css"
        else
            # button-section-optimization.cssの後に追加
            sed -i 's|<link rel="stylesheet" href="button-section-optimization.css">|<link rel="stylesheet" href="button-section-optimization.css">\n    <link rel="stylesheet" href="button-mobile-enhance.css">|' "$file"
            echo "Added to $file"
        fi
    fi
done

echo "Done!"