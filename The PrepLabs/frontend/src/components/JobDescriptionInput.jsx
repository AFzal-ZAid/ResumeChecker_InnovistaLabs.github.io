export default function JobDescriptionInput({ value, onChange, minLength, disabled }) {
  const length = value.trim().length;
  const ready = length >= minLength;

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>Job description</h2>
        <span className={`counter ${ready ? 'ok' : ''}`}>
          {length} / {minLength} min
        </span>
      </div>
      <textarea
        className="textarea"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Paste the full job description here, including responsibilities and requirements."
        disabled={disabled}
        rows={12}
      />
    </section>
  );
}
