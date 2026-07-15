export async function parse(rawContent) {
    let frontmatter = { title: "Untitled", slug: "untitled" };
    let body = rawContent;
    let images = [];

    // 1. Extract Frontmatter
    if (rawContent.trim().startsWith('---')) {
        // Split by the '---' blocks
        const parts = rawContent.split('---');
        if (parts.length >= 3) {
            const fmBlock = parts[1];
            body = parts.slice(2).join('---').trim();

            // Parse the key: value pairs
            fmBlock.split('\n').forEach(line => {
                const match = line.match(/^(\w+):\s*(.+)$/);
                if (match) {
                    let key = match[1].trim();
                    let val = match[2].trim();
                    // Strip quotes if you used them
                    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
                    if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
                    frontmatter[key] = val;
                }
            });
        }
    }

    // 2. Fallback Slug Generation
    if (frontmatter.title !== "Untitled" && frontmatter.slug === "untitled") {
        frontmatter.slug = frontmatter.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    // 3. Extract Image References (matches your [image: filename.png] syntax)
    const imageRegex = /\[image:\s*(.+?)\]/g;
    let match;
    while ((match = imageRegex.exec(body)) !== null) {
        images.push(match[1].trim());
    }

    return { frontmatter, body, images };
}
