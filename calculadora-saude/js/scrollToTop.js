export function scrollToTop(elementId) {
    const element = document.getElementById(elementId);
    element.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    });

}