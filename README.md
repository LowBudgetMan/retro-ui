# Retro UI

A modern web application for facilitating Agile retrospectives, built with React, TypeScript, and Vite.

## Prerequisites

- Node.js 18+
- npm
- Docker (optional, for containerized deployment)

## Running the Application

This application can be run in three main ways:

### Local Development

For active development with hot reloading:

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

The app will be available at `http://localhost:3000`. API URL will default to `http://localhost:8080` (configured in `.env.local`).

To override the API URL:
```bash
VITE_BASE_API_URL=http://your-custom-api:8080 npm run dev
```

### Static File Server

For serving pre-built static files (production-like testing):

```bash
# Build the application
npm run build

# Serve with Vite preview (recommended)
npm run preview
```

Or use any static file server:
```bash
# Install a static server globally (optional)
npm install -g serve

# Serve the dist directory
serve -s dist -l 8080
```

API URL defaults to empty unless overridden at build time:
```bash
VITE_BASE_API_URL=http://your-api:8080 npm run build
```

### Docker Container

For containerized production deployment:

```bash
# Build the Docker image
docker build -t retro-ui .

# Run the container (defaults to empty API URL)
docker run -p 8080:80 retro-ui
```

Access at `http://localhost:8080`. Override API URL per instance:
```bash
docker run -p 8080:80 -e BASE_API_URL=http://your-api:8080 retro-ui
```

### Environment Variables

- **Local Development**: Uses `.env.local` with `VITE_BASE_API_URL=http://localhost:8080`
- **Docker**: Runtime override with `BASE_API_URL` environment variable
- **Production Build**: Set `VITE_BASE_API_URL` at build time or use empty string

The application will automatically connect to the configured API endpoint for authentication and retro data.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default {
  // other rules...
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
}
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list
