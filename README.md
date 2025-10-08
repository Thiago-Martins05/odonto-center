# Odonto Center - Deploy Ready

A comprehensive dental clinic management system with online appointment scheduling and administrative dashboard.

[![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.15.0-2D3748?style=flat-square&logo=prisma)](https://prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

## Table of Contents

- [About](#about)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## About

**Odonto Center** is a modern, comprehensive web application designed for dental clinic management. Built with Next.js 15, it provides a seamless experience for both patients and administrators, featuring online appointment scheduling, complete administrative dashboard, and automated email notifications.

### Project Status

✅ **Production Ready** - The project has been cleaned and optimized for production deployment. All unnecessary development files, debug scripts, and test files have been removed, leaving only essential components for a clean, maintainable codebase.

### Key Features

- **Modern Interface**: Responsive and intuitive design with Tailwind CSS
- **Online Scheduling**: Complete appointment booking system
- **Administrative Dashboard**: Full management of appointments, services, and reports
- **Secure Authentication**: Login system with NextAuth.js
- **Email Notifications**: Automated confirmation emails
- **Detailed Reports**: PDF report generation

## Features

### For Patients
- **Online Scheduling**: View available time slots and book appointments
- **Service Catalog**: Detailed view of available treatments
- **Email Confirmation**: Automatic confirmation emails
- **Responsive Interface**: Optimized access on mobile devices

### For Administrators
- **Complete Dashboard**: Overview of appointments and statistics
- **Appointment Management**: View, edit, and cancel appointments
- **Service Management**: Create and edit treatments
- **Schedule Configuration**: Define availability and rules
- **Detailed Reports**: Performance and billing analysis
- **Contact Messages**: Manage contact forms
- **Notifications**: Alert system for new appointments

## Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Static typing
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible components
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Lucide React** - Modern icons

### Backend
- **Next.js API Routes** - Integrated API
- **Prisma** - ORM and database management
- **SQLite** - Database (development)
- **NextAuth.js** - Authentication
- **bcryptjs** - Password hashing

### Integrations
- **Resend** - Email service
- **Date-fns** - Date manipulation
- **React Query** - Data caching and synchronization

## Prerequisites

- **Node.js** 18.17 or higher
- **npm** 9.0 or higher
- **Git** for repository cloning

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/seu-usuario/odonto-center.git
   cd odonto-center
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp env.example .env.local
   ```

4. **Set up the database**
   ```bash
   npm run db:push
   ```

5. **Seed the database with initial data**
   ```bash
   npm run db:seed
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

## Configuration

### Environment Variables

Create a `.env.local` file in the project root:

```bash
# Database
DATABASE_URL="file:./prisma/dev.db"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Email (Optional - for notifications)
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

### Email Configuration

To enable email notifications:

1. Create an account at [Resend](https://resend.com)
2. Obtain your API key
3. Add the `RESEND_API_KEY` variable to `.env.local`

### Administrator User

The system automatically creates an admin user during seeding:

- **Email**: `admin@odontocenter.com`
- **Password**: `admin123`

⚠️ **Important**: Change the default password in production!

## Usage

### Available Scripts

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Generate production build
npm run start        # Start production server

# Database
npm run db:push      # Apply schema changes
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed database with initial data

# Code Quality
npm run lint         # Run ESLint

# Production Utilities (scripts/)
node scripts/check-current-state.js     # Check system status
node scripts/check-production-rules.js  # Verify production rules
node scripts/fix-production.js          # Fix production issues
node scripts/setup-production.js        # Initial production setup
```

### Initial Setup

1. **Access the administrative panel**: `/admin`
2. **Login** with default credentials
3. **Configure available services**
4. **Set operating hours**
5. **Customize clinic information**

## Project Structure

```
odonto-center/
├── prisma/                 # Database schema and migrations
│   ├── schema.prisma      # Database definition
│   ├── seed.ts           # Initial data
│   ├── dev.db            # SQLite database (development)
│   └── migrations/       # Database migrations
├── public/               # Static files
│   ├── odonto1.png       # Clinic logo
│   └── odonto1hero.png   # Hero image
├── scripts/              # Production utilities
│   ├── check-current-state.js
│   ├── check-production-rules.js
│   ├── fix-production.js
│   └── setup-production.js
├── src/
│   ├── app/              # App Router (Next.js 15)
│   │   ├── admin/        # Administrative panel
│   │   ├── api/          # API Routes
│   │   ├── agenda/       # Appointment page
│   │   ├── servicos/     # Service catalog
│   │   └── contato/      # Contact form
│   ├── components/       # React components
│   │   ├── admin/        # Dashboard components
│   │   ├── auth/         # Authentication components
│   │   ├── ui/           # Base components (shadcn/ui)
│   │   └── ...           # Other components
│   ├── lib/              # Utilities and configurations
│   ├── server/           # Server logic
│   └── types/            # TypeScript definitions
├── package.json          # Dependencies and scripts
├── tailwind.config.ts    # Tailwind configuration
├── tsconfig.json         # TypeScript configuration
├── vercel.json          # Vercel deployment config
└── README.md            # This file
```

## API Endpoints

### Public
- `GET /api/availability/slots` - Available time slots
- `POST /api/contact` - Send contact message
- `GET /api/admin/reports/public` - Public reports

### Administrative (Authenticated)
- `GET /api/admin/appointments` - List appointments
- `POST /api/admin/appointments` - Create appointment
- `PUT /api/admin/appointments/[id]` - Update appointment
- `DELETE /api/admin/appointments/[id]` - Cancel appointment
- `GET /api/admin/services` - List services
- `POST /api/admin/services` - Create service
- `PUT /api/admin/services/[id]` - Update service
- `GET /api/admin/reports` - Administrative reports
- `GET /api/admin/reports/export` - Export reports to PDF

### Authentication
- `POST /api/auth/signin` - Login
- `POST /api/auth/signout` - Logout
- `GET /api/auth/session` - Current session

## Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Configure environment variables**:
   - `DATABASE_URL` (use PostgreSQL for production)
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
   - `RESEND_API_KEY` (optional)

3. **Automatic deployment** on every push to main branch

### Other Platforms

The project is compatible with any platform that supports Next.js:
- **Netlify**
- **Railway**
- **DigitalOcean App Platform**
- **AWS Amplify**

### Production Database

For production, it's recommended to use PostgreSQL:

```bash
# Example DATABASE_URL for PostgreSQL
DATABASE_URL="postgresql://user:password@host:5432/odonto_center"
```

## Contributing

Contributions are welcome! To contribute:

1. **Fork** the project
2. **Create a branch** for your feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

### Code Standards

- Use **TypeScript** for typing
- Follow the configured **ESLint** conventions
- Write **functional components** with hooks
- Use **Tailwind CSS** for styling
- Keep **components small** and reusable

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## Additional Documentation

- 🚀 **[Quick Setup Guide](SETUP.md)** - Set up in 5 minutes
- 🤝 **[Contributing Guide](CONTRIBUTING.md)** - How to contribute to the project
- 📝 **[Changelog](CHANGELOG.md)** - Change history

## Support

For support and questions:

- 📧 **Email**: thiagoroyal05@icloud.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/Thiago-Martins05/odonto-center)
- 📖 **Documentation**: [Project Wiki](https://github.com/seu-usuario/odonto-center/wiki)

---

- **LinkedIn:** [Thiago Martins](https://www.linkedin.com/in/thiago-martins-5556512b6)
- **Portfólio:** [ainda vou incluir]
- **Github:** [Thiago-Martins05](https://github.com/Thiago-Martins05)

<div align="center">
  <p>Developed by Thiago Martins with dedication for dental clinics</p>
  <p>⭐ If this project helped you, consider giving it a star!</p>
</div>
