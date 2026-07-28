export function groupDigits(n: number): string[] {
  const digits = Math.max(0, Math.trunc(n)).toString();
  const groups: string[] = [];
  let i = digits.length;
  while (i > 0) {
    const start = Math.max(0, i - 3);
    groups.unshift(digits.slice(start, i));
    i = start;
  }
  return groups;
}
