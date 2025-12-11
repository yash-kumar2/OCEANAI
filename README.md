

# AI Document Authoring Platform (OceanAI)

A full-stack AI-powered application that helps users generate, refine, and export professional documents (Word Reports and PowerPoint Presentations). Built with **React** (Vite + Tailwind) on the frontend and **Flask** (Python) on the backend, utilizing **Google's Gemini AI** for content generation.

## 🚀 Features

  * **User Authentication**: Secure Login and Registration system using JWT.
  * **Project Management**: Create and manage multiple document projects via a dashboard.
  * **AI Content Generation**:
      * **Automated Outlining**: Generates structure/outlines for Reports or Presentations.
      * **Section Expansion**: Writes detailed paragraphs or slide bullet points based on context.
  * **Smart Editor**:
      * **Refinement**: AI-powered rewriting tools to adjust tone or length.
      * **Feedback & Notes**: "Like/Dislike" feedback system and commenting for collaboration.
  * **Export**: Download finished projects as formatted `.docx` or `.pptx` files.

-----

## 🛠️ Tech Stack

### **Frontend**

  * **Framework**: React 19 (via Vite)
  * **Styling**: Tailwind CSS v4
  * **Icons**: Lucide React
  * **State Management**: React Hooks

### **Backend**

  * **Framework**: Flask (Python)
  * **AI Model**: Google Gemini (via `google-generativeai`)
  * **Database**: MongoDB (via `pymongo`)
  * **Document Processing**: `python-docx` (Word), `python-pptx` (PowerPoint)
  * **Authentication**: `flask-jwt-extended`, `flask-bcrypt`

-----

## 📋 Prerequisites

Ensure you have the following installed:

1.  **Node.js** (v18+) & **npm**
2.  **Python** (v3.9+)
3.  **MongoDB** (Local instance or Atlas connection string)
4.  **Google Gemini API Key** (Get it from [Google AI Studio](https://aistudio.google.com/))

-----

## ⚙️ Installation & Setup

### 1\. Clone the Repository

```bash
git clone <repository-url>
cd oceanai
```

### 2\. Backend Setup

Navigate to the backend directory, set up the virtual environment, and install dependencies.

```bash
cd Backend

# Create a virtual environment (optional but recommended)
python -m venv .venv

# Activate the virtual environment
# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3\. Frontend Setup

Navigate to the frontend directory and install Node modules.

```bash
cd ../Frontend/oceanClient

npm install
```

-----

## Env Environment Variables

You need to configure the backend environment variables.

1.  Create a file named `.env` inside the `Backend/` folder.
2.  Add the following variables:

<!-- end list -->

```ini
# Database Connection
MONGO_URI=mongodb://localhost:27017/ai_authoring_platform

# Security (Change this to a random secure string)
JWT_SECRET_KEY=your_super_secret_jwt_key

# AI Provider
GEMINI_API_KEY=your_google_gemini_api_key
```

*Note: The frontend currently points to `https://oceanai-2fuc.onrender.com` by default. If you change the backend port, update `Frontend/oceanClient/src/api.js`.*

-----

## ▶️ Running the Application

You will need to run the backend and frontend in separate terminal windows.

### Start the Backend

```bash
# Inside Backend/ directory (ensure venv is active)
python backend.py
```

*The server will start at `https://oceanai-2fuc.onrender.com`.*

### Start the Frontend

```bash
# Inside Frontend/oceanClient/ directory
npm run dev
```

*Vite will typically start the app at `http://localhost:5173`.*

-----

## 📖 Usage Guide

1.  **Register/Login**: Open the frontend URL. Create a new account.
2.  **Create Project**:
      * Click **"New Project"**.
      * Select **Type** (Word Report or PowerPoint).
      * Enter a **Topic** (e.g., "The Future of Renewable Energy").
      * Click **"Generate Outline"**.
3.  **Editor**:
      * The AI will generate section titles. Click a section in the sidebar to generate its content.
      * **Refine**: Use the input box at the bottom to ask the AI to rewrite specific parts (e.g., "Make it more professional").
      * **Comments**: Add notes or feedback on the right sidebar.
4.  **Export**: Click the **Export** button in the top right header to download your file.

-----

## 📦 Deployment (Brief)

### Frontend

Build the static files for production:

```bash
npm run build
```

Serve the `dist` folder using a static file server (Nginx, Vercel, Netlify).

### Backend

For production, use a WSGI server like **Gunicorn** instead of the development server:

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 backend:app
```
