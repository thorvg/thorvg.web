#!/bin/bash

# Cross-framework build test script for thorvg.web examples
# Tests build functionality across different frontend frameworks

set -e

EXAMPLES_DIR="example"
SUCCESSFUL=()
FAILED=()

echo "🚀 Starting cross-framework build testing..."

# Find all framework directories
FRAMEWORKS=$(find "$EXAMPLES_DIR" -maxdepth 1 -type d -not -name "$EXAMPLES_DIR" -not -name "node_modules" -not -name ".*" | sed "s|$EXAMPLES_DIR/||")

echo "Found frameworks: $FRAMEWORKS"

for framework in $FRAMEWORKS; do
    framework_path="$EXAMPLES_DIR/$framework"
    package_json="$framework_path/package.json"

    echo "Testing $framework build..."

    # Check if directory and package.json exist
    if [[ ! -d "$framework_path" ]]; then
        echo "❌ $framework: Directory does not exist"
        FAILED+=("$framework (directory missing)")
        continue
    fi

    if [[ ! -f "$package_json" ]]; then
        echo "❌ $framework: package.json not found"
        FAILED+=("$framework (package.json missing)")
        continue
    fi

    # Change to framework directory
    cd "$framework_path"

    # Install dependencies if node_modules doesn't exist
    if [[ ! -d "node_modules" ]]; then
        echo "Installing dependencies for $framework..."
        if ! npm install; then
            echo "❌ $framework: Failed to install dependencies"
            FAILED+=("$framework (install failed)")
            cd - > /dev/null
            continue
        fi
    fi

    # Build the project
    echo "Building $framework..."
    if npm run build; then
        echo "✅ $framework build completed successfully!"
        SUCCESSFUL+=("$framework")
    else
        echo "❌ $framework build failed"
        FAILED+=("$framework (build failed)")
    fi

    # Return to original directory
    cd - > /dev/null
done

# Summary
echo ""
echo "📊 Build Test Summary:"
echo "✅ Successful: [$(printf '%s, ' "${SUCCESSFUL[@]}" | sed 's/, $//')]"
if [[ ${#FAILED[@]} -gt 0 ]]; then
    echo "❌ Failed: [$(printf '%s, ' "${FAILED[@]}" | sed 's/, $//')]"
fi

echo ""
echo "Total tested: $((${#SUCCESSFUL[@]} + ${#FAILED[@]}))"

# Exit with error code if any builds failed
if [[ ${#FAILED[@]} -gt 0 ]]; then
    exit 1
else
    echo "🎉 All builds completed successfully!"
    exit 0
fi
