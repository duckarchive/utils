#!/bin/bash
# Quick setup script for development

set -e

echo "🚀 Setting up @archive-duck/utils..."

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Please install it first:"
    echo "   npm install -g pnpm"
    exit 1
fi

echo "✅ pnpm found"

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Build
echo "🔨 Building package..."
pnpm run build

# Run tests
echo "🧪 Running tests..."
pnpm test

# Generate coverage
echo "📊 Generating coverage report..."
pnpm run test:coverage

echo ""
echo "✨ Setup complete!"
echo ""
echo "Available commands:"
echo "  pnpm test              - Run tests"
echo "  pnpm run test:coverage - Generate coverage report"
echo "  pnpm run build         - Build TypeScript"
echo "  pnpm run lint          - Check code quality"
echo "  pnpm run format        - Format code"
echo ""
echo "📚 See README.md for more information"
