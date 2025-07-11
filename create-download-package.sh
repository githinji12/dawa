#!/bin/bash

# Create a downloadable package of PharmaCare POS
echo "Creating PharmaCare POS download package..."

# Create a temporary directory for the package
mkdir -p /tmp/pharmacare-pos-download

# Copy all necessary files excluding unnecessary ones
rsync -av --exclude='node_modules' \
          --exclude='.git' \
          --exclude='.replit' \
          --exclude='replit.nix' \
          --exclude='.env' \
          --exclude='*.log' \
          --exclude='.DS_Store' \
          --exclude='pharmacare-pos-template.tar.gz' \
          . /tmp/pharmacare-pos-download/

# Create the archive
cd /tmp
tar -czf pharmacare-pos-complete.tar.gz pharmacare-pos-download/

# Move back to original directory
cd - > /dev/null

# Move the archive to the current directory
mv /tmp/pharmacare-pos-complete.tar.gz ./

echo "✅ Download package created: pharmacare-pos-complete.tar.gz"
echo "📁 Package size: $(du -h pharmacare-pos-complete.tar.gz | cut -f1)"

# Cleanup
rm -rf /tmp/pharmacare-pos-download

echo ""
echo "📋 Package Contents:"
echo "✅ Complete React + TypeScript frontend"
echo "✅ Express + PostgreSQL backend"
echo "✅ All configuration files"
echo "✅ Database schema and types"
echo "✅ Setup instructions (README.md, VS_CODE_SETUP.md)"
echo "✅ Environment template (.env.example)"
echo ""
echo "🎉 Ready for VS Code development!"