# ConnectIn - Professional Networking Platform

A LinkedIn clone with robust authentication, real-time messaging, notifications, and professional networking features.

## Tech Stack

- **Frontend**: React, TailwindCSS, shadcn/ui, React Query
- **Backend**: Express.js, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: Passport.js with local strategy
- **Real-time Communication**: WebSockets

## Features

- User authentication (sign up, login, logout)
- Profile management (personal details, experiences, education)
- News feed with posts
- Real-time messaging
- Real-time notifications
- Network connections
- Post engagement (likes, comments)

## Development

### Prerequisites

- Node.js (v16+)
- PostgreSQL database

### Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/linkedup
   SESSION_SECRET=your_session_secret_here
   ```
4. Generate Prisma client:
   ```
   npx prisma generate
   ```
5. Start the development server:
   ```
   npm run dev
   ```

The application will be accessible at http://localhost:5000.

## Production Deployment with Docker

### Prerequisites

- Docker
- Docker Compose

### Setup

1. Create a `.env` file for production:
   ```
   NODE_ENV=production
   DATABASE_URL=postgresql://postgres:postgres@db:5432/linkedup
   SESSION_SECRET=your_secure_session_secret_here
   ```

2. Build and run with Docker Compose:
   ```
   docker-compose up -d
   ```

The application will be accessible at http://localhost:5000.

## Database Schema

The application uses Prisma with the following main models:
- User
- Post
- Comment
- Connection
- Message
- Notification
- Experience
- Education
- PostLike
