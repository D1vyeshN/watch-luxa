// MongoDB ObjectId: 24 hex chars. Route params arrive as strings, so a broken
// link yields the literal "undefined" — validate before using it as an id.
const OBJECT_ID = /^[a-f\d]{24}$/i;

export const isObjectId = (value: unknown): value is string =>
  typeof value === 'string' && OBJECT_ID.test(value);
