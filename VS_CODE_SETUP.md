# VS Code Setup Guide for PharmaCare POS

## Step-by-Step Download & Setup

### 1. Download from Replit
1. In your Replit project, click the **three dots menu (⋮)** at the top
2. Select **"Download as ZIP"**
3. Save the file to your computer (e.g., `pharmacare-pos.zip`)

### 2. Extract and Open in VS Code
1. Extract the ZIP file to a folder (e.g., `C:\Projects\PharmaCare-POS`)
2. Open VS Code
3. Click **File > Open Folder**
4. Select the extracted folder

### 3. Install Required Extensions (Recommended)
Install these VS Code extensions for better development experience:
- **ES7+ React/Redux/React-Native snippets**
- **TypeScript Importer**
- **Tailwind CSS IntelliSense**
- **Auto Rename Tag**
- **Prettier - Code formatter**
- **ESLint**

### 4. Set Up Environment Variables
1. In VS Code, create a new file called `.env` in the root folder
2. Copy content from `.env.example`:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/pharmacy_db
   JWT_SECRET=your_very_secure_jwt_secret_key_here
   NODE_ENV=development
   ```

### 5. Database Setup Options

#### Option A: Use PostgreSQL Locally
1. Install PostgreSQL on your computer
2. Create a new database called `pharmacy_db`
3. Update the `DATABASE_URL` in `.env` with your local credentials
4. Run: `npm run db:push`

#### Option B: Use Online PostgreSQL (Recommended)
1. Sign up for a free PostgreSQL service like:
   - **Supabase** (easiest): https://supabase.com
   - **Neon** (serverless): https://neon.tech
   - **Railway**: https://railway.app
2. Create a new PostgreSQL database
3. Copy the connection string to your `.env` file
4. Run: `npm run db:push`

### 6. Install Dependencies and Start
1. Open VS Code terminal (**View > Terminal**)
2. Run these commands:
   ```bash
   npm install
   npm run db:push
   npm run dev
   ```

### 7. Access Your Application
1. Open your browser and go to: `http://localhost:5000`
2. Login with:
   - Username: `admin`
   - Password: `admin123`

## Important Files to Know

### Configuration Files
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `vite.config.ts` - Build configuration
- `tailwind.config.ts` - Styling configuration
- `drizzle.config.ts` - Database configuration

### Main Application Files
- `client/src/App.tsx` - Main React app
- `server/index.ts` - Express server
- `shared/schema.ts` - Database schema
- `server/routes.ts` - API endpoints

### Key Folders
- `client/src/pages/` - All application pages
- `client/src/components/` - Reusable UI components
- `server/` - Backend API code
- `shared/` - Code shared between frontend and backend

## Development Workflow

### Making Changes
1. Edit files in VS Code
2. Save changes (Ctrl+S)
3. Browser will automatically refresh (hot reload)
4. Check terminal for any errors

### Adding New Features
1. Database changes: Edit `shared/schema.ts` then run `npm run db:push`
2. API changes: Edit `server/routes.ts` and `server/storage.ts`
3. UI changes: Edit files in `client/src/`

### Common Commands
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Update database schema
npm run db:push

# Check for TypeScript errors
npm run type-check
```

## Troubleshooting

### Common Issues:
1. **Database connection error**: Check your `DATABASE_URL` in `.env`
2. **Port 5000 already in use**: Change port in `server/index.ts`
3. **Module not found**: Run `npm install` again
4. **TypeScript errors**: Check your `tsconfig.json`

### Getting Help:
- Check the browser console for errors (F12)
- Check the VS Code terminal for server errors
- Ensure all dependencies are installed: `npm install`

## Production Deployment

When ready to deploy:
1. Run `npm run build`
2. Deploy to platforms like:
   - **Vercel** (Frontend + API routes)
   - **Netlify** (Frontend only)
   - **Railway** (Full-stack)
   - **DigitalOcean** (VPS)

Your PharmaCare POS system is now ready for local development in VS Code!