#!/bin/bash

# Railway Backend Setup Script
# Run this in Railway terminal

echo "🚀 Starting Railway Backend Setup..."

# Step 1: Generate Prisma Client
echo "📦 Generating Prisma Client..."
npx prisma generate

# Step 2: Push Database Schema
echo "🗄️ Pushing database schema..."
npx prisma db push --accept-data-loss

# Step 3: Seed Consumer Data
echo "🌱 Seeding consumer data..."
npx ts-node src/seed-consumer.ts

# Step 4: Verify Setup
echo "✅ Setup complete! Testing connection..."
echo "Backend should be ready at: https://big-pos-backend-production.up.railway.app"

echo "🎉 Railway backend setup complete!"
echo ""
echo "Test login with:"
echo "Phone: 250788100001"
echo "Password: 1234"
