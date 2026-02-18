# Welcome to Aegis AI

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID  
(when deploying you will need to configure the backend URL via an environment variable)

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Frontend and backend must both be deployed; they communicate over the network.

1. **(Optional)** The frontend is capable of running entirely on its own
   with hardcoded telemetry; no backend is required.  This is useful for
   quick demos or when deploying to Vercel without an API.  See
   `src/pages/Index.tsx` (static `STATIC_` constants).
2. **Deploy the Python backend** somewhere reachable only if you want live
   simulation or want to reuse the risk engine.
   It can be hosted on a VPS, Heroku, Railway, or as a serverless function.
   Make sure CORS is enabled (FastAPI already allows `*`).  Note the base URL
   (for example `https://api.example.com`).
3. **Deploy the frontend** to Vercel (or any static-host provider) using the
   normal build command (`npm run build`).
4. In the frontend deployment settings set an environment variable
   `VITE_API_BASE_URL` to the backend’s base URL if you are using the backend.
   Vercel will automatically inject it into the build.

On localhost the app defaults to `http://localhost:8000`, so you can run both
servers locally and they will talk to one another.

If you don’t supply `VITE_API_BASE_URL` the frontend will continue to point at
`localhost:8000`, which is why the production build showed empty telemetry.

To update the title, logo, and other branding edit `index.html` and the
`components/dashboard` files as needed.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
