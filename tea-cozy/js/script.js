// Função para adicionar a regra CSS
function drawBorders() {
    var elements = document.querySelectorAll('*');
    for (var i = 0; i < elements.length; i++) {
        elements[i].style.border = '1px solid rgb(207, 32, 32)';
    }
}
// Função para remover a regra CSS
function removeBorders() {
    var elements = document.querySelectorAll('*');
    for (var i = 0; i < elements.length; i++) {
        elements[i].style.border = 'none';
    }
}
// Evento de pressionar a tecla Control
document.addEventListener('keydown', function (event) {
    if (event.ctrlKey) {
        drawBorders();
    }
});
// Evento de soltar a tecla Control
document.addEventListener('keyup', function (event) {
    if (!event.ctrlKey) {
        removeBorders();
    }
});
