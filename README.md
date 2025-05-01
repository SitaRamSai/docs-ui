# Getting Started with Docsville UI Setup

This is a modern web application built using React, TypeScript, Vite, and Tailwind CSS.

## Features

- ⚡ **Vite** for fast development and optimized builds
- 📜 **TypeScript** for type safety and maintainability
- 🎨 **Tailwind CSS** for utility-first styling
- ⚛ **React** for a component-based UI

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (Latest LTS recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

## Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/yourusername/your-repo.git
   cd your-repo
   ```

2. Install dependencies:

   ```sh
   npm install
   # or
   yarn install
   ```

3. Start the development server:

   ```sh
   npm run dev
   # or
   yarn dev
   ```

   The app will be available at `http://localhost:5173/`.

## Project Structure

```
📂 Docsville-ui/
├── 📂 node_modules/
├── 📂 src/        # Source files
│   ├── 📂 components/  # Reusable components
│   ├── 📂 store/       # Store State Management
│   ├── 📂 assets/      # Static assets
│   ├── 📜 main.tsx     # Entry point
│   ├── 📜 App.tsx      # Root component
│   ├── 📜 App.css      # Root component css
│   ├── 📜 utlis.ts     # Utlis
├── 📜 index.html  # Main HTML file
├── 📜 package.json  # Dependencies & scripts
├── 📜 tailwind.config.js  # Tailwind CSS configuration
├── 📜 tsconfig.json  # TypeScript configuration
└── 📜 vite.config.ts  # Vite configuration
```

## Tailwind CSS Setup

Tailwind is already configured in the project. If you need to customize it, modify `tailwind.config.js`.

## Build for Production

To generate an optimized build:

```sh
npm run build
# or
yarn build
```

The production-ready files will be in the `dist/` folder.

## Linting and Formatting

To check and fix linting issues:

```sh
npm run lint
# or
yarn lint
```

To format the code:

```sh
npm run format
# or
yarn format
```

## Deployment

You can deploy the `dist/` folder using any static hosting service like S3 bucket, Vercel, Netlify, or GitHub Pages.
# docs-ui
