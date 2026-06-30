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
* **Git**

> ⚠️ **CRITICAL REQUIREMENT: PYTHON 3.12 IS STRICTLY REQUIRED.**
> Do **NOT** use bleeding-edge Python versions (like 3.13 or 3.14). Newer versions will cause the installation to fail with fatal C++ and Rust compiler errors when building ML libraries like `torch` and `pydantic-core` because pre-built wheels are not yet available. Please ensure your virtual environment uses Python 3.11 or 3.12.

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

> 🛑 **CRITICAL STEP: DO NOT SKIP** 
> If you skip this step, FastAPI will instantly crash on startup with a `ValidationError` for `JWT_SECRET_KEY`.

The project requires environment variables for secure authentication keys. You **MUST** set this up BEFORE starting the server.

1. Inside the `backend` folder, **copy `.env.example` and rename it to `.env`.**
2. Run `python -c "import secrets; print(secrets.token_hex(32))"` in your terminal to generate a secure key.
3. Paste that key into the `JWT_SECRET_KEY` field in your new `.env` file **BEFORE** starting the server.
4. **Configure SMTP credentials** in the `.env` file for the email OTP verification to work. Set `SMTP_SERVER`, `SMTP_PORT`, `SMTP_USER` and `SMTP_PASSWORD`. *(Note: if using Gmail, you must use an [App Password](https://myaccount.google.com/apppasswords) instead of your regular password).*

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

*(Note: Ensure you enter `http://localhost:3000` into a Web Browser, not your terminal. The backend API runs on `127.0.0.1:8000`, but navigating there in your browser will simply return a "Not Found" message unless you visit the API documentation at `http://127.0.0.1:8000/docs`.)*

---

## 🛠️ Troubleshooting Common Issues

* **`ValidationError for Settings (JWT_SECRET_KEY)`**: You forgot to set up your `.env` file. See Step 3 above.
* **`ModuleNotFoundError: No module named 'models'`**: Ensure that the `models` package exists inside the `backend` directory (it should contain `__init__.py`, `user.py`, and `job.py`). If it's missing, you may need to recreate the database model files.
* **`ModuleNotFoundError: No module named 'filetype'`**: The `filetype` package is required for file validation. Ensure you have run `pip install -r requirements.txt` (which has now been updated to include it).
* **Browser shows `{"detail":"Not Found"}`**: You are trying to visit the backend URL (`http://127.0.0.1:8000`). You need to visit the frontend URL instead: `http://localhost:3000`.

---

## 🔮 Future Roadmap
* **Two-Stage LLM Verification:** Integration of a generative AI API to cross-examine top-ranked resumes for grammatical context, effectively filtering out "Keyword Stuffers."
* **PostgreSQL Migration:** Transitioning from SQLite to a production-ready database schema.
