export function dateToString(date: Date) {
  const isoStr = date.toISOString();
  const d = isoStr.split('T')[0]
  const t = isoStr.split('T')[1].split('.')[0];

  return `${d} ${t}`;
}
