import { useRef, useState } from 'react';
import { formatSize } from '../utils/format';

export default function ResumeUpload({ file, onSelect, onRemove, disabled }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const pick = (selected) => {
    if (selected) onSelect(selected);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    if (!disabled) pick(event.dataTransfer.files[0]);
  };

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>Resume</h2>
        <span className="hint">PDF or DOCX, up to 5 MB</span>
      </div>

      {file ? (
        <div className="file-card">
          <div className="file-icon">{file.name.split('.').pop().toUpperCase()}</div>
          <div className="file-info">
            <p className="file-name" title={file.name}>{file.name}</p>
            <p className="file-size">{formatSize(file.size)}</p>
          </div>
          <button type="button" className="link-button" onClick={onRemove} disabled={disabled}>
            Remove
          </button>
        </div>
      ) : (
        <div
          className={`dropzone ${dragging ? 'dragging' : ''}`}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <p className="drop-title">Drop your resume here</p>
          <p className="hint">or</p>
          <button type="button" className="secondary-button" onClick={() => inputRef.current?.click()} disabled={disabled}>
            Choose a file
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        hidden
        onChange={(event) => pick(event.target.files[0])}
      />
    </section>
  );
}
