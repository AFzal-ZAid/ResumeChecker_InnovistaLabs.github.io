import { jsPDF } from 'jspdf';
import { toBlocks } from './resumeBlocks';

function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function fileBase(resume) {
  const name = (resume.name || 'resume').trim().replace(/[^a-z0-9]+/gi, '_').toLowerCase();
  return `${name}_customized`;
}

export function toPlainText(resume) {
  return toBlocks(resume)
    .map(({ type, text }) => {
      switch (type) {
        case 'title':
          return `${text.toUpperCase()}\n`;
        case 'heading':
          return `\n${text.toUpperCase()}\n${'-'.repeat(text.length)}`;
        case 'subheading':
          return `\n${text}`;
        case 'bullet':
          return `  - ${text}`;
        default:
          return text;
      }
    })
    .join('\n');
}

export function downloadText(resume) {
  saveBlob(new Blob([toPlainText(resume)], { type: 'text/plain;charset=utf-8' }), `${fileBase(resume)}.txt`);
}

export function downloadPdf(resume) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const margin = 48;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageBottom = doc.internal.pageSize.getHeight() - margin;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const write = (text, { size = 10.5, bold = false, gap = 4, indent = 0, gray = 30 } = {}) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(size);
    doc.setTextColor(gray);
    doc.splitTextToSize(text, contentWidth - indent).forEach((line) => {
      if (y > pageBottom) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin + indent, y);
      y += size * 1.4;
    });
    y += gap;
  };

  toBlocks(resume).forEach(({ type, text }) => {
    switch (type) {
      case 'title':
        write(text, { size: 22, bold: true, gap: 2, gray: 10 });
        break;
      case 'heading':
        y += 8;
        write(text.toUpperCase(), { size: 11, bold: true, gap: 0, gray: 10 });
        doc.setDrawColor(160);
        doc.line(margin, y - 8, pageWidth - margin, y - 8);
        y += 2;
        break;
      case 'subheading':
        write(text, { size: 11, bold: true, gap: 1, gray: 20 });
        break;
      case 'meta':
        write(text, { size: 9.5, gap: 3, gray: 100 });
        break;
      case 'bullet':
        write(`\u2022 ${text}`, { indent: 10, gap: 2 });
        break;
      default:
        write(text);
    }
  });

  doc.save(`${fileBase(resume)}.pdf`);
}
