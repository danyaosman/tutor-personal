export const gradeLevels = Array.from({ length: 12 }, (_, index) => {
  const grade = String(index + 1);
  return {
    value: grade,
    label: `Grade ${grade}`,
  };
});
