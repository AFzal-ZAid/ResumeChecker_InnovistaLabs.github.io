const BASE_URL = import.meta.env.VITE_API_URL ?? '';

export async function customizeResume(jobDescription, resume) {
  const body = new FormData();
  body.append('jobDescription', jobDescription);
  body.append('resume', resume);

  let response;
  try {
    response = await fetch(`${BASE_URL}/api/customize`, { method: 'POST', body });
  } catch {
    throw new Error('Cannot reach the server. Check your connection and try again.');
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message ?? 'The request failed. Please try again.');
  }

  return data;
}
