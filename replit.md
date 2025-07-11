# replit.md

## Overview

This is a modern pharmacy management system built with React, TypeScript, and Express.js. The system provides comprehensive Point of Sale (POS) functionality, inventory management, purchasing, customer management, and reporting capabilities designed specifically for pharmacy operations.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Framework**: Radix UI components with Tailwind CSS
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL via Neon serverless
- **ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: JWT-based authentication with bcrypt for password hashing
- **API Design**: RESTful API with role-based access control

### Database Design
- **Users**: Authentication and role management (admin, pharmacist, cashier)
- **Products**: Drugs with categories, suppliers, and batch tracking
- **Transactions**: Sales and purchase records with detailed line items
- **Inventory**: Real-time stock tracking with expiry date monitoring
- **Customers**: Customer information and purchase history

## Key Components

### Authentication System
- JWT-based authentication with role-based access control
- Three user roles: admin, pharmacist, cashier
- Protected routes based on user permissions
- Secure password hashing with bcrypt

### Point of Sale (POS)
- Real-time drug search and barcode scanning capability
- Shopping cart with quantity management
- Multiple payment methods (cash, card, mobile pay)
- Payment confirmation workflow with customer information
- Professional receipt generation with print functionality
- Tax calculation and totals
- Change calculation for cash payments
- Real-time inventory deduction

### Inventory Management
- Comprehensive drug database with batch tracking
- Expiry date monitoring and alerts
- Low stock threshold warnings
- Category-based organization
- Supplier management integration

### Purchase Management
- Purchase order creation and tracking
- Supplier integration
- Batch number and expiry date recording
- Status tracking (pending, received)
- Cost tracking and markup calculation

### Reporting System
- Sales reports with date range filtering
- Inventory reports with stock levels
- Customer purchase history
- Financial summaries and analytics

## Data Flow

### Authentication Flow
1. User submits credentials via login form
2. Server validates credentials and generates JWT token
3. Token stored in localStorage for subsequent requests
4. All API requests include Authorization header with token
5. Server middleware validates token and user permissions

### Sales Transaction Flow
1. User searches for drugs in POS interface
2. Selected items added to shopping cart with real-time stock validation
3. Quantity and pricing calculated in real-time with tax
4. Payment confirmation modal with customer details and payment method selection
5. Payment processing with validation and change calculation
6. Professional receipt generation with print/download options
7. Inventory automatically updated and transaction logged
8. Success confirmation with receipt display

### Inventory Management Flow
1. New drugs added with category and supplier information
2. Batches created with expiry dates and quantities
3. Stock levels monitored in real-time
4. Alerts generated for low stock and expiring items
5. Reports generated for inventory analysis

## External Dependencies

### Frontend Dependencies
- **@radix-ui/react-***: Comprehensive UI component library
- **@tanstack/react-query**: Server state management
- **tailwindcss**: Utility-first CSS framework
- **wouter**: Minimalist routing library
- **lucide-react**: Icon library
- **clsx**: Utility for constructing className strings

### Backend Dependencies
- **drizzle-orm**: Type-safe PostgreSQL ORM
- **@neondatabase/serverless**: Serverless PostgreSQL driver
- **bcrypt**: Password hashing library
- **jsonwebtoken**: JWT token management
- **express**: Web framework for Node.js

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Type checking and compilation
- **tsx**: TypeScript execution for development
- **esbuild**: JavaScript bundler for production

## Deployment Strategy

### Development Environment
- Vite dev server for frontend with hot module replacement
- Express server running with tsx for TypeScript execution
- PostgreSQL database via Neon serverless connection
- Environment variables for database and JWT configuration

### Production Build
- Frontend built with Vite to static assets
- Backend bundled with esbuild for Node.js execution
- Static assets served from Express server
- Database migrations handled via Drizzle Kit

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string
- **JWT_SECRET**: Secret key for JWT token signing
- **NODE_ENV**: Environment flag for development/production

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- July 08, 2025. Initial setup
- July 08, 2025. Fixed authentication system with JWT token support, created default admin user (admin/admin123), and resolved TypeScript errors in server routes
- July 08, 2025. Added password change functionality with secure API endpoint and user-friendly form interface in settings page
- July 11, 2025. Complete payment confirmation and receipt generation system implemented with multiple payment methods (Cash, Card, Mobile Pay), professional receipt printing, and real-time inventory updates
- July 11, 2025. Implemented role-based navigation and dashboards with different interfaces for admin and cashier users, including role-specific menu items and dashboard layouts
- July 11, 2025. Updated all currency displays from USD to Kenyan Shillings (KSh) throughout the entire system including POS, receipts, dashboards, and payment confirmations