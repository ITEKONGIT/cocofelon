// parse.js — Parses plain text (Word-style) into structured blog data
// v2 — Cleaner approach: process each section independently

export function parse(rawText) {
  const clean = rawText.replace(/\r\n/g, "\n").trim();
  const lines = clean.split("\n");

  let frontmatter = {};
  let bodyStart = 0;

  if (lines[0]?.trim() === "---") {
    const endIndex = lines.indexOf("---", 1);
    if (endIndex !== -1) {
      const fmLines = lines.slice(1, endIndex);
      fmLines.forEach((line) => {
        const [key, ...rest] = line.split(":");
        if (key && rest.length) {
          frontmatter[key.trim()] = rest.join(":").trim();
        }
      });
      bodyStart = endIndex + 1;
    }
  }

  const bodyLines = lines.slice(bodyStart);
  frontmatter = detectMetadata(frontmatter, bodyLines);

  const parsed = parseBody(bodyLines.join("\n"), frontmatter.title);

  return {
    frontmatter: {
      title: frontmatter.title || "Untitled",
      series: frontmatter.series || null,
      part: frontmatter.part || null,
      difficulty: frontmatter.difficulty || null,
      date: new Date().toISOString().split("T")[0],
      slug: generateSlug(frontmatter.title || "untitled"),
    },
    body: parsed.markdown,
    images: parsed.images,
    hasRedacted: parsed.hasRedacted,
  };
}

function detectMetadata(frontmatter, lines) {
  const fm = { ...frontmatter };
  const fullText = lines.join("\n");

  if (!fm.title) {
    for (const line of lines) {
      const trimmed = line.trim();
      if (
        trimmed.length > 5 && trimmed.length < 120 &&
        !trimmed.match(/^\d{1,2}\s+\w+\s+\d{4}$/) &&
        !trimmed.match(/^\d{1,2}\/\d{1,2}\/\d{2,4}$/) &&
        !trimmed.match(/^\d+\s+min read$/) &&
        !trimmed.match(/^COCOFELON$/i) &&
        !trimmed.match(/^Malware Development$/i) &&
        !trimmed.match(/^⚠️|^🚨|^🔴/) &&
        !trimmed.match(/^Overview$/i) &&
        !trimmed.match(/^Abstract$/i)
      ) {
        fm.title = trimmed.replace(/\s*•\s*COCOFELON\s*$/i, "").replace(/\s*—\s*COCOFELON\s*$/i, "").trim();
        break;
      }
    }
  }

  if (!fm.series) {
    const seriesMatch = fullText.match(/(?:series|project|part of|codename)[:\s]+([^\n]+?)(?:\n|$)/i);
    if (seriesMatch) fm.series = seriesMatch[1].trim();
  }

  if (!fm.part) {
    const partMatch = fullText.match(/(?:part|chapter)\s+(\d+)/i);
    if (partMatch) fm.part = partMatch[1];
  }

  if (!fm.difficulty) {
    const advanced = fullText.match(/advanced|syscall|bypass|evasion|direct|kernel|ring.?0/i);
    const intermediate = fullText.match(/intermediate|moderate|some experience/i);
    const beginner = fullText.match(/beginner|basic|introduction|getting started/i);
    if (advanced && !beginner) fm.difficulty = "Advanced";
    else if (intermediate) fm.difficulty = "Intermediate";
    else if (beginner && !advanced) fm.difficulty = "Beginner";
  }

  return fm;
}

function parseBody(body, title) {
  let markdown = body;
  
  // Remove duplicate title
  const firstLine = markdown.split("\n")[0]?.trim();
  if (firstLine && title && firstLine.toLowerCase() === title.toLowerCase()) {
    markdown = markdown.split("\n").slice(1).join("\n").trim();
  }

  const lines = markdown.split("\n");
  const result = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Empty line
    if (!trimmed) {
      result.push("");
      i++;
      continue;
    }

    // Heading detection
    const heading = detectHeading(trimmed, lines, i);
    if (heading === "h2") {
      result.push(`## ${trimmed.replace(/:$/, "")}`);
      i++;
      continue;
    }
    if (heading === "h3") {
      result.push(`### ${trimmed.replace(/:$/, "")}`);
      i++;
      continue;
    }

    // Code block detection
    if (isCodeBlockStart(trimmed, lines, i)) {
      const codeResult = extractCodeBlock(lines, i);
      result.push(codeResult.markdown);
      i = codeResult.nextIndex;
      continue;
    }

    // Table detection — must run before list detection
    if (isTableRow(trimmed) && isTableBlock(lines, i)) {
      const tableResult = extractTable(lines, i);
      result.push(tableResult.markdown);
      i = tableResult.nextIndex;
      continue;
    }

    // List detection
    if (isListItem(trimmed) && isListBlock(lines, i)) {
      const listResult = extractList(lines, i);
      result.push(listResult.markdown);
      i = listResult.nextIndex;
      continue;
    }

    // Regular paragraph
    result.push(line);
    i++;
  }

  markdown = result.join("\n");

  // Detect redactions
  const redactionResult = detectRedactions(markdown);
  
  // Clean up
  markdown = markdown.replace(/\n{3,}/g, "\n\n").trim();

  return { 
    markdown, 
    images: [],
    hasRedacted: redactionResult.hasRedacted 
  };
}

function detectHeading(line, allLines, index) {
  const h2Patterns = [
    /^Overview$/i, /^Abstract$/i, /^Introduction$/i,
    /^Conclusion$/i, /^Final Thoughts$/i, /^Summary$/i,
    /^Resources$/i, /^References$/i,
    /^Detection Opportunities$/i, /^Defense Effectiveness/i,
    /^The \d+[-\s]?Layer/i, /^Appendix/i,
  ];

  if (h2Patterns.some(p => p.test(line))) return "h2";

  // "Layer X: Something" or "Layer X Something"
  if (line.match(/^Layer\s+\d+[:\-\s]/i) && line.length < 80) return "h3";

  // Short line ending with colon, followed by blank + content
  if (line.endsWith(":") && line.length < 60 && !line.match(/^https?:/) &&
      allLines[index + 1]?.trim() === "" && allLines[index + 2]?.trim()) {
    return "h3";
  }

  // ALL CAPS 3-8 words, no code symbols
  const words = line.split(/\s+/);
  if (line === line.toUpperCase() && words.length >= 3 && words.length <= 8 && !line.match(/[{}().,;=]/)) {
    return "h3";
  }

  return null;
}

function isCodeBlockStart(line, allLines, index) {
  // Already fenced
  if (line.startsWith("```")) return true;

  // Strong code indicators
  if (line.match(/^(#include|import |from |def |function |class |public |private |protected |void |int |char |bool |auto |const |static |FARPROC|HMODULE|HINTERNET|NTSTATUS|std::|PVOID|SIZE_T|uint8_t|HANDLE|DWORD|LPVOID|WINAPI)/)) return true;
  
  if (line.match(/^\{$/)) return true;
  if (line.match(/^\/\//)) return true;
  if (line.match(/^\/\*/)) return true;

  // Indented line that looks like code
  if (line.match(/^(    |\t)/) && line.match(/[{}();]/)) return true;

  return false;
}

function extractCodeBlock(lines, startIndex) {
  // Handle already-fenced blocks
  if (lines[startIndex].trim().startsWith("```")) {
    const endIndex = lines.indexOf("```", startIndex + 1);
    if (endIndex !== -1) {
      return {
        markdown: lines.slice(startIndex, endIndex + 1).join("\n"),
        nextIndex: endIndex + 1,
      };
    }
  }

  // Collect code lines
  const codeLines = [];
  let lang = "";
  let i = startIndex;

  // Try to detect language from preceding context
  const context = lines.slice(Math.max(0, startIndex - 3), startIndex).join(" ");
  if (context.match(/cpp|c\+\+|fARPROC|HMODULE|HINTERNET/i)) lang = "cpp";
  else if (context.match(/python|\.py/i)) lang = "python";
  else if (context.match(/bash|shell|curl/i)) lang = "bash";
  else if (context.match(/javascript|\.js/i)) lang = "javascript";

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Stop conditions
    if (!trimmed && codeLines.length > 0 && i > startIndex + 2) {
      // Empty line after code block — stop
      break;
    }

    if (trimmed && !isCodeLine(trimmed) && codeLines.length >= 2) {
      // Non-code line after we've collected code — stop
      break;
    }

    if (trimmed && isCodeLine(trimmed)) {
      codeLines.push(line);
      i++;
    } else if (trimmed && codeLines.length === 0) {
      // Not actually code
      break;
    } else {
      codeLines.push(line);
      i++;
    }
  }

  if (codeLines.length < 2) {
    // Not enough lines for a code block — return as-is
    return { markdown: codeLines.join("\n"), nextIndex: i };
  }

  return {
    markdown: "```" + lang + "\n" + codeLines.join("\n") + "\n```",
    nextIndex: i,
  };
}

function isCodeLine(line) {
  const trimmed = line.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("Why it works") || trimmed.startsWith("Evasion:")) return false;
  if (trimmed.match(/^[A-Z][a-z]+ [a-z]+/) && !trimmed.match(/[{}().,;=]/)) return false;
  
  return (
    trimmed.match(/^(#include|import |from |def |function |class |public |private |protected |void |int |char |bool |auto |const |static |FARPROC|HMODULE|HINTERNET|NTSTATUS|std::|PVOID|SIZE_T|uint8_t|HANDLE|DWORD|LPVOID|WINAPI)/) ||
    trimmed.match(/^(    |\t)/) ||
    trimmed.match(/[{}();]\s*$/) ||
    trimmed.match(/^return /) ||
    trimmed.match(/^\/\//) ||
    trimmed.match(/^\/\*/) ||
    trimmed.match(/^\{$/) ||
    trimmed.match(/^\}\s*;?\s*$/)
  );
}

function isTableRow(line) {
  // Pipe-separated
  if (line.includes("|") && line.split("|").filter(c => c.trim()).length >= 3) return true;
  
  // Space-separated columns: 3+ groups of text separated by 3+ spaces
  if (line.match(/\S+\s{3,}\S+\s{3,}\S+/)) return true;
  
  return false;
}

function isTableBlock(lines, startIndex) {
  // Need at least 2 consecutive table-looking rows
  let count = 0;
  for (let i = startIndex; i < lines.length && i < startIndex + 10; i++) {
    if (isTableRow(lines[i].trim())) count++;
    else if (lines[i].trim() === "") continue;
    else break;
  }
  return count >= 2;
}

function extractTable(lines, startIndex) {
  const tableLines = [];
  let i = startIndex;

  while (i < lines.length) {
    const trimmed = lines[i].trim();
    if (isTableRow(trimmed)) {
      tableLines.push(trimmed);
      i++;
    } else if (trimmed === "") {
      i++;
      break;
    } else {
      break;
    }
  }

  // Format as markdown table
  const rows = tableLines.map(row => {
    if (row.includes("|")) {
      return row.split("|").map(c => c.trim()).filter(c => c);
    }
    return row.split(/\s{3,}/).map(c => c.trim());
  });

  if (rows.length < 2) {
    return { markdown: tableLines.join("\n"), nextIndex: i };
  }

  const colCount = Math.max(...rows.map(r => r.length));
  const normalized = rows.map(r => {
    while (r.length < colCount) r.push("");
    return r;
  });

  const mdRows = normalized.map(r => "| " + r.join(" | ") + " |");
  const separator = "|" + " --- |".repeat(colCount);

  return {
    markdown: mdRows[0] + "\n" + separator + "\n" + mdRows.slice(1).join("\n"),
    nextIndex: i,
  };
}

function isListItem(line) {
  if (line.match(/^[-*•]\s/)) return true;
  if (line.match(/^\d+[.)]\s/)) return true;
  
  // "Word: rest" pattern — but only if not a table row
  if (line.match(/^\w+[\w\s]*:\s+.+/) && line.length > 10 && line.length < 120 && !line.match(/\s{3,}/)) {
    return true;
  }
  
  return false;
}

function isListBlock(lines, startIndex) {
  let count = 0;
  for (let i = startIndex; i < lines.length && i < startIndex + 10; i++) {
    const trimmed = lines[i].trim();
    if (isListItem(trimmed)) count++;
    else if (trimmed === "") continue;
    else break;
  }
  return count >= 2;
}

function extractList(lines, startIndex) {
  const listLines = [];
  let i = startIndex;

  while (i < lines.length) {
    const trimmed = lines[i].trim();
    if (isListItem(trimmed)) {
      if (trimmed.match(/^[-*•]\s/)) {
        listLines.push("- " + trimmed.replace(/^[-*•]\s*/, ""));
      } else if (trimmed.match(/^\d+[.)]\s/)) {
        listLines.push("1. " + trimmed.replace(/^\d+[.)]\s*/, ""));
      } else {
        listLines.push("- " + trimmed);
      }
      i++;
    } else if (trimmed === "") {
      i++;
      break;
    } else {
      break;
    }
  }

  return {
    markdown: listLines.join("\n"),
    nextIndex: i,
  };
}

function detectRedactions(text) {
  let hasRedacted = false;
  let markdown = text;

  markdown = markdown.replace(/\|\|(.+?)\|\|/g, (_, content) => {
    hasRedacted = true;
    return `<span class="redacted">${content}</span>`;
  });

  const lines = markdown.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (
      !line.startsWith("<span") &&
      !line.startsWith("```") &&
      !line.startsWith("|") &&
      line.match(/(?:redacted|confidential|sensitive|classified|internal use only|do not distribute|⚠️\s*ethical|lab use only)/i)
    ) {
      lines[i] = `<span class="redacted">${line}</span>`;
      hasRedacted = true;
    }
  }

  return { markdown: lines.join("\n"), hasRedacted };
}

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}