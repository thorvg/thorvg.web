#!/bin/bash

# Cross-framework build test script for thorvg.web examples
# Tests build functionality across different frontend frameworks

set -e

EXAMPLES_DIR="example"
SUCCESSFUL=()
FAILED=()

echo "🚀 Starting cross-framework build testing..."

# Generate Webassembly code & Build the Web Component
echo ""
echo "📦 Building root @thorvg/lottie-player package..."
npm run build

# Find all framework directories
REPO_ROOT="$(pwd)"
FRAMEWORKS=()
for dir in "$EXAMPLES_DIR"/*/; do
  [[ -d "$dir" ]] || continue
  name="$(basename "$dir")"
  [[ "$name" == "node_modules" || "$name" == .* ]] && continue
  [[ -f "$dir/package.json" ]] && FRAMEWORKS+=("$name")
done
echo "🔍 Found frameworks: ${FRAMEWORKS[*]}"
echo ""

# Test each framework
for framework in "${FRAMEWORKS[@]}"; do
  framework_path="$EXAMPLES_DIR/$framework"
  package_json="$framework_path/package.json"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "Testing $framework build..."
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  # Change to framework directory
  cd "$framework_path"

  # Clean install
  echo "🧹 Cleaning node_modules..."
  rm -rf node_modules
  echo "📥 Installing dependencies..."
  if ! npm install; then
    echo "❌ $framework: Failed to install dependencies"
    FAILED+=("$framework (install failed)")
    continue
  fi

  # Build the project
  echo "🔨 Building $framework..."
  if npm run build; then
    echo "✅ $framework build completed successfully!"
    SUCCESSFUL+=("$framework")
  else
    echo "❌ $framework build failed"
    FAILED+=("$framework (build failed)")
  fi

  # Return to repo root for safety
  cd "$REPO_ROOT" > /dev/null
  echo ""
done

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Build Test Summary:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Successful: [$(printf '%s, ' "${SUCCESSFUL[@]}" | sed 's/, $//')]"
if [[ ${#FAILED[@]} -gt 0 ]]; then
  echo "❌ Failed: [$(printf '%s, ' "${FAILED[@]}" | sed 's/, $//')]"
fi
echo ""
echo "Total tested: $((${#SUCCESSFUL[@]} + ${#FAILED[@]}))"

# Exit with error code if any builds failed
if [[ ${#FAILED[@]} -gt 0 ]]; then
  echo ""
  echo "❌ Some builds failed. Please check the errors above."
  exit 1
else
  echo ""
  echo "🎉 All builds completed successfully!"
  exit 0
fi
