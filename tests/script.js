// JavaScript
const draggableButton = document.querySelector('.draggable-button');
let isDragging = false;
let offsetX = 0;
let offsetY = 0;
let initialX;
let initialY;

draggableButton.addEventListener('mousedown', (e) => {
    isDragging = false;
    initialX = e.clientX;
    initialY = e.clientY;
    offsetX = e.clientX - draggableButton.offsetLeft;
    offsetY = e.clientY - draggableButton.offsetTop;

    const onMouseMove = (e) => {
        const dx = e.clientX - initialX;
        const dy = e.clientY - initialY;
        if (!isDragging && Math.sqrt(dx * dx + dy * dy) > 5) {
            isDragging = true;
        }
        if (isDragging) {
            draggableButton.style.left = `${e.clientX - offsetX}px`;
            draggableButton.style.top = `${e.clientY - offsetY}px`;
        }
    };

    const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        if (!isDragging) {
            // Chama o console log ao clicar no botão
            console.log('Botão clicado');
        }
        isDragging = false;
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
});
