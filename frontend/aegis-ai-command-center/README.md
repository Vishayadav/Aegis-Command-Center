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

1. **Dynamic front‑end simulation** is the default behaviour: the app
   generates fresh, pseudo‑random ML/LLM telemetry every few seconds and
   responds to the four toggles in the sidebar (ML Drift, Hallucination,
   High Token Cost, Safety Incident).  This gives the appearance of a
   production observability dashboard at all times without any network calls.
   The logic lives in `src/lib/metricsGenerator.ts` and is invoked from
   `Index.tsx`.
2. **(Optional)** Deploy the Python backend only if you want a server‑side
   analogue or wish to extend the risk engine.  It can run on a VPS, Heroku,
   Railway, or as a serverless function.  Make sure CORS is enabled (FastAPI
   already allows `*`).  Note the base URL (e.g. `https://api.example.com`).
3. **Deploy the frontend** to Vercel (or any static-host provider) using the
   normal build command (`npm run build`).
4. If you also host the backend, set `VITE_API_BASE_URL` in the deployment
   environment so the frontend can talk to it.  Otherwise the flag is ignored,
   since the app never makes HTTP requests unless you explicitly re-enable
   them.

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
