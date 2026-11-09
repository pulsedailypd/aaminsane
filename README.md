# AAM INSANE

Premium music label website and admin starter.

## Features
- Cinematic responsive public website.
- Public release and artist catalogue.
- Audio preview and external listening links.
- Admin dashboard at /admin.html.
- Admin can add/delete releases and artists.
- Admin can review demo submissions and update status.
- Rejection asks the admin for a reason, emails it to the artist, and records the reason.
- Admin can switch public demo submissions ON/OFF.
- Server-side Firebase Admin SDK; Firestore client access denied by rules.

## Stack
- Static HTML/CSS/JavaScript frontend.
- Vercel Node.js serverless API routes.
- Firebase Admin SDK + Cloud Firestore.

## Deploy to Vercel
1. Import https://github.com/pulsedailypd/aaminsane into Vercel.
2. Set the root directory to the repository root.
3. Framework preset: Other.
4. No build command; output directory can remain blank.
5. Add the environment variables below, then deploy.

## Firebase setup
1. Create a Firebase project at https://console.firebase.google.com/.
2. Create a Cloud Firestore database (production mode).
3. In Firestore Rules, publish the contents of firestore.rules.
4. In Project settings > Service accounts, generate a private key for a service account.
5. In Vercel Project Settings > Environment Variables, add FIREBASE_SERVICE_ACCOUNT with the complete service-account JSON as one valid JSON value. Preserve private_key newlines as escaped \\n sequences.
6. Add ADMIN_PASSWORD (at least 12 characters) and SESSION_SECRET (at least 32 random characters). Use unique secrets and never commit real values.
7. Redeploy after adding or changing environment variables.

## Admin
Open /admin.html after deployment and sign in with ADMIN_PASSWORD. The dashboard is not usable until Firebase and Vercel environment variables are configured.

## Demo submissions
Submissions are OFF until the admin switches them ON. Public submissions store artist name, email, supplied music URL, optional message, status and timestamp in Firestore. This starter does not upload audio files; artists submit a link they control. Add spam/rate limiting and a privacy policy before promoting the form publicly.

## Security notes
- Never commit service-account JSON, admin password, or session secret.
- Firestore client rules deny all direct client reads/writes; server APIs use Firebase Admin.
- Use HTTPS in production and restrict Vercel project access.
- The initial admin login uses one shared environment password. For a multi-admin label team, replace it with Firebase Authentication/custom claims or another identity provider.
