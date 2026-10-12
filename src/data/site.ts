// Single source for personal details. Values marked PLACEHOLDER must be
// replaced with real ones before the site is shared.
export const site = {
  name: 'Arnav Srinath',
  disciplines: ['Product', 'UX', 'HMI'],
  // PLACEHOLDER: real contact details
  email: 'hello@example.com',
  linkedin: 'https://www.linkedin.com/',
  resume: '#', // PLACEHOLDER: /resume.pdf once added to /public
  // PLACEHOLDER: city label. Time zone was read from this Mac; confirm it.
  city: 'Your city',
  timeZone: 'Asia/Kolkata',
  sheet: {
    number: 'A-000',
    title: 'Portfolio',
    rev: '01',
    date: '2026-10-12',
    scale: '1:1',
  },
} as const;
