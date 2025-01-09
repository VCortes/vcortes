const converter = new showdown.Converter({ tables: true, tasklists: true });
export function setMarkdown() {
    const markdownBlocks = document.querySelectorAll('[data-markdown="true"]');

    Array.from(markdownBlocks)
        .filter(
            (block) =>
                !block.hasAttribute('data-file-content') ||
                block.getAttribute('data-file-content') === 'true'
        )
        .forEach((block) => {
            const id = block.id;
            if (id) {
                fetch(`/data/${id}.md`)
                    .then((response) => response.text())
                    .then((markdown) => markdownToHTML(markdown))
                    .then((html) => {
                        block.innerHTML = html;
                    })
                    .catch((err) => console.error(err));
            }
        });

    Array.from(markdownBlocks)
        .filter(
            (block) =>
                block.hasAttribute('data-file-content') &&
                block.getAttribute('data-file-content') === 'false'
        )
        .forEach((block) => {
            const markdown = block.innerHTML;
            block.innerHTML = markdownToHTML(markdown);
        });
}

export function markdownToHTML(markdown) {
    const content = markdown.trim();
    const htmlContent = converter.makeHtml(content);
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    doc.querySelectorAll('img').forEach((img) => img.classList.add('markdown-img'));
    doc.querySelectorAll('table').forEach((t) => t.classList.add('markdown-table'));
    return doc.body.innerHTML;
}
