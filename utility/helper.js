function parseTags(input) {
  if (typeof input !== "string") return [];

  return input
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}
export { parseTags };
