# Netflix Clone with MongoDB Atlas Vector Search

This project is a Netflix-style movie recommendation app using MongoDB Atlas Vector Search.

## Project Structure

- `backend/`: Node.js Express server connected to MongoDB.
- `frontend/`: React + Vite + Tailwind CSS frontend.

## Prerequisites

1.  **Node.js**: Installed on your machine.
2.  **MongoDB Atlas Account**: You need a cluster with the `sample_mflix` dataset loaded.
    - If you don't have it, load the "Sample Dataset" from the Atlas dashboard.

## Setup Instructions

### 1. Database Setup (MongoDB Atlas)

1.  **Create a Vector Search Index**:
    - Go to your Atlas Cluster -> **Atlas Search** -> **Create Search Index**.
    - Select **JSON Editor**.
    - Select the `sample_mflix` database and `embedded_movies` collection.
    - Name the index: `mflix_vectorindex`.
    - Paste the following configuration (Adjust `numDimensions` if your embeddings are different, e.g., 1536 for OpenAI):

    ```json
    {
      "fields": [
        {
          "numDimensions": 1536,
          "path": "plot_embedding",
          "similarity": "cosine",
          "type": "vector"
        }
      ]
    }
    ```

    *Note: Check the length of your `plot_embedding` array in your database to confirm `numDimensions`. It is often 1536.*

2.  **Connection String**:
    - Get your connection string from Atlas (Connect -> Drivers -> Node.js).
    - Update `backend/.env` with your actual connection string.
    - Replace `<password>` with your database user password.

### 2. Backend Setup

```bash
cd backend
npm install
npm start
```

The server will run on `http://localhost:5000`.

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:5173`.

## Features

- **Home Page**: Displays rows of movies by genre.
- **Banner**: Featured movie.
- **Movie Details**: Click on any movie to see details.
- **Recommendations**: The "More Like This" section in the modal uses **Vector Search** to find movies with similar plots.

## Demo Login

For demonstration purposes, you can log in with the username `Cersei Lannister` and `Bran Stark` to see personalized recommendations based on browsing history.
