# AAM INSANE

AAM INSANE independent music label website.

## Current starter

- Responsive dark/cinematic landing page
- Releases and artist roster sections
- Demo submission UI prototype
- Static HTML/CSS/JavaScript; no build step required

## Run locally

Open index.html in a browser, or serve this folder with VS Code Live Server.

## Important before accepting demos

The current demo form is intentionally frontend-only. It does not transmit, store, or email submissions. Before enabling real submissions, connect:

1. A backend endpoint or serverless function.
2. Database storage for demo metadata.
3. Private file/link handling and spam protection.
4. Admin authentication and role checks.
5. A server-side setting to enable/disable submissions.
6. Email notifications and a privacy/retention policy.

Never put admin passwords, service-role keys, or private API secrets in frontend JavaScript.

## Planned admin features

- Manage releases, artists, cover art, preview audio and streaming links.
- Review demo submissions and update their status.
- Toggle demo submissions ON/OFF from authenticated admin settings.

## Deployment

This is a static site and can be deployed on Vercel, Netlify, or GitHub Pages. For Vercel, import pulsedailypd/aaminsane and keep the project root at / with no build command and output directory .
