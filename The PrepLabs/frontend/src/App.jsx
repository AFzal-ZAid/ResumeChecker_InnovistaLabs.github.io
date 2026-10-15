import { useEffect, useRef, useState } from 'react';
import JobDescriptionInput from './components/JobDescriptionInput';
import ResumeUpload from './components/ResumeUpload';
import ResultView from './components/ResultView';
import { customizeResume } from './api';

const MIN_JD_LENGTH = 100;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ['pdf', 'docx'];

function checkFile(file) {
  const extension = file.name.split('.').pop().toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(extension)) return 'Only PDF and DOCX files are supported.';
  if (file.size === 0) return 'This file is empty. Choose a different resume.';
  if (file.size > MAX_FILE_SIZE) return 'This file is larger than 5 MB. Choose a smaller resume.';
  return '';
}

export default function App() {
  const [jobDescription, setJobDescription] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const resultRef = useRef(null);

  useEffect(() => {
    if (result) resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [result]);

  const handleSelect = (selected) => {
    const problem = checkFile(selected);
    if (problem) {
      setFile(null);
      setError(problem);
      return;
    }
    setError('');
    setFile(selected);
  };

  const handleSubmit = async () => {
    if (jobDescription.trim().length < MIN_JD_LENGTH) {
      setError(`The job description needs at least ${MIN_JD_LENGTH} characters.`);
      return;
    }
    if (!file) {
      setError('Upload your resume to continue.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      setResult(await customizeResume(jobDescription.trim(), file));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true" />
          <span className="brand-name">Resume Customizer</span>
        </div>
        <span className="powered">Powered by Gemini</span>
      </header>

      <main className="main">
        <section className="hero">
          <h1>Tailor your resume to any job in seconds</h1>
          <p>Paste a job description, upload your resume, and get a version written for that role, with match and ATS scores.</p>
        </section>

        <div className="inputs">
          <JobDescriptionInput value={jobDescription} onChange={setJobDescription} minLength={MIN_JD_LENGTH} disabled={loading} />
          <ResumeUpload file={file} onSelect={handleSelect} onRemove={() => setFile(null)} disabled={loading} />
        </div>

        {error && (
          <div className="error" role="alert">
            {error}
          </div>
        )}

        <div className="submit-row">
          <button type="button" className="primary-button" onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <span className="spinner" aria-hidden="true" />
                Customizing your resume
              </>
            ) : (
              'Customize resume'
            )}
          </button>
          {loading && <p className="hint">This usually takes 10 to 30 seconds.</p>}
        </div>

        <div ref={resultRef}>{result && <ResultView resume={result} />}</div>
      </main>

      <footer className="footer">Your files are processed in memory and are not stored.</footer>
    </div>
  );
}
