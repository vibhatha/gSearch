#!/bin/bash

echo "🚀 Setting up GraphStudio with Vite..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if installation was successful
if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully!"
    echo ""
    echo "🎉 Setup complete! You can now run:"
    echo "   npm run dev    # Start development server"
    echo "   npm run build  # Build for production"
    echo "   npm run preview # Preview production build"
    echo ""
    echo "🌐 The app will be available at http://localhost:3000"
else
    echo "❌ Installation failed. Please check the error messages above."
    exit 1
fi
