# Airtable-Connected Dynamic Form Builder

A full-stack MERN application that allows users to create dynamic forms based on their Airtable bases, apply conditional logic, and sync responses back to Airtable and MongoDB.

## Features

- **Airtable OAuth**: Secure login with Airtable account.
- **Form Builder**: Select Base and Table, choose fields, and configure form settings.
- **Conditional Logic**: Show/hide questions based on previous answers (AND/OR logic).
- **Form Viewer**: Public-facing form to collect responses.
- **Real-time Sync**: Webhooks ensure MongoDB stays in sync with Airtable changes.
- **Response Management**: View collected responses in the dashboard.

## Tech Stack

- **Frontend**: React (Vite), React Router
- **Backend**: Node.js, Express, MongoDB
- **Database**: MongoDB (Data & Auth), Airtable (Source of Truth for Schema)

## Setup Instructions

### Prerequisites

- Node.js (v14+)
- MongoDB (Local or Atlas)
- Airtable Account

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Airtable-Connected-Dynamic-Form-Builder
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/airtable-form-builder
JWT_SECRET=your_super_secret_jwt_key
AIRTABLE_CLIENT_ID=your_airtable_client_id
AIRTABLE_CLIENT_SECRET=your_airtable_client_secret
AIRTABLE_REDIRECT_URI=http://localhost:5000/auth/callback
```

Start the server:

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd client
npm install
```

Start the development server:

```bash
npm run dev
```

Access the app at `http://localhost:5173`.

## Airtable OAuth Setup

1. Go to [Airtable Builder](https://airtable.com/create/oauth).
2. Create a new OAuth integration.
3. Set the **Redirect URI** to `http://localhost:5000/auth/callback`.
4. Add the following scopes:
   - `data.records:read`
   - `data.records:write`
   - `schema.bases:read`
   - `webhook:manage`
5. Copy the `Client ID` and `Client Secret` to your `.env` file.

## Webhook Configuration

To enable real-time sync:
1. The application automatically registers webhooks when needed (logic implemented in backend).
2. Ensure your backend is accessible publicly (e.g., using ngrok) if testing webhooks locally.
3. Update the webhook endpoint in Airtable if manually configuring (though the app handles this programmatically).

## Data Model

- **User**: Stores Airtable ID, Access Token, and Refresh Token.
- **Form**: Stores the form schema (Fields, Logic, Airtable Base/Table IDs).
- **Response**: Stores the submission data and links to the Airtable Record ID.

## Conditional Logic

The logic engine (`client/src/utils/logicEngine.js`) evaluates rules defined in the Form Builder.
- Supports `equals`, `notEquals`, and `contains` operators.
- Rules can be combined with `AND` or `OR`.
- Logic is applied in real-time on the frontend and can be validated on the backend.

## Screenshots

*(Add screenshots of Login, Form Builder, and Response List here)*

