/** Escape user input for use inside a RegExp / Mongo `$regex` (e.g. "G.M.T."). */
export const escapeRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
