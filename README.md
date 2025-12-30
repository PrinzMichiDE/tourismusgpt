# Next.js Enterprise Starter

A modern, secure, and high-performance Next.js application.

## Features

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS & shadcn/ui
- **Database**: SQLite with Prisma ORM
- **Validation**: Zod
- **Dark Mode**: next-themes

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Initialize database:
   ```bash
   npx prisma db push
   ```

3. Run development server:
   ```bash
   npm run dev
   ```

## Project Structure

- `src/app`: App Router pages and layouts
- `src/components`: React components
- `src/lib`: Utilities and libraries configuration
- `prisma`: Database schema

## Features

### Task Management
Visit `/tasks` to manage your tasks. Features include:
- Create, Read, Update, Delete (CRUD)
- Real-time updates with Server Actions
- Form validation
- Optimistic UI
