import { useState } from 'react';
import ScoreRing from './ScoreRing';
import { toBlocks } from '../utils/resumeBlocks';
import { downloadPdf, downloadText, toPlainText } from '../utils/download';

function Chips({ items, empty }) {
  if (!items?.length) return <p className="hint">{empty}</p>;
  return (
    <div className="chips">
      {items.map((item) => (
        <span className="chip" key={item}>{item}</span>
      ))}
    </div>
  );
}

function Preview({ resume }) {
  return (
    <article className="paper">
      {toBlocks(resume).map(({ type, text }, index) => {
        switch (type) {
          case 'title':
            return <h3 className="p-title" key={index}>{text}</h3>;
          case 'heading':
            return <h4 className="p-heading" key={index}>{text}</h4>;
          case 'subheading':
            return <p className="p-sub" key={index}>{text}</p>;
          case 'meta':
            return <p className="p-meta" key={index}>{text}</p>;
          case 'bullet':
            return <p className="p-bullet" key={index}>{text}</p>;
          default:
            return <p className="p-text" key={index}>{text}</p>;
        }
      })}
    </article>
  );
}

export default function ResultView({ resume }) {
  const [tab, setTab] = useState('resume');
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(toPlainText(resume));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const gain = Math.max(0, (resume.customizedMatchScore ?? 0) - (resume.originalMatchScore ?? 0));

  return (
    <section className="result">
      <div className="scores">
        <ScoreRing label="Original match" value={resume.originalMatchScore} />
        <ScoreRing label="Customized match" value={resume.customizedMatchScore} featured />
        <ScoreRing label="ATS score" value={resume.atsScore} />
        <p className="gain">
          {gain > 0 ? `Your match improved by ${gain} points for this role.` : 'Your resume was already a close match for this role.'}
        </p>
      </div>

      <div className="toolbar">
        <div className="tabs" role="tablist">
          <button role="tab" aria-selected={tab === 'resume'} className={tab === 'resume' ? 'tab active' : 'tab'} onClick={() => setTab('resume')}>
            Customized resume
          </button>
          <button role="tab" aria-selected={tab === 'insights'} className={tab === 'insights' ? 'tab active' : 'tab'} onClick={() => setTab('insights')}>
            Insights
          </button>
        </div>
        <div className="actions">
          <button type="button" className="secondary-button" onClick={copy}>{copied ? 'Copied' : 'Copy text'}</button>
          <button type="button" className="secondary-button" onClick={() => downloadText(resume)}>Download TXT</button>
          <button type="button" className="primary-button small" onClick={() => downloadPdf(resume)}>Download PDF</button>
        </div>
      </div>

      {tab === 'resume' ? (
        <Preview resume={resume} />
      ) : (
        <div className="insights">
          <div className="insight">
            <h3>What changed</h3>
            {resume.improvements?.length ? (
              <ul className="list">
                {resume.improvements.map((item) => <li key={item}>{item}</li>)}
              </ul>
            ) : (
              <p className="hint">No changes were reported.</p>
            )}
          </div>
          <div className="insight">
            <h3>Skills that match this role</h3>
            <Chips items={resume.highlightedSkills} empty="No matching skills were found." />
          </div>
          <div className="insight">
            <h3>Keywords to consider adding</h3>
            <p className="hint">Add these only if they reflect your real experience.</p>
            <Chips items={resume.missingKeywords} empty="Your resume covers the main keywords." />
          </div>
        </div>
      )}
    </section>
  );
}
