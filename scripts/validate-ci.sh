#!/bin/bash
set -e

echo "🔍 Running CI validation locally..."
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track failures
FAILED=0

# Function to run a command and check result
run_check() {
    local name="$1"
    local command="$2"
    
    echo -e "\n${YELLOW}Running: $name${NC}"
    echo "Command: $command"
    
    if eval "$command"; then
        echo -e "${GREEN}✅ $name passed${NC}"
    else
        echo -e "${RED}❌ $name failed${NC}"
        FAILED=1
    fi
}

# 1. Lint check
run_check "Biome Lint" "bun run lint"

# 2. Format check
run_check "Biome Format Check" "bun run format --check"

# 3. Type check
run_check "TypeScript Check" "bun run type-check"

# 4. Build packages
run_check "Build Packages" "bun run build:packages"

# 5. Unit tests
run_check "Unit Tests" "bun test"

# 6. Unit tests with coverage
run_check "Unit Tests with Coverage" "bun test --coverage"

# 7. Check file sizes
run_check "File Size Check" "bun run filesize"

# 8. Playwright tests (if app is built)
if [ -d "apps/panda/dist" ]; then
    echo -e "\n${YELLOW}Running Playwright tests...${NC}"
    # Install browsers if needed
    bunx playwright install --with-deps chromium
    run_check "Playwright Tests" "bun run playwright --project=chromium"
else
    echo -e "\n${YELLOW}Skipping Playwright tests (app not built)${NC}"
    echo "Run 'bun run build:app' first to test Playwright"
fi

# 9. Try a test Tauri build (quick check)
echo -e "\n${YELLOW}Checking Tauri setup...${NC}"
cd apps/panda
if command -v cargo &> /dev/null; then
    run_check "Cargo Check" "cd src-tauri && cargo check"
else
    echo -e "${YELLOW}Rust/Cargo not installed - skipping Tauri checks${NC}"
fi
cd ../..

# Summary
echo -e "\n================================"
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All CI checks passed!${NC}"
    echo "You can safely push your changes."
else
    echo -e "${RED}❌ Some CI checks failed!${NC}"
    echo "Please fix the issues before pushing."
    exit 1
fi