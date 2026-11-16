// Single source for personal details. Values marked PLACEHOLDER must be
// replaced with real ones before the site is shared.
export const site = {
  name: 'Arnav Srinath',
  disciplines: ['Product', 'UX', 'HMI'],
  email: '116.arnavsrinath@gmail.com',
  linkedin: 'https://www.linkedin.com/in/arnav-srinath-219631349',
  // the résumé: every Résumé link opens this PDF in a new tab (public/cv/)
  resume: '/cv/Arnav_Srinath_CV.pdf',
  // where I'm based; the clock's time zone covers both (IST)
  city: 'Pune / Goa',
  timeZone: 'Asia/Kolkata',
  sheet: {
    number: 'A-000',
    title: 'Portfolio',
    rev: '01',
    date: '2026-10-12',
    scale: '1:1',
  },
} as const;
