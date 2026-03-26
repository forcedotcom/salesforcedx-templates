#!/bin/bash

# TypeScript Project Generation - Local Test Script
# This script helps automate local testing of TypeScript functionality

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test directory
TEST_DIR="${TEST_DIR:-/tmp/ts-template-tests}"
TEMPLATES_DIR="$(pwd)"

echo -e "${GREEN}=== TypeScript Template Testing ===${NC}"
echo "Templates directory: $TEMPLATES_DIR"
echo "Test directory: $TEST_DIR"
echo ""

# Function to print test status
print_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $1"
    else
        echo -e "${RED}✗${NC} $1"
        exit 1
    fi
}

# Clean up previous test
echo -e "${YELLOW}Cleaning up previous tests...${NC}"
rm -rf "$TEST_DIR"
mkdir -p "$TEST_DIR"
print_status "Test directory prepared"

# Step 1: Build the library
echo -e "\n${YELLOW}Step 1: Building the library...${NC}"
cd "$TEMPLATES_DIR"
yarn build > /dev/null 2>&1
print_status "Library built successfully"

# Verify TypeScript template files exist
echo -e "\n${YELLOW}Step 2: Verifying TypeScript template files...${NC}"
required_files=(
    "lib/templates/project/tsconfig.json"
    "lib/templates/project/package.typescript.json"
    "lib/templates/project/project.eslint.typescript.config.js"
    "lib/templates/project/settings.typescript.json"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} Found: $file"
    else
        echo -e "${RED}✗${NC} Missing: $file"
        exit 1
    fi
done

# Check if we have plugin-templates installed
echo -e "\n${YELLOW}Step 3: Checking for plugin-templates...${NC}"
if ! command -v sf &> /dev/null; then
    echo -e "${YELLOW}⚠${NC}  'sf' CLI not found. Skipping CLI tests."
    echo "    Install with: npm install -g @salesforce/cli"
    CLI_AVAILABLE=false
else
    CLI_AVAILABLE=true
    echo -e "${GREEN}✓${NC} Salesforce CLI found: $(sf --version)"
fi

# Test using the templates library directly
echo -e "\n${YELLOW}Step 4: Testing template generation programmatically...${NC}"

# Create a test script to generate projects
cat > "$TEST_DIR/test-generate.js" << 'EOF'
const path = require('path');
const fs = require('fs');

// Import the templates library
const templatesPath = process.argv[2];
const { TemplateService } = require(path.join(templatesPath, 'lib'));

const testDir = process.argv[3];
const projectName = process.argv[4];
const lwcLanguage = process.argv[5];

console.log('Generating project:', projectName);
console.log('LWC Language:', lwcLanguage);

const templateService = TemplateService.getInstance();

templateService.create('project', {
    projectname: projectName,
    template: 'standard',
    defaultpackagedir: 'force-app',
    manifest: false,
    ns: '',
    loginurl: 'https://login.salesforce.com',
    lwcLanguage: lwcLanguage,
    outputdir: testDir
}).then(() => {
    console.log('✓ Project generated successfully');

    // Verify key files
    const projectPath = path.join(testDir, projectName);
    const requiredFiles = [
        'sfdx-project.json',
        'package.json',
        'force-app'
    ];

    if (lwcLanguage === 'typescript') {
        requiredFiles.push('tsconfig.json');
    }

    let allFilesExist = true;
    requiredFiles.forEach(file => {
        const filePath = path.join(projectPath, file);
        if (fs.existsSync(filePath)) {
            console.log('✓ Found:', file);
        } else {
            console.error('✗ Missing:', file);
            allFilesExist = false;
        }
    });

    if (!allFilesExist) {
        process.exit(1);
    }

    // Check sfdx-project.json for defaultLwcLanguage
    const sfdxProjectPath = path.join(projectPath, 'sfdx-project.json');
    const sfdxProject = JSON.parse(fs.readFileSync(sfdxProjectPath, 'utf8'));

    if (lwcLanguage === 'typescript') {
        if (sfdxProject.defaultLwcLanguage === 'typescript') {
            console.log('✓ defaultLwcLanguage is set to typescript');
        } else {
            console.error('✗ defaultLwcLanguage not set correctly');
            process.exit(1);
        }
    } else {
        if (!sfdxProject.defaultLwcLanguage) {
            console.log('✓ defaultLwcLanguage not set (expected for JS)');
        } else {
            console.error('✗ defaultLwcLanguage should not be set for JS projects');
            process.exit(1);
        }
    }

    process.exit(0);
}).catch(err => {
    console.error('✗ Error:', err.message);
    process.exit(1);
});
EOF

# Test TypeScript project generation
echo -e "\n${YELLOW}Test 4a: Generating TypeScript Standard Project...${NC}"
node "$TEST_DIR/test-generate.js" "$TEMPLATES_DIR" "$TEST_DIR" "ts-standard-test" "typescript"
print_status "TypeScript project generated"

# Test JavaScript project generation (regression)
echo -e "\n${YELLOW}Test 4b: Generating JavaScript Standard Project (regression)...${NC}"
node "$TEST_DIR/test-generate.js" "$TEMPLATES_DIR" "$TEST_DIR" "js-standard-test" "javascript"
print_status "JavaScript project generated"

# Verify TypeScript project structure
echo -e "\n${YELLOW}Step 5: Verifying TypeScript project structure...${NC}"
TS_PROJECT="$TEST_DIR/ts-standard-test"

ts_files=(
    "tsconfig.json"
    "package.json"
    "eslint.config.js"
    ".vscode/settings.json"
    ".gitignore"
    ".forceignore"
    "sfdx-project.json"
)

for file in "${ts_files[@]}"; do
    if [ -f "$TS_PROJECT/$file" ] || [ -d "$TS_PROJECT/$file" ]; then
        echo -e "${GREEN}✓${NC} $file"
    else
        echo -e "${RED}✗${NC} Missing: $file"
        exit 1
    fi
done

# Check package.json for TypeScript dependencies
echo -e "\n${YELLOW}Step 6: Verifying TypeScript dependencies...${NC}"
if grep -q '"typescript"' "$TS_PROJECT/package.json"; then
    echo -e "${GREEN}✓${NC} TypeScript dependency found"
else
    echo -e "${RED}✗${NC} TypeScript dependency missing"
    exit 1
fi

if grep -q '"@typescript-eslint/parser"' "$TS_PROJECT/package.json"; then
    echo -e "${GREEN}✓${NC} TypeScript ESLint parser found"
else
    echo -e "${RED}✗${NC} TypeScript ESLint parser missing"
    exit 1
fi

# Test npm install
echo -e "\n${YELLOW}Step 7: Testing npm install...${NC}"
cd "$TS_PROJECT"
npm install --silent > /dev/null 2>&1
print_status "Dependencies installed"

# Test TypeScript compilation
echo -e "\n${YELLOW}Step 8: Testing TypeScript compilation...${NC}"
npm run build > /dev/null 2>&1
print_status "TypeScript compilation successful"

# Test linting
echo -e "\n${YELLOW}Step 9: Testing ESLint...${NC}"
npm run lint > /dev/null 2>&1
print_status "Linting successful"

# Summary
echo -e "\n${GREEN}=== All Tests Passed! ===${NC}"
echo ""
echo "Generated projects:"
echo "  - TypeScript: $TEST_DIR/ts-standard-test"
echo "  - JavaScript: $TEST_DIR/js-standard-test"
echo ""
echo "Next steps:"
echo "  1. Manually inspect the generated projects"
echo "  2. Open in VSCode and verify IntelliSense"
echo "  3. Test creating LWC components"
echo "  4. Test git workflow (commits, hooks)"
echo ""
echo "To clean up test projects:"
echo "  rm -rf $TEST_DIR"
echo ""
