export function toBlocks(resume) {
  const blocks = [{ type: 'title', text: resume.name || 'Resume' }];

  if (resume.contact?.length) {
    blocks.push({ type: 'meta', text: resume.contact.join('  |  ') });
  }

  if (resume.summary) {
    blocks.push({ type: 'heading', text: 'Summary' }, { type: 'text', text: resume.summary });
  }

  if (resume.skills?.length) {
    blocks.push({ type: 'heading', text: 'Skills' }, { type: 'text', text: resume.skills.join(', ') });
  }

  if (resume.experience?.length) {
    blocks.push({ type: 'heading', text: 'Experience' });
    resume.experience.forEach((job) => {
      blocks.push({ type: 'subheading', text: [job.title, job.company].filter(Boolean).join(' - ') });
      if (job.duration) blocks.push({ type: 'meta', text: job.duration });
      job.bullets?.forEach((bullet) => blocks.push({ type: 'bullet', text: bullet }));
    });
  }

  if (resume.projects?.length) {
    blocks.push({ type: 'heading', text: 'Projects' });
    resume.projects.forEach((project) => {
      blocks.push({ type: 'subheading', text: project.name });
      if (project.tech) blocks.push({ type: 'meta', text: project.tech });
      project.bullets?.forEach((bullet) => blocks.push({ type: 'bullet', text: bullet }));
    });
  }

  if (resume.education?.length) {
    blocks.push({ type: 'heading', text: 'Education' });
    resume.education.forEach((item) => {
      blocks.push({ type: 'subheading', text: [item.degree, item.institution].filter(Boolean).join(' - ') });
      if (item.duration) blocks.push({ type: 'meta', text: item.duration });
    });
  }

  return blocks;
}
