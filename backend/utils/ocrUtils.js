export function fixSpacedOCRText(text) {

  if (!text) return "";

  return text

    .split('\n')

    .map(line => {

      const trimmed = line.trim();

      if (!trimmed) return line;

      // Fix broken URLs
      let fixed = trimmed
        .replace(/h\s*t\s*t\s*p\s*s?/gi, "https")
        .replace(/w\s*w\s*w/gi, "www");

      // Fix words split into characters
      fixed = fixed.replace(
        /\b(?:[A-Za-z]\s+){2,}[A-Za-z]\b/g,
        match => match.replace(/\s+/g, "")
      );

      // Fix small spaced words
      fixed = fixed.replace(
        /\b([A-Za-z0-9]{1,3})(\s[A-Za-z0-9]{1,3}){1,}\b/g,
        match => match.replace(/\s+/g, "")
      );

      // Remove excessive spaces
      fixed = fixed.replace(/\s{2,}/g, " ");

      return fixed;
    })

    .join('\n')

    .trim();
}