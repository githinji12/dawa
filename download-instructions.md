# PharmaCare POS - VS Code Setup Guide

## Step 1: Download from Replit

1. **From Replit Console:**
   - Open the Shell/Console in your Replit
   - Run: `git init` (if not already a git repo)
   - Run: `git add .`
   - Run: `git commit -m "Complete PharmaCare POS System"`
   - Go to the "Version Control" tab in Replit
   - Click "Download as ZIP"

2. **Direct Download:**
   - Click the three dots menu (⋮) in your Replit
   - Select "Download as ZIP"
   - This will download your entire project

## Method 2: Git Clone (For Version Control)

1. **Create a GitHub Repository:**
   - Go to GitHub and create a new repository
   - Copy the repository URL

2. **Push to GitHub from Replit:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - PharmaCare POS System"
   git branch -M main
   git remote add origin YOUR_GITHUB_URL
   git push -u origin main
   ```

3. **Clone Anywhere:**
   ```bash
   git clone YOUR_GITHUB_URL
   ```

## Method 3: Manual File Copy

If you need specific files, here are the key directories and files:

### Essential Files:
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `vite.config.ts` - Build configuration
- `tailwind.config.ts` - Styling configuration
- `drizzle.config.ts` - Database configuration

### Source Code:
- `client/` - Frontend React application
- `server/` - Backend Express server
- `shared/` - Shared types and schemas
- `components.json` - UI component configuration

### Database:
- `shared/schema.ts` - Complete database schema
- Note: Database data is in PostgreSQL (use export tools for data)

## Project Structure Overview

```
PharmaCare-POS/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── forms/
│   │   │   ├── inventory/
│   │   │   ├── layout/
│   │   │   └── ui/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   └── index.html
├── server/
│   ├── db.ts
│   ├── index.ts
│   ├── routes.ts
│   ├── storage.ts
│   └── vite.ts
├── shared/
│   └── schema.ts
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── drizzle.config.ts
├── postcss.config.js
├── components.json
└── replit.md
```

## Database Export (Optional)

To export your database data:

```bash
# Export all data
pg_dump $DATABASE_URL > pharmacy_backup.sql

# Or export specific tables
pg_dump $DATABASE_URL -t users -t categories -t drugs > pharmacy_data.sql
```

## Deployment Package

Your complete project includes:
- ✅ Full-stack pharmacy POS system
- ✅ React + TypeScript frontend
- ✅ Express + PostgreSQL backend
- ✅ Complete authentication system
- ✅ Inventory management with categories
- ✅ Sales processing and reports
- ✅ User management and settings
- ✅ Responsive UI with modern design
- ✅ Production-ready configuration

## Next Steps After Download

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Set Environment Variables:**
   ```bash
   DATABASE_URL=your_postgres_url
   JWT_SECRET=your_jwt_secret
   ```

3. **Run Development:**
   ```bash
   npm run dev
   ```

4. **Build for Production:**
   ```bash
   npm run build
   ```

## Support

- Login credentials: admin / admin123
- Database: Pre-configured with 10 pharmacy categories
- All features are fully functional and tested