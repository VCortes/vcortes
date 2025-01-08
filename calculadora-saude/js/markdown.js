const converter = new showdown.Converter({ tables: true, tasklists: true });
export function setMarkdown() {
    const markdownBlocks = document.querySelectorAll('[data-markdown="true"]');
    markdownBlocks.forEach((block) => {
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
}

function markdownToHTML(markdown) {
    const content = markdown.trim();
    const htmlContent = converter.makeHtml(content);
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    doc.querySelectorAll('img').forEach((img) => img.classList.add('markdown-img'));
    doc.querySelectorAll('table').forEach((t) => t.classList.add('markdown-table'));
    const htmlContentAdjusted = doc.body.innerHTML;
    return htmlContentAdjusted;
}
