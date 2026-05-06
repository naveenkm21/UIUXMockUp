# UIUXMockUp

A modern, full-stack UI/UX design and prototyping application built with Next.js and TypeScript, featuring real-time collaboration capabilities and database integration.

## Demo


https://github.com/user-attachments/assets/e48b6fb2-44e4-4279-be53-6e8c6794866f



## 🚀 Tech Stack

### Frontend Framework
- **Next.js** - React framework for production with server-side rendering and static site generation capabilities
- **TypeScript** - Strongly typed programming language that builds on JavaScript
- **React** - JavaScript library for building user interfaces

### Styling
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- **PostCSS** - Tool for transforming CSS with JavaScript plugins

### Database & ORM
- **Drizzle ORM** - TypeScript ORM for SQL databases with type-safe schema definitions
- Database configuration managed through `drizzle.config.ts`

### UI Components
- **shadcn/ui** - Re-usable component library built with Radix UI and Tailwind CSS
- Component configuration managed through `components.json`

### Project Structure
```
UIUXMockUp/
├── app/              # Next.js app directory with routing and pages
├── components/       # Reusable React components
├── config/          # Application configuration files
├── context/         # React Context API providers for state management
├── data/            # Data layer and database queries
├── hooks/           # Custom React hooks
├── lib/             # Utility functions and helpers
├── public/          # Static assets (images, fonts, etc.)
├── type/            # TypeScript type definitions and interfaces
├── proxy.ts         # Proxy configuration for API requests
└── drizzle.config.ts # Database ORM configuration
```

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your system:

- Node.js (version 18.0 or higher recommended)
- npm or yarn package manager
- A database system compatible with Drizzle ORM (PostgreSQL, MySQL, or SQLite)

## 🛠️ Installation

Follow these steps to get your development environment set up:

1. **Clone the repository**
   ```bash
   git clone https://github.com/naveenkm21/UIUXMockUp.git
   cd UIUXMockUp
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory and add your database connection string and other required environment variables:
   ```env
   DATABASE_URL="your_database_connection_string"
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
   CLERK_SECRET_KEY=

   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
   NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/

   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
   NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/


   OPENROUTER_API_KEY=
   ```

4. **Run database migrations**
   ```bash
   npm run db:push
   # or
   npx drizzle-kit push
   ```

## 🚀 Running the Application

### Development Mode

To start the development server with hot-reload:

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`

### Production Build

To create an optimized production build:

```bash
npm run build
npm run start
# or
yarn build
yarn start
```

## 🗂️ Key Directories Explained

### `/app`
Contains the Next.js App Router pages and layouts. This directory structure determines your application's routes and navigation.

### `/components`
Houses all reusable React components, including both custom components and those from shadcn/ui library.

### `/context`
Manages application-wide state using React Context API, providing a way to share data across component trees without prop drilling.

### `/hooks`
Contains custom React hooks for encapsulating and reusing stateful logic across different components.

### `/data`
Handles database operations, queries, and data transformation logic using Drizzle ORM.

### `/type`
Stores TypeScript type definitions and interfaces, ensuring type safety throughout the application.

### `/lib`
Contains utility functions, helper methods, and shared logic used across the application.

## 🔧 Configuration Files

- **`next.config.ts`** - Next.js framework configuration
- **`tsconfig.json`** - TypeScript compiler options
- **`components.json`** - shadcn/ui component library configuration
- **`drizzle.config.ts`** - Database ORM configuration and connection settings
- **`postcss.config.mjs`** - PostCSS configuration for Tailwind CSS
- **`proxy.ts`** - API proxy configuration for handling external requests

## 📦 Scripts

Add these common scripts to your `package.json` for easier development:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  }
}
```

## 🤝 Contributing

Contributions are welcome! If you'd like to contribute to this project:

1. Fork the repository
2. Create a new branch for your feature (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is available under the MIT License unless otherwise specified.

## 👤 Author

**Naveen KM**
- GitHub: [@naveenkm21](https://github.com/naveenkm21)

## 🙏 Acknowledgments

This project leverages several excellent open-source technologies and libraries:

- Next.js team for the amazing React framework
- Vercel for hosting and deployment capabilities
- shadcn for the beautiful component library
- Drizzle team for the type-safe ORM
- The open-source community for continuous inspiration and support

---

For questions, issues, or feature requests, please open an issue on the GitHub repository.
