// Configurações para a execução do script
const settings = {
    enableFloatingButtons: true,
    enableZoomAndPan: false,
    enableBrowserControls: false,
};
/* -------------------------------------------------------------------------- */
/*                  Remover aviso de plataforma não suportada                 */
/* -------------------------------------------------------------------------- */
// Remove os elementos da página que exibem a mensagem de WebGL não suportado em dispositivos móveis
const textToRemove = 'WebGL builds are not supported on mobile devices.';
const textToClick =
    'Please note that Unity WebGL is not currently supported on mobiles. Press OK if you wish to continue anyway.';
function removeWarningElements() {
    const divs = document.querySelectorAll('div');
    divs.forEach((div) => {
        if (div.textContent === textToRemove || div.textContent === textToClick) {
            console.log(div);
            div.remove();
        }
    });
    const warningElements = document.querySelectorAll('#unity-warning');
    warningElements.forEach((element) => {
        console.log(element);
        element.remove();
    });
}
// Executar a função a cada 0.1 segundos durante 2 segundos
const interval = 100; // 0.1 segundos
const duration = 2000; // 2 segundos
const endTime = Date.now() + duration;
const intervalId = setInterval(() => {
    if (Date.now() >= endTime) {
        clearInterval(intervalId);
    } else {
        removeWarningElements();
    }
}, interval);
/* -------------------------------------------------------------------------- */
/*      Corrige erro de teclado com builds que tenha o webGLCopyAndPaste      */
/* -------------------------------------------------------------------------- */
// A biblioteca webGLCopyAndPaste que é usada em algumas builds webgl faz o uso do teclado
// resultar em erro, pois há uma chamada a event.key.toLowerCase() que dispara um erro
// quando event.key é undefined. O event.key é undefined quando se usa createInputField()
// O script abaixo corrige esse erro criando uma função toLowerCase() para event.key e
// sebrescreve os eventos
(function (origAddEventListener) {
    window.addEventListener = function (name, fn, options) {
        if (name === 'keypress') {
            const wrappedFn = function (event) {
                // Apenas define event.key se estiver ausente
                if (typeof event.key === 'undefined' || event.key === null) {
                    event.key = {
                        toLowerCase: function () {
                            return true;
                        },
                    };
                }
                return fn.call(this, event);
            };
            return origAddEventListener.call(this, name, wrappedFn, options);
        } else {
            return origAddEventListener.call(this, name, fn, options);
        }
    };
})(window.addEventListener);
/* -------------------------------------------------------------------------- */
/*                   Envio de mensagens para a Unity (JSON)                   */
/* -------------------------------------------------------------------------- */
// Envia uma mensagem codificada para a Unity
function sendMessageToUnity(content) {
    // Converte o objeto JSON em uma string
    const jsonString = JSON.stringify(content);
    // Transforma a string em uma URL válida
    const encodedContent = encodeURIComponent(jsonString);
    // Divide a string em porções de 2000 caracteres (limite seguro para URL)
    const chunkSize = 2000;
    const chunks = [];
    for (let i = 0; i < encodedContent.length; i += chunkSize) {
        chunks.push(encodedContent.substring(i, i + chunkSize));
    }
    // Envia cada porção como uma mensagem
    chunks.forEach((chunk, index) => {
        const url = `uniwebview://decoded-message?chunk=${chunk}&index=${index}&total=${chunks.length}`;
        window.location.href = url;
    });
}
/* -------------------------------------------------------------------------- */
/*                 Remover todos os elementos, exceto o canvas                */
/* -------------------------------------------------------------------------- */
function hasCanvasElement() {
    // Busca por elementos canvas na página
    let canvasElements = document.getElementsByTagName('canvas');
    // Verifica se a coleção de elementos canvas tem algum item
    return canvasElements.length > 0;
}
function removeAllExceptCanvas() {
    const body = document.body;
    const canvases = body.getElementsByTagName('canvas');
    // Verifica se há exatamente um elemento canvas na página
    if (canvases.length !== 1) {
        console.log('A página deve conter exatamente um elemento canvas.');
        return;
    }
    const canvas = canvases[0];
    // Obtém todos os elementos da página e verifica se algum tem textContent === textToClick
    const elements = body.getElementsByTagName('*');
    for (let i = 0; i < elements.length; i++) {
        if (elements[i].textContent === textToClick) {
            // Obtém o descendente button e simula um clique
            const button = elements[i].parentElement.getElementsByTagName('button')[0];
            button.click();
        }
    }
    // Remove todos os elementos do body, exceto o canvas
    while (body.firstChild) {
        if (body.firstChild !== canvas) {
            body.removeChild(body.firstChild);
        } else {
            body.firstChild = body.firstChild.nextSibling;
        }
    }
    // Cria um div para conter o canvas com id 'container'
    const container = document.createElement('div');
    container.id = 'container';
    // Adiciona o canvas ao div
    container.appendChild(canvas);
    // Adiciona o div ao body
    body.appendChild(container);
    // Estiliza o canvas para ocupar a tela inteira
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
}
/* -------------------------------------------------------------------------- */
/*                             Botões de controle                             */
/* -------------------------------------------------------------------------- */
// - Fechar
// - Minimizar
// - Voltar
// - Avançar
function createControlButtons() {
    //
    //
    // Cria o botão de fechar e adiciona ao corpo do documento
    const closeButton = document.createElement('button');
    closeButton.id = 'closeButton';
    closeButton.className = 'controlButton';
    closeButton.innerHTML = 'X';
    closeButton.onclick = function () {
        window.location.href = 'uniwebview://close';
    };
    document.body.appendChild(closeButton);
    //
    //
    // Cria o botão de minimizar e adiciona ao corpo do documento
    const minimizeButton = document.createElement('button');
    minimizeButton.id = 'minimizeButton';
    minimizeButton.className = 'controlButton';
    minimizeButton.innerHTML = '–'; // Travessão maior
    minimizeButton.onclick = function () {
        window.location.href = 'uniwebview://minimize';
    };
    document.body.appendChild(minimizeButton);
    //
    //
    // Cria o botão de voltar e adiciona ao corpo do documento
    const backButton = document.createElement('button');
    backButton.id = 'backButton';
    backButton.className = 'controlButton';
    backButton.innerHTML = '←'; // Seta para esquerda
    backButton.onclick = function () {
        window.history.back();
    };
    document.body.appendChild(backButton);
    //
    //
    // Cria o botão de avançar e adiciona ao corpo do documento
    const forwardButton = document.createElement('button');
    forwardButton.id = 'forwardButton';
    forwardButton.className = 'controlButton';
    forwardButton.innerHTML = '→'; // Seta para direita
    forwardButton.onclick = function () {
        window.history.forward();
    };
    document.body.appendChild(forwardButton);
}
/* -------------------------------------------------------------------------- */
/*                           Roteiro de experimento                           */
/* -------------------------------------------------------------------------- */
function showManual() {
    if (manualType == 'pdf') {
        const myContent = {
            callfunction: 'ShowManual',
        };
        sendMessageToUnity(myContent);
    } else if (manualType == 'html') {
        openHTMLManual();
    }
}
/* -------------------------------------------------------------------------- */
/*                              Fechar aplicativo                             */
/* -------------------------------------------------------------------------- */
function closeApp() {
    window.location.href = 'uniwebview://close';
}
/* -------------------------------------------------------------------------- */
//
/* -------------------------------------------------------------------------- */
/*                             Páginas com canvas:                            */
/* -------------------------------------------------------------------------- */
//
/* -------------------------------------------------------------------------- */
if (hasCanvasElement()) {
    // Chama a função para remover todos os elementos, exceto o canvas
    removeAllExceptCanvas();
    loadingCallout();
    disableBodyScroll();
    if (settings.enableBrowserControls) {
        createControlButtons();
    }
    setTimeout(() => {
        if (settings.enableZoomAndPan) {
            /* -------------------------------------------------------------------------- */
            /*                                 Zoom e Pan                                 */
            /* -------------------------------------------------------------------------- */
            // Funções para controlar o zoom e a posição do canvas
            // Executar após um segundo
            panzoomElement = document.getElementsByTagName('canvas')[0];
            panzoom = Panzoom(panzoomElement, {
                maxScale: 2,
                minScale: 1,
            });
            panzoom.setOptions({
                disableZoom: true,
                disablePan: true,
                width: panzoomElement.width,
                height: panzoomElement.height,
            });
            // panzoom.getScale();
            // panzoom.getPan();
            // panzoom.pan(0, 0, { animate: true });
            // panzoom.zoom(1, { animate: true });
            //
            //
            // Funções para controlar o zoom e a posição do canvas
            function zoomIn() {
                panzoom.setOptions({
                    disableZoom: false,
                    disablePan: false,
                });
                var currentScale = panzoom.getScale();
                panzoom.zoom(currentScale + 0.2, { animate: false });
                panzoom.setOptions({
                    disableZoom: true,
                    disablePan: true,
                });
            }
            function zoomOut() {
                panzoom.setOptions({
                    disableZoom: false,
                    disablePan: false,
                });
                var currentScale = panzoom.getScale();
                panzoom.zoom(currentScale - 0.2, { animate: false });
                panzoom.setOptions({
                    disableZoom: true,
                    disablePan: true,
                });
            }
            function resetZoom() {
                panzoom.setOptions({
                    disableZoom: false,
                    disablePan: false,
                });
                panzoom.zoom(1, { animate: false });
                panzoom.pan(0, 0, { animate: false });
                panzoom.setOptions({
                    disableZoom: true,
                    disablePan: true,
                });
            }
            function panLeft() {
                panzoom.setOptions({
                    disableZoom: false,
                    disablePan: false,
                });
                var panX = panzoom.getPan().x;
                var panY = panzoom.getPan().y;
                panzoom.pan(panX + 30, panY, { animate: false });
                panzoom.setOptions({
                    disableZoom: true,
                    disablePan: true,
                });
            }
            function panRight() {
                panzoom.setOptions({
                    disableZoom: false,
                    disablePan: false,
                });
                var panX = panzoom.getPan().x;
                var panY = panzoom.getPan().y;
                panzoom.pan(panX - 30, panY, { animate: false });
                panzoom.setOptions({
                    disableZoom: true,
                    disablePan: true,
                });
            }
            function panUp() {
                panzoom.setOptions({
                    disableZoom: false,
                    disablePan: false,
                });
                var panX = panzoom.getPan().x;
                var panY = panzoom.getPan().y;
                panzoom.pan(panX, panY + 30, { animate: false });
                panzoom.setOptions({
                    disableZoom: true,
                    disablePan: true,
                });
            }
            function panDown() {
                panzoom.setOptions({
                    disableZoom: false,
                    disablePan: false,
                });
                var panX = panzoom.getPan().x;
                var panY = panzoom.getPan().y;
                panzoom.pan(panX, panY - 30, { animate: false });
                panzoom.setOptions({
                    disableZoom: true,
                    disablePan: true,
                });
            }
            // Função para iniciar o pan contínuo
            function startPan(direction) {
                const step = 10;
                let panInterval;
                const move = () => {
                    switch (direction) {
                        case 'left':
                            panLeft();
                            break;
                        case 'right':
                            panRight();
                            break;
                        case 'up':
                            panUp();
                            break;
                        case 'down':
                            panDown();
                            break;
                    }
                };
                const startMoving = () => {
                    panInterval = setInterval(move, 100); // Move every 100 ms
                };
                const stopMoving = () => {
                    clearInterval(panInterval);
                };
                return { startMoving, stopMoving };
            }
            /* -------------------------------------------------------------------------- */
            /*                              Botões de canvas                              */
            /* -------------------------------------------------------------------------- */
            // Criar botões de zoom e pan e adicioná-los ao corpo do documento
            const bottomLeftButtons = [
                {
                    id: 'customLeftButton1',
                    class: 'bottomLeftButton',
                    innerHTML: '+',
                    onClick: () => zoomIn(),
                    bottom: 10,
                },
                {
                    id: 'customLeftButton2',
                    class: 'bottomLeftButton',
                    innerHTML: '0',
                    onClick: () => resetZoom(),
                    bottom: 60,
                },
                {
                    id: 'customLeftButton3',
                    class: 'bottomLeftButton',
                    innerHTML: '−', // Travessão menor
                    onClick: () => zoomOut(),
                    bottom: 110,
                },
            ];
            bottomLeftButtons.forEach(
                ({ id, class: className, innerHTML, onClick, bottom }, index) => {
                    const button = document.createElement('button');
                    button.id = id;
                    button.className = className;
                    button.innerHTML = innerHTML;
                    button.style.bottom = `${bottom}px`; // Ajuste de posição vertical
                    button.onclick = onClick;
                    document.body.appendChild(button);
                }
            );
            const bottomRightButtons = [
                {
                    id: 'customRightButton1',
                    class: 'bottomRightButton',
                    innerHTML: '↑',
                    onMouseDown: () => panUpHandler.startMoving(),
                    onTouchStart: () => panUpHandler.startMoving(),
                    onMouseUp: () => panUpHandler.stopMoving(),
                    onTouchEnd: () => panUpHandler.stopMoving(),
                },
                {
                    id: 'customRightButton2',
                    class: 'bottomRightButton',
                    innerHTML: '↓',
                    onMouseDown: () => panDownHandler.startMoving(),
                    onTouchStart: () => panDownHandler.startMoving(),
                    onMouseUp: () => panDownHandler.stopMoving(),
                    onTouchEnd: () => panDownHandler.stopMoving(),
                },
                {
                    id: 'customRightButton3',
                    class: 'bottomRightButton',
                    innerHTML: '←',
                    onMouseDown: () => panLeftHandler.startMoving(),
                    onTouchStart: () => panLeftHandler.startMoving(),
                    onMouseUp: () => panLeftHandler.stopMoving(),
                    onTouchEnd: () => panLeftHandler.stopMoving(),
                },
                {
                    id: 'customRightButton4',
                    class: 'bottomRightButton',
                    innerHTML: '→',
                    onMouseDown: () => panRightHandler.startMoving(),
                    onTouchStart: () => panRightHandler.startMoving(),
                    onMouseUp: () => panRightHandler.stopMoving(),
                    onTouchEnd: () => panRightHandler.stopMoving(),
                },
            ];
            const panUpHandler = startPan('up');
            const panDownHandler = startPan('down');
            const panLeftHandler = startPan('left');
            const panRightHandler = startPan('right');
            bottomRightButtons.forEach(
                (
                    {
                        id,
                        class: className,
                        innerHTML,
                        onMouseDown,
                        onTouchStart,
                        onMouseUp,
                        onTouchEnd,
                    },
                    index
                ) => {
                    const button = document.createElement('button');
                    button.id = id;
                    button.className = className;
                    button.innerHTML = innerHTML;
                    button.style.bottom = `${10 + index * 50}px`; // Ajuste de posição vertical
                    button.onmousedown = onMouseDown;
                    button.onmouseup = onMouseUp;
                    button.onmouseleave = onMouseUp; // Stop panning if the mouse leaves the button
                    button.ontouchstart = onTouchStart;
                    button.ontouchend = onTouchEnd;
                    document.body.appendChild(button);
                }
            );
        } else {
            /* -------------------------------------------------------------------------- */
            /*                        Botões para teclado e manual                        */
            /* -------------------------------------------------------------------------- */
            if (!settings.enableFloatingButtons) {
                const bottomLeftButtons = [
                    {
                        id: 'keyboardButton',
                        class: 'bottomLeftButton2',
                        innerHTML: '⌨',
                        onClick: () => createInputField(),
                        bottom: 10,
                    },
                    {
                        id: 'backspaceButton',
                        class: 'bottomLeftButton2',
                        innerHTML: '⌫',
                        onClick: () => backspace(),
                        bottom: 60,
                    },
                    {
                        id: 'manualButton',
                        class: 'bottomLeftButton2',
                        innerHTML: '❓',
                        onClick: () => showManual(),
                        bottom: 110,
                    },
                ];
                bottomLeftButtons.forEach(
                    ({ id, class: className, innerHTML, onClick, bottom }, index) => {
                        const button = document.createElement('button');
                        button.id = id;
                        button.className = className;
                        button.innerHTML = innerHTML;
                        button.style.bottom = `${bottom}px`; // Ajuste de posição vertical
                        button.onclick = onClick;
                        document.body.appendChild(button);
                    }
                );
            } else {
                /* -------------------------------------------------------------------------- */
                /*                         Menu com botões flutuantes                         */
                /* -------------------------------------------------------------------------- */
                // Cria o elemento <ul> principal
                const ul = document.createElement('ul');
                ul.id = 'menu';
                ul.className = 'mfb-component--bl mfb-slidein';
                ul.setAttribute('data-mfb-toggle', 'click');
                // Cria o elemento <li> para o botão principal
                const liMain = document.createElement('li');
                liMain.className = 'mfb-component__wrap';
                // Cria o elemento <a> principal
                const aMain = document.createElement('a');
                aMain.className = 'mfb-component__button--main';
                // Cria os ícones para o botão principal
                const restingIcon = document.createElement('i');
                restingIcon.className = 'mfb-component__main-icon--resting ion-plus-round';
                const activeIcon = document.createElement('i');
                activeIcon.className = 'mfb-component__main-icon--active ion-close-round';
                // Adiciona os ícones ao botão principal
                aMain.appendChild(restingIcon);
                aMain.appendChild(activeIcon);
                // Adiciona o botão principal ao elemento <li>
                liMain.appendChild(aMain);
                // Cria o elemento <ul> para os itens do menu secundário
                const ulChild = document.createElement('ul');
                ulChild.className = 'mfb-component__list';
                // Função auxiliar para criar cada item do menu
                function createMenuItem(onclick, label, iconClass) {
                    const li = document.createElement('li');
                    const a = document.createElement('a');
                    a.setAttribute('onclick', onclick);
                    a.setAttribute('data-mfb-label', label);
                    a.className = 'mfb-component__button--child';
                    const icon = document.createElement('i');
                    icon.className = `mfb-component__child-icon ${iconClass}`;
                    a.appendChild(icon);
                    li.appendChild(a);
                    return li;
                }
                // Adiciona os itens do menu secundário ao <ul> secundário
                // ulChild.appendChild(createMenuItem('help()', 'Ajuda', 'ion-help'));
                ulChild.appendChild(
                    createMenuItem('backspace()', 'Apagar caractere', 'ion-backspace')
                );
                ulChild.appendChild(
                    createMenuItem('createInputField()', 'Teclado', 'ion-ios-keypad')
                );
                ulChild.appendChild(createMenuItem('showManual()', 'Roteiro', 'ion-document'));
                ulChild.appendChild(
                    createMenuItem('closeApp()', 'Fechar aplicativo', 'ion-close-app-round')
                );
                // Adiciona o <li> principal ao <ul> principal
                ul.appendChild(liMain);
                // Adiciona o <ul> secundário como irmão do <a> principal
                liMain.appendChild(ulChild);
                // Adiciona o <ul> principal ao corpo do documento ou a um elemento específico
                document.body.appendChild(ul);
                /**
                 * Some defaults
                 */
                var clickOpt = 'click',
                    hoverOpt = 'hover',
                    toggleMethod = 'data-mfb-toggle',
                    menuState = 'data-mfb-state',
                    isOpen = 'open',
                    isClosed = 'closed',
                    mainButtonClass = 'mfb-component__button--main';
                /**
                 * Internal references
                 */
                var elemsToClick, elemsToHover, mainButton, target, currentState;
                /**
                 * For every menu we need to get the main button and attach the appropriate evt.
                 */
                function attachEvt(elems, evt) {
                    for (var i = 0, len = elems.length; i < len; i++) {
                        mainButton = elems[i].querySelector('.' + mainButtonClass);
                        mainButton.addEventListener(evt, toggleButton, false);
                    }
                }
                /**
                 * Remove the hover option, set a click toggle and a default,
                 * initial state of 'closed' to menu that's been targeted.
                 */
                function replaceAttrs(elems) {
                    for (var i = 0, len = elems.length; i < len; i++) {
                        elems[i].setAttribute(toggleMethod, clickOpt);
                        elems[i].setAttribute(menuState, isClosed);
                    }
                }
                function getElemsByToggleMethod(selector) {
                    return document.querySelectorAll('[' + toggleMethod + '="' + selector + '"]');
                }
                /**
                 * The open/close action is performed by toggling an attribute
                 * on the menu main element.
                 *
                 * First, check if the target is the menu itself. If it's a child
                 * keep walking up the tree until we found the main element
                 * where we can toggle the state.
                 */
                function toggleButton(evt) {
                    target = evt.target;
                    while (target && !target.getAttribute(toggleMethod)) {
                        target = target.parentNode;
                        if (!target) {
                            return;
                        }
                    }
                    currentState = target.getAttribute(menuState) === isOpen ? isClosed : isOpen;
                    target.setAttribute(menuState, currentState);
                }
                /**
                 * On touch enabled devices we assume that no hover state is possible.
                 * So, we get the menu with hover action configured and we set it up
                 * in order to make it usable with tap/click.
                 **/
                elemsToHover = getElemsByToggleMethod(hoverOpt);
                replaceAttrs(elemsToHover);
                elemsToClick = getElemsByToggleMethod(clickOpt);
                attachEvt(elemsToClick, 'click');
                /* -------------------------------------------------------------------------- */
                // Adiciona o evento de clique ao botão principal
                const menu = document.getElementById('menu');
                let isDragging = false;
                let offsetX = 0;
                let offsetY = 0;
                function startDrag(e) {
                    isDragging = true;
                    const touch = e.touches ? e.touches[0] : e;
                    offsetX = touch.clientX - menu.getBoundingClientRect().left;
                    offsetY = touch.clientY - menu.getBoundingClientRect().top;
                }
                function drag(e) {
                    if (isDragging) {
                        const touch = e.touches ? e.touches[0] : e;
                        menu.style.left = touch.clientX - offsetX + 'px';
                        menu.style.top = touch.clientY - offsetY + 'px';
                        menu.style.position = 'fixed'; // Garanta que continue com position: fixed
                    }
                }
                function stopDrag() {
                    isDragging = false;
                }
                // Eventos para dispositivos móveis
                menu.addEventListener('touchstart', startDrag);
                document.addEventListener('touchmove', drag);
                document.addEventListener('touchend', stopDrag);
                // Eventos para desktop (caso queira suporte a ambos)
                menu.addEventListener('mousedown', startDrag);
                document.addEventListener('mousemove', drag);
                document.addEventListener('mouseup', stopDrag);
            }
        }
    }, 2000);
    /* -------------------------------------------------------------------------- */
    /*                 Transformação do duplo toque em toque duplo                */
    /* -------------------------------------------------------------------------- */
    // Função para simular o toque de dois dedos com o interact.js
    function simulateTwoFingerTouch(targetElement, x, y) {
        function createTouch(target, identifier, x, y) {
            return new Touch({
                identifier: identifier,
                target: target,
                clientX: x,
                clientY: y,
                screenX: x,
                screenY: y,
                pageX: x,
                pageY: y,
                radiusX: 10,
                radiusY: 10,
                rotationAngle: 0,
                force: 1,
            });
        }
        const touch1 = createTouch(targetElement, 1, x - 0.01, y);
        const touch2 = createTouch(targetElement, 2, x, y);
        const touchStartEvent = new TouchEvent('touchstart', {
            touches: [touch1, touch2],
            targetTouches: [touch1, touch2],
            changedTouches: [touch1, touch2],
            bubbles: true,
            cancelable: true,
        });
        const touchEndEvent = new TouchEvent('touchend', {
            touches: [],
            targetTouches: [],
            changedTouches: [touch1, touch2],
            bubbles: true,
            cancelable: true,
        });
        targetElement.dispatchEvent(touchStartEvent);
        setTimeout(() => {
            targetElement.dispatchEvent(touchEndEvent);
        }, 50);
    }
    // Configurar Interact.js para detectar toque duplo
    interact(document.body).on('doubletap', function (event) {
        console.log('Double tap detected');
        const touch = event._interaction._latestPointer.event;
        const x = touch.clientX;
        const y = touch.clientY;
        const targetElement = document.elementFromPoint(x, y);
        if (targetElement) {
            simulateTwoFingerTouch(targetElement, x, y);
        }
    });
    /* -------------------------------------------------------------------------- */
    /*                               Teclado nativo                               */
    /* -------------------------------------------------------------------------- */
    // Cria um input field invisível para receber o foco e capturar os eventos de
    // teclado do celular e para cada evento do teclado nativo do celular, reproduz
    // o mesmo evento como teclado de computador usando a biblioteca Syn.
    function backspace() {
        // syn.click(document.body).type('\b');
        // Define as propriedades do evento de teclado para Backspace
        const eventOptions = {
            key: 'Backspace', // Nome da tecla
            code: 'Backspace', // Código da tecla
            keyCode: 8, // keyCode para Backspace
            which: 8, // which para Backspace
            bubbles: true, // Permite que o evento borbulhe na árvore DOM
            cancelable: true, // Permite que o evento seja cancelado
        };
        // Cria o evento 'keydown' para Backspace
        const keyDownEvent = new KeyboardEvent('keydown', eventOptions);
        // Despacha o evento no documento
        document.dispatchEvent(keyDownEvent);
        // Cria o evento 'keyup' para Backspace
        const keyUpEvent = new KeyboardEvent('keyup', eventOptions);
        // Despacha o evento no documento
        document.dispatchEvent(keyUpEvent);
    }
    function createInputField() {
        // Verifica se já existe input com o id 'centeredInputField'
        if (document.getElementById('centeredInputField')) {
            // Remove o input e o botão
            document.getElementById('centeredInputField').remove();
            document.getElementById('sendButton').remove();
        }
        // Cria um elemento de input
        var inputField = document.createElement('input');
        // Define o tipo de input, pode ser ""text"", ""password"", etc.
        inputField.type = 'text';
        // Define o id para o input, caso precise de referência futura
        inputField.id = 'centeredInputField';
        // Define os estilos para centralizar o input
        inputField.style.position = 'fixed';
        inputField.style.top = '50%';
        inputField.style.left = '50%';
        inputField.style.transform = 'translate(-50%, -50%)';
        inputField.style.zIndex = '2000'; // Certifique-se de que o z-index é maior que qualquer outro elemento na página
        inputField.style.width = '500px'; // Largura do input (dobrada)
        inputField.style.padding = '24px'; // Espaçamento interno (dobrado)
        inputField.style.fontSize = '16px'; // Tamanho da fonte
        inputField.style.border = '1px solid #ccc'; // Borda do input
        inputField.style.borderRadius = '8px'; // Bordas arredondadas
        inputField.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)'; // Sombra para dar profundidade
        inputField.style.backgroundColor = '#f9f9f9'; // Cor de fundo suave
        inputField.style.outline = 'none'; // Remove o contorno ao focar
        inputField.style.transition = 'box-shadow 0.3s ease'; // Transição suave para a sombra
        // Adiciona efeito ao focar
        inputField.onfocus = function () {
            inputField.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
        };
        inputField.onblur = function () {
            inputField.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
        };
        // Cria um botão
        var sendButton = document.createElement('button');
        // Define o texto do botão
        sendButton.textContent = 'Enviar';
        // Define os estilos para o botão
        sendButton.style.position = 'fixed';
        sendButton.style.top = '50%';
        sendButton.style.left = 'calc(50% + 270px)'; // Posiciona à direita do input field (considerando largura do input e padding)
        sendButton.style.transform = 'translate(-50%, -50%)';
        sendButton.style.zIndex = '2000';
        sendButton.style.padding = '24px'; // Mesma altura do input field
        sendButton.style.fontSize = '16px';
        sendButton.style.border = '1px solid #ccc';
        sendButton.style.borderRadius = '8px';
        sendButton.style.backgroundColor = '#4CAF50'; // Cor de fundo verde
        sendButton.style.color = '#fff'; // Cor do texto branco
        sendButton.style.cursor = 'pointer';
        sendButton.style.outline = 'none';
        sendButton.style.transition = 'background-color 0.3s ease, box-shadow 0.3s ease';
        // Adiciona efeito ao focar
        sendButton.onfocus = function () {
            sendButton.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
        };
        sendButton.onblur = function () {
            sendButton.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
        };
        // Adiciona efeito ao passar o mouse
        sendButton.onmouseover = function () {
            sendButton.style.backgroundColor = '#45a049';
        };
        sendButton.onmouseout = function () {
            sendButton.style.backgroundColor = '#4CAF50';
        };
        // Adiciona funcionalidade ao botão
        sendButton.onclick = function () {
            var inputValue = inputField.value;
            syn.click(document.body).type(inputValue);
            setTimeout(function () {
                inputField.remove();
                sendButton.remove();
            }, 500);
        };
        // Adiciona os elementos ao body
        document.body.appendChild(inputField);
        document.body.appendChild(sendButton);
        // Foca no elemento
        inputField.focus();
    }
} else {
    createControlButtons();
}
/* -------------------------------------------------------------------------- */
/*                          Mensagem de carregamento                          */
/* -------------------------------------------------------------------------- */
function loadingCallout() {
    // Cria o elemento callout reutilizando estilo
    const callout = document.createElement('div');
    callout.className = 'calloutMessage'; // Classe de estilo reutilizável
    callout.textContent = 'Carregando o laboratório...';
    // Adiciona o callout ao topo da página
    document.body.appendChild(callout);
    // Remove o callout após 5 segundos
    setTimeout(() => {
        callout.remove();
    }, 8000);
}
/* -------------------------------------------------------------------------- */
/*                        Desabilitar rolagem do corpo                        */
/* -------------------------------------------------------------------------- */
function disableBodyScroll() {
    document.body.style.overflow = 'hidden';
}
/* -------------------------------------------------------------------------- */
/*                                 Manual HTML                                */
/* -------------------------------------------------------------------------- */
function openHTMLManual() {
    // Verifica se o iframe já existe
    if (document.getElementById('fullScreenIframe')) {
        // Mostra novamente o iframe e o botão
        document.getElementById('fullScreenIframe').style.zIndex = '9999';
        document.getElementById('closeButton-manual').style.zIndex = '10000';
        document.getElementById('overlayDiv').style.zIndex = '-1';
        return;
    }
    var link = manualUrl; // Link para a página
    // Verifica se o link está vazio
    if (!link) {
        console.error('O link não pode estar vazio.');
        return;
    }
    // Cria um elemento iframe
    var iframe = document.createElement('iframe');
    iframe.id = 'fullScreenIframe';
    // Define atributos para o iframe
    iframe.src = link;
    iframe.style.position = 'fixed';
    iframe.style.top = '0';
    iframe.style.left = '0';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.style.zIndex = '9999'; // Certifica-se que o iframe estará sobre todos os outros elementos
    // Cria o botão de fechar e adiciona ao corpo do documento
    const closeButton = document.createElement('button');
    closeButton.id = 'closeButton-manual';
    closeButton.className = 'controlButton';
    closeButton.innerHTML = 'X';
    closeButton.style.position = 'fixed';
    closeButton.style.zIndex = '10000'; // Certifica-se que o botão estará sobre o iframe
    closeButton.style.top = '10px';
    closeButton.style.right = '10px';
    closeButton.onclick = function () {
        iframe.style.zIndex = '-2';
        closeButton.style.zIndex = '-2';
        overlayDiv.style.zIndex = '-1';
    };
    // Cria um div branco que cobre a tela inteira
    var overlayDiv = document.createElement('div');
    overlayDiv.id = 'overlayDiv';
    overlayDiv.style.position = 'fixed';
    overlayDiv.style.top = '0';
    overlayDiv.style.left = '0';
    overlayDiv.style.width = '100%';
    overlayDiv.style.height = '100%';
    overlayDiv.style.backgroundColor = 'white';
    overlayDiv.style.zIndex = '-1'; // Certifica-se que o div está atrás do iframe e do botão
    document.body.appendChild(iframe);
    document.body.appendChild(overlayDiv);
    document.body.appendChild(closeButton);
}
