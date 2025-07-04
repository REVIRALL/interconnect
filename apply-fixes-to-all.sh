#!/bin/bash

# Script to apply logout and responsive fixes to all HTML files

# List of HTML files to update
HTML_FILES=(
    "members.html"
    "events.html"
    "settings.html"
    "messages.html"
    "business.html"
    "invite.html"
    "admin.html"
    "register.html"
    "forgot-password.html"
    "privacy.html"
    "terms.html"
    "company.html"
    "member-profile.html"
    "help.html"
    "password-reset.html"
)

# Function to add responsive CSS
add_responsive_css() {
    local file=$1
    if [ -f "$file" ]; then
        # Check if responsive-design-fix.css is already included
        if ! grep -q "responsive-design-fix.css" "$file"; then
            # Find the line number of </head>
            head_line=$(grep -n "</head>" "$file" | cut -d: -f1)
            if [ ! -z "$head_line" ]; then
                # Insert the CSS link before </head>
                sed -i "${head_line}i\\    <link rel=\"stylesheet\" href=\"responsive-design-fix.css\">" "$file"
                echo "Added responsive-design-fix.css to $file"
            fi
        else
            echo "responsive-design-fix.css already in $file"
        fi
    fi
}

# Function to add auth-logout-fix.js
add_logout_script() {
    local file=$1
    if [ -f "$file" ]; then
        # Check if auth-logout-fix.js is already included
        if ! grep -q "auth-logout-fix.js" "$file"; then
            # Find the line number of </body>
            body_line=$(grep -n "</body>" "$file" | tail -1 | cut -d: -f1)
            if [ ! -z "$body_line" ]; then
                # Check if auth.js is included
                if ! grep -q "auth.js" "$file"; then
                    # Add auth.js first
                    sed -i "${body_line}i\\    <script src=\"auth.js\"></script>" "$file"
                    echo "Added auth.js to $file"
                fi
                # Add auth-logout-fix.js
                sed -i "${body_line}i\\    <script src=\"auth-logout-fix.js\"></script>" "$file"
                echo "Added auth-logout-fix.js to $file"
            fi
        else
            echo "auth-logout-fix.js already in $file"
        fi
    fi
}

# Function to ensure common.js is included
add_common_js() {
    local file=$1
    if [ -f "$file" ]; then
        # Check if common.js is already included
        if ! grep -q "common.js" "$file"; then
            # Find the line number of </body>
            body_line=$(grep -n "</body>" "$file" | tail -1 | cut -d: -f1)
            if [ ! -z "$body_line" ]; then
                # Add common.js before other scripts
                sed -i "${body_line}i\\    <script src=\"common.js\"></script>" "$file"
                echo "Added common.js to $file"
            fi
        fi
    fi
}

# Apply fixes to each file
for file in "${HTML_FILES[@]}"; do
    echo "Processing $file..."
    add_responsive_css "$file"
    add_common_js "$file"
    add_logout_script "$file"
    echo "---"
done

echo "All files processed!"
echo ""
echo "Summary of changes:"
echo "1. Added responsive-design-fix.css for responsive design (320px to 1920px+)"
echo "2. Added auth-logout-fix.js for consistent logout functionality"
echo "3. Ensured common.js and auth.js are included where needed"
echo ""
echo "Next steps:"
echo "1. Test the logout functionality on each page"
echo "2. Test responsive design on different screen sizes"
echo "3. Use test-responsive-logout.html for comprehensive testing"