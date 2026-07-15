export async function parse(rawContent) {
    let frontmatter = { title: "Untitled", slug: "untitled" };
    
    // Split the content into lines and process each
    const lines = rawContent.split(/\r?\n/);
    let bodyLines = [];
    let inBody = false;

    lines.forEach(line => {
        // Match lines like "# TITLE: My Title"
        const match = line.match(/^#\s*([A-Za-z]+):\s*(.+)$/i);
        if (match) {
            frontmatter[match[1].toLowerCase()] = match[2].trim();
        } else if (line.trim() !== '') {
            bodyLines.push(line);
        }
    });

    const body = bodyLines.join('\n').trim();

    // Fallback Slug Generation
    if (frontmatter.title !== "Untitled" && frontmatter.slug === "untitled") {
        frontmatter.slug = frontmatter.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    // Extract images
    const imageRegex = /\[image:\s*(.+?)\]/g;
    let images = [];
    let match;
    while ((match = imageRegex.exec(body)) !== null) {
        images.push(match[1].trim());
    }

    return { frontmatter, body, images };
}
