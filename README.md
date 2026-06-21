# 🎯 Resume Radar

**Resume Radar** is a modern, AI-powered Applicant Tracking System (ATS) designed to intelligently screen and rank candidates based on semantic meaning rather than simple keyword matching. 

Built with a **Next.js** frontend and a **FastAPI** backend, it utilizes Hugging Face's `sentence-transformers` to compute cosine similarities between job descriptions and uploaded resumes (PDF, DOCX, and Images). 

## ✨ Key Features
* **Semantic NLP Matching:** Uses the `all-MiniLM-L6-v2` embedding model to rank candidates based on contextual project experience, automatically filtering out non-technical applicants.
* **Full-Stack Portals:** Distinct, secure routing for Candidate application flows and Recruiter dashboard views.
* **Privacy-First Processing:** Resumes are parsed entirely in-memory using `BytesIO`, ensuring sensitive personally identifiable information (PII) is not unnecessarily written to disk.
* **Multi-Format Parsing:** Extracts text from PDFs (`PyPDF2`), Word Documents (`python-docx`), and Images via OCR (`pytesseract`).
* **Secure Authentication:** Complete JWT-based authentication flow with bcrypt password hashing and simulated email verification.

## 🛠️ Tech Stack
* **Frontend:** Next.js, React, Node.js
* **Backend:** Python 3.12, FastAPI, Uvicorn, SQLAlchemy, Pydantic
* **Database:** SQLite (Local development)
* **Machine Learning:** Hugging Face Sentence Transformers, Scikit-learn, NLTK

---

## 🚀 Local Installation & Setup

### Prerequisites
* **Node.js** (v18+ recommended)
* **Python 3.12** (Strictly recommended to avoid C++ build errors with ML dependencies)
* **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/kushagravash/Resume-Radar.git
cd Resume-Radar
```

### 2. Backend Setup
The backend requires a secure Python virtual environment to manage its machine learning and API dependencies.

```bash
# Navigate to the backend directory
cd backend

# Create and activate a Python 3.12 virtual environment
python -m venv venv

# On Windows:
.\venv\Scripts\Activate.ps1
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Environment Variables (.env)
The project uses environment variables for secure authentication keys.

1. Inside the `backend` folder, duplicate the `.env.example` file and rename it to `.env`.
2. Generate a secure secret key and paste it into the `JWT_SECRET_KEY` field inside the new `.env` file.

> **Tip:** You can quickly generate a secure key by running `python -c "import secrets; print(secrets.token_hex(32))"` in your terminal.

### 4. Run the Backend Server
```bash
# Ensure your virtual environment is still active
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```
> **Note:** On the very first run, the backend will automatically download the ~80MB Hugging Face embedding model into your local cache.

### 5. Frontend Setup
Open a **new** terminal window (leaving the backend running) and navigate to the frontend directory.

```bash
# Navigate to the frontend directory
cd frontend

# Install Node modules
npm install

# Start the development server
npm run dev
```

### 6. Test the System
Open your browser and navigate to [http://localhost:3000](http://localhost:3000). You can now sign up as a recruiter, create a test job posting, and upload resumes to see the AI ranking engine in action!

---

## 🔮 Future Roadmap
* **Two-Stage LLM Verification:** Integration of a generative AI API to cross-examine top-ranked resumes for grammatical context, effectively filtering out "Keyword Stuffers."
* **PostgreSQL Migration:** Transitioning from SQLite to a production-ready database schema.
