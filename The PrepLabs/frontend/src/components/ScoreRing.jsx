import { clampScore } from '../utils/format';

const RADIUS = 34;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function ScoreRing({ label, value, featured = false }) {
  const score = clampScore(value);
  const offset = CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE;

  return (
    <div className={`score ${featured ? 'featured' : ''}`}>
      <svg viewBox="0 0 80 80" className="score-ring" role="img" aria-label={`${label}: ${score} percent`}>
        <circle cx="40" cy="40" r={RADIUS} className="ring-track" />
        <circle
          cx="40"
          cy="40"
          r={RADIUS}
          className="ring-value"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          transform="rotate(-90 40 40)"
        />
        <text x="40" y="45" textAnchor="middle" className="ring-text">{score}</text>
      </svg>
      <p className="score-label">{label}</p>
    </div>
  );
}
