/**
 * util function for getting timestamptz
 * @param date UTC Date in ISO 8601 format
 * @returns
 */
export const getTimestampTz = (date: Date): Date => {
  const newDate = new Date(
    date.getTime() - date.getTimezoneOffset() * 60 * 1000
  );
  return newDate;
};
