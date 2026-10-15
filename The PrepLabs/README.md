# Resume Customizer

Paste a job description, upload your resume (PDF or DOCX), and Gemini rewrites the resume for that role. You get a match score, an ATS score, keyword suggestions, and a PDF or TXT download.

## Tech stack

- Frontend: React 18, Vite, jsPDF, plain CSS (single dark theme)
- Backend: Java 17, Spring Boot 3.3, Apache PDFBox (PDF parsing), Apache POI (DOCX parsing)
- LLM: Google Gemini API, model `gemini-2.5-flash` (configurable with `GEMINI_MODEL`)

## Features

- Job description input with validation (required, 100 to 10,000 characters)
- PDF and DOCX upload with file name and size shown, 5 MB limit
- Gemini rewrites the summary, orders matching skills first, rephrases and reorders bullets, and suggests missing keywords
- Bonus: original match score, customized match score, and ATS score
- Download as PDF or plain text, or copy the text
- Error handling for invalid file types, large or empty files, scanned PDFs, short inputs, and Gemini failures (rate limit, timeout, bad response), with retries on temporary errors

## Architecture

```
React (Vite)  --multipart POST /api/customize-->  Spring Boot
                                                   |- ResumeController     validates input
                                                   |- ResumeParserService  PDFBox / POI text extraction
                                                   |- PromptFactory        system prompt + JSON shape
                                                   |- GeminiService        calls Gemini, retries, parses JSON
                                                   '- GlobalExceptionHandler  clean error messages
                                                              |
                                                              v
                                                       Gemini API
```

The backend asks Gemini for structured JSON (`responseMimeType: application/json`), so the UI and downloads are built from clean fields instead of free text.

## Run locally

Requirements: Java 17+, Maven 3.9+, Node 18+, and a Gemini API key from https://aistudio.google.com/apikey

Backend:

```bash
cd backend
export GEMINI_API_KEY=your_key
mvn spring-boot:run
```

On Windows PowerShell use `$env:GEMINI_API_KEY="your_key"`.

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. The dev server proxies `/api` to `http://localhost:8080`.

## Deploy

Backend on Render (Docker):

1. Create a new Web Service from the repo, root directory `backend`, runtime Docker.
2. Set environment variables: `GEMINI_API_KEY`, `CORS_ALLOWED_ORIGINS` (your Vercel URL, no trailing slash).

Frontend on Vercel:

1. Import the repo, root directory `frontend`, framework Vite.
2. Set `VITE_API_URL` to your Render backend URL, then deploy.

## Known limitations

- Scanned or image-only resumes are not supported because there is no OCR.
- Only the first 15,000 characters of a resume are sent to Gemini.
- Layout and styling of the original resume are not preserved; the output uses one clean template.
- Match and ATS scores are model estimates, not exact measurements.
- Render's free tier sleeps when idle, so the first request can be slow.
