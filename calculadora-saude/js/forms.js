export function preventDefaultForms() {
    const forms = document.querySelectorAll('form');
    forms.forEach((form) => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
        });
    });
}
export function setSubmitButton(buttonId, functionToCall) {
    document.getElementById(buttonId)?.addEventListener('click', functionToCall);
}
export function showElement(elementId, enable) {
    if (enable) {
        document.getElementById(elementId).classList.remove('is-hidden');
    }
    else {
        document.getElementById(elementId).classList.add('is-hidden');
    }
}
