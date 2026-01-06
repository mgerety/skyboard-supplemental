#!/bin/bash
# =============================================================================
# generate-manifest.sh - Generate manifest.json with file hashes and firmware info
# =============================================================================
# This script MUST be run after ANY changes to web files in this repository.
# The ESP32 uses file hashes to determine which files need to be downloaded,
# skipping unchanged files (like the large airports.json) to save time.
#
# Usage:
#   ./generate-manifest.sh           # Auto-increment version
#   ./generate-manifest.sh 160       # Set specific version
#
# IMPORTANT: Always run this script and commit the updated manifest.json
# before pushing changes. The ESP32 will not download new files if the
# manifest hasn't been updated!
#
# FIRMWARE RELEASES: Update FIRMWARE_VERSION and FIRMWARE_NOTES below when
# publishing new firmware. Copy the .bin to firmware/ directory first.
# =============================================================================

set -e

cd "$(dirname "$0")"

# =============================================================================
# FIRMWARE CONFIGURATION - Update these when releasing new firmware
# =============================================================================
FIRMWARE_VERSION="2.33.3"
FIRMWARE_URL="https://raw.githubusercontent.com/mgerety/skyboard-supplemental/main/firmware/skyboard-esp32s3.bin"
FIRMWARE_MIN_VERSION="2.30.0"
FIRMWARE_NOTES="OTA firmware updates (ESP32-S3 only)"

# Check if specific version was provided
if [ -n "$1" ]; then
    NEW_VERSION=$1
    echo "Using specified version: $NEW_VERSION"
else
    # Read current version from manifest.json if it exists, otherwise start at 1
    if [ -f manifest.json ]; then
        CURRENT_VERSION=$(grep -o '"version": [0-9]*' manifest.json | grep -o '[0-9]*' || echo "0")
        NEW_VERSION=$((CURRENT_VERSION + 1))
    else
        NEW_VERSION=1
    fi
    echo "Auto-incrementing to version: $NEW_VERSION"
fi

echo "Generating manifest.json version $NEW_VERSION..."

# Files to include in the manifest
# UPDATE THIS LIST when adding new web files!
FILES=(
    "index.html"
    "device.html"
    "airports.html"
    "weather.html"
    "system.html"
    "diagnostics.html"
    "css/base.css"
    "css/components.css"
    "css/sidebar.css"
    "js/components.js"
    "js/icons.js"
    "js/api.js"
    "js/file-browser.js"
    "js/update-banner.js"
    "data/airports.json"
)

# Start JSON output
echo "{" > manifest.json
echo "  \"version\": $NEW_VERSION," >> manifest.json

# Add firmware section
echo "  \"firmware\": {" >> manifest.json
echo "    \"version\": \"$FIRMWARE_VERSION\"," >> manifest.json
echo "    \"url\": \"$FIRMWARE_URL\"," >> manifest.json
echo "    \"min_version\": \"$FIRMWARE_MIN_VERSION\"," >> manifest.json
echo "    \"notes\": \"$FIRMWARE_NOTES\"" >> manifest.json
echo "  }," >> manifest.json

# Add files section
echo "  \"files\": {" >> manifest.json

# Generate hashes for each file
FIRST=true
FILE_COUNT=0
for FILE in "${FILES[@]}"; do
    if [ -f "$FILE" ]; then
        # Compute MD5 hash (works on macOS and Linux)
        if command -v md5sum &> /dev/null; then
            HASH=$(md5sum "$FILE" | cut -d' ' -f1)
        else
            # macOS uses md5 command
            HASH=$(md5 -q "$FILE")
        fi

        # Add comma before all but first entry
        if [ "$FIRST" = true ]; then
            FIRST=false
        else
            echo "," >> manifest.json
        fi

        # Write file entry (no newline, comma added by next iteration)
        printf "    \"%s\": \"%s\"" "$FILE" "$HASH" >> manifest.json
        FILE_COUNT=$((FILE_COUNT + 1))
    else
        echo "WARNING: File not found: $FILE"
    fi
done

# Close JSON
echo "" >> manifest.json
echo "  }" >> manifest.json
echo "}" >> manifest.json

echo ""
echo "============================================"
echo "Generated manifest.json"
echo "  Version:  $NEW_VERSION"
echo "  Files:    $FILE_COUNT"
echo "  Firmware: $FIRMWARE_VERSION"
echo "============================================"
echo ""
echo "NEXT STEPS:"
echo "  1. git add manifest.json"
echo "  2. git commit -m 'chore: update manifest to v$NEW_VERSION'"
echo "  3. git push"
echo ""
echo "FIRMWARE RELEASE? Don't forget to:"
echo "  1. Update FIRMWARE_VERSION in this script"
echo "  2. Copy new .bin to firmware/ directory"
echo "  3. Update FIRMWARE_NOTES"
echo ""
