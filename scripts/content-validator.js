// scripts/content-validator.js
const fs = require('fs');
const path = require('path');

const incomingDir = path.join(__dirname, '../incoming');
const blogDir = path.join(__dirname, '../src/content/blog');

fs.readdirSync(incomingDir).forEach(file => {
    if (file.endsWith('.md')) {
        const content = fs.readFileSync(path.join(incomingDir, file), 'utf8');
        // Simple check: does the file have a Title header?
        if (content.includes('title:')) {
            fs.renameSync(path.join(incomingDir, file), path.join(blogDir, file));
            console.log(`[+] Published: ${file}`);
        } else {
            console.log(`[-] Skipping ${file}: Missing title frontmatter.`);
        }
    }
});