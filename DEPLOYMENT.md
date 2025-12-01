 # Deployment Guide

This guide provides step-by-step instructions to deploy the Airtable-Connected Dynamic Form Builder.

## 1. Backend Deployment (Render / Heroku)

The backend is a Node.js/Express app with MongoDB.

### Option A: Render (Recommended)
1.  **Create a Web Service** on Render connected to your GitHub repository.
2.  **Root Directory**: `server` (Important!)
3.  **Build Command**: `npm install`
4.  **Start Command**: `npm start`
5.  **Environment Variables**:
    *   `MONGO_URI`: Your MongoDB Connection String (e.g., from MongoDB Atlas).
    *   `JWT_SECRET`: A secure random string.
    *   `AIRTABLE_CLIENT_ID`: Your Airtable OAuth Client ID.
    *   `AIRTABLE_CLIENT_SECRET`: Your Airtable OAuth Client Secret.
    *   `AIRTABLE_REDIRECT_URI`: `https://<your-backend-url>/auth/callback` (Update this in Airtable Builder too!)

### Option B: Heroku
1.  Create a new Heroku app.
2.  Set the buildpack to `heroku/nodejs`.
3.  Deploy the repository.
4.  Set the same environment variables as above in "Settings" -> "Config Vars".

## 2. Frontend Deployment (Vercel / Netlify)

The frontend is a React (Vite) app.

### Option A: Vercel (Recommended)
1.  **Import Project** in Vercel.
2.  **Root Directory**: `client` (Important!)
3.  **Framework Preset**: Vite
4.  **Build Command**: `npm run build`
5.  **Output Directory**: `dist`
6.  **Environment Variables**:
    *   `VITE_API_URL`: The URL of your deployed backend (e.g., `https://your-backend-app.onrender.com`). **Do not include a trailing slash.**

### Option B: Netlify
1.  **Import from Git**.
2.  **Base Directory**: `client`
3.  **Build Command**: `npm run build`
4.  **Publish Directory**: `dist`
5.  **Environment Variables**:
    *   `VITE_API_URL`: Your deployed backend URL.

## 3. Final Configuration Steps

1.  **Update Airtable OAuth**: Go to your Airtable Builder -> OAuth Integrations. Update the **Redirect URI** to match your deployed backend URL: `https://<your-backend-url>/auth/callback`.
2.  **Test**: Open your deployed frontend URL. You should be able to log in via Airtable and create forms.
