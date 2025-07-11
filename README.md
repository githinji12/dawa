# PharmaCare POS System

A comprehensive Point of Sale system for pharmacy management built with React, TypeScript, and Express.js.

## Features

- **Authentication**: JWT-based login with role-based access (admin/admin123)
- **Dashboard**: Real-time sales statistics and inventory alerts
- **Sales (POS)**: Complete point-of-sale interface with receipt generation
- **Inventory**: Drug and batch management with expiry tracking
- **Categories**: 10 pre-configured pharmacy categories
- **Purchases**: Purchase order management with supplier tracking
- **Customers**: Customer database and purchase history
- **Suppliers**: Supplier management system
- **Reports**: Sales and inventory reporting
- **Settings**: System configuration and user management

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Radix UI
- **Backend**: Express.js, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT tokens with bcrypt
- **Build**: Vite for development and production

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   Create `.env` file:
   ```
   DATABASE_URL=your_postgresql_url
   JWT_SECRET=your_jwt_secret_key
   ```

3. **Database Setup**
   ```bash
   npm run db:push
   ```

4. **Start Development**
   ```bash
   npm run dev
   ```

5. **Login**
   - Username: `admin`
   - Password: `admin123`

## Project Structure

```
├── client/               # React frontend
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── pages/        # Application pages
│   │   ├── hooks/        # Custom hooks
│   │   └── lib/          # Utilities
├── server/               # Express backend
│   ├── db.ts            # Database connection
│   ├── routes.ts        # API routes
│   └── storage.ts       # Data access layer
├── shared/              # Shared types and schemas
└── package.json         # Dependencies and scripts
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run db:push` - Push schema changes to database
- `npm run db:generate` - Generate migration files

## Default Data

The system includes:
- Default admin user (admin/admin123)
- 10 pharmacy categories (Antibiotics, Pain Relief, etc.)
- System settings with reasonable defaults

## Database Schema

Complete PostgreSQL schema with tables for:
- Users and authentication
- Drug categories and inventory
- Sales transactions and items
- Purchase orders and tracking
- Customer and supplier management
- System settings and configuration

## Production Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Set production environment variables
3. Run database migrations
4. Start the server:
   ```bash
   npm start
   ```

## License

This project is ready for commercial use in pharmacy environments.