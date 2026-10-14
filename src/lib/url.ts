/**
 * Prefix a root-relative path with the site's base path. The site is served
 * from a sub-folder on GitHub Pages (/Portfolio), so every link to a file in
 * /public or to the home page goes through this.
 */
export const withBase = (path: string) => `${import.meta.env.BASE_URL.replace(/\/$/, '')}${path}`;
