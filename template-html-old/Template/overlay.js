function createOverlay() {
    // Log da url atual
    console.log('Criação do overlay...');
    // ----------------- Obter conteúdo do roteiro -----------------
    // Obter os parâmetros da URL
    const urlParams = new URLSearchParams(window.location.search);
    const environment = urlParams.get('environment');
    const authorizationToken = urlParams.get('authorization');
    const compositeObjectId = urlParams.get('compositeObjectId');
    // Variáveis para controle de estado
    let contentLoaded = false;
    let lastScrollPosition = 0;
    // Função para determinar a base da URL da API com base no ambiente
    function getApiBaseUrl(env) {
        switch (env) {
            case 'dev':
                return 'https://api.dev-plataforma.grupoa.education/v1/marketplace-bff/retrieve-object/script';
            case 'hlg':
                return 'https://api.hlg-plataforma.grupoa.education/v1/marketplace-bff/retrieve-object/script';
            default:
                return 'https://api.plataforma.grupoa.education/v1/marketplace-bff/retrieve-object/script';
        }
    }
    // Função para fazer a requisição ao Composite Object API
    async function fetchCompositeObject() {
        if (compositeObjectId) {
            // Determina a base da URL com base no ambiente
            const baseUrl = getApiBaseUrl(environment);
            // Constrói a URL completa incluindo o compositeObjectId
            const apiUrl = `${baseUrl}/${compositeObjectId}`;
            try {
                const response = await fetch(apiUrl, {
                    method: 'GET',
                    headers: {
                        authorization: authorizationToken,
                    },
                });
                if (!response.ok) {
                    throw new Error(
                        `Erro na requisição: ${response.status} ${response.statusText}`
                    );
                }
                const data = await response.json();
                console.log('Dados do Composite Object:', data);
                // Verifica se existem arquivos e procura por um PDF
                if (data.files && data.files.length > 0) {
                    const pdfFile = data.files.find((file) =>
                        file.name.toLowerCase().endsWith('.pdf')
                    );
                    if (pdfFile) {
                        return pdfFile.url; // Retorna a URL do PDF
                    }
                }
                // Se não houver PDF nos arquivos, verifica o conteúdo HTML
                if (data.html) {
                    // Parseia o conteúdo HTML para procurar pelo elemento <grupoabook>
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(data.html, 'text/html');
                    const grupoabookElement = doc.querySelector('grupoabook');
                    if (grupoabookElement) {
                        const pdfUrl = grupoabookElement.getAttribute('file');
                        if (pdfUrl) {
                            return pdfUrl; // Retorna a URL do PDF encontrada no atributo 'file'
                        }
                    }
                    // Se não encontrar o PDF no elemento <grupoabook>, retorna o HTML
                    return data.html;
                }
                // Caso não haja arquivos nem HTML
                throw new Error('Nenhum arquivo PDF encontrado e conteúdo HTML ausente.');
            } catch (error) {
                console.error('Erro:', error);
            }
        } else {
            console.error('Composite Object ID não fornecido na URL.');
        }
    }
    // Chamar as funções para fazer as requisições
    let openOverlayFunction = function () { };
    fetchCompositeObject().then((result) => {
        if (result) {
            // Verifica se a string é uma URL de PDF
            if (result.endsWith('.pdf')) {
                // Adiciona um evento de clique para abrir o overlay com o PDF
                openOverlayFunction = () => openPDFOverlay(result);
            } else {
                // Adiciona um evento de clique para abrir o overlay com o conteúdo HTML
                openOverlayFunction = () => openHTMLOverlay(result);
            }
        } else {
            console.log('Nenhum resultado válido obtido.');
        }
    });
    // ----------------- Fullscreen -----------------
    class FullscreenManager {
        constructor(element) {
            if (!(element instanceof HTMLElement)) {
                throw new Error('FullscreenManager requer um elemento HTML válido.');
            }
            this.element = element;
            this.isFullscreen = false;
            this.lockPointer = true;
            this.resizeElement = false;
            this.originalParent = element.parentNode;
            this.elementContainer = null;
            // Bind the fullscreen change handler
            this.fullscreenChangeHandler = this.onFullscreenChange.bind(this);
        }
        /**
         * Entra no modo fullscreen.
         * @param {boolean} lockPointer - Se true, bloqueia o ponteiro do mouse.
         * @param {boolean} resizeElement - Se true, redimensiona o elemento para ocupar toda a tela.
         */
        enterFullscreen(lockPointer = true, resizeElement = false) {
            this.lockPointer = typeof lockPointer !== 'undefined' ? lockPointer : true;
            this.resizeElement = typeof resizeElement !== 'undefined' ? resizeElement : false;
            if (this.isFullscreen) {
                console.warn('Já está em modo fullscreen.');
                return;
            }
            // Adiciona event listeners para mudanças de fullscreen
            document.addEventListener('fullscreenchange', this.fullscreenChangeHandler);
            document.addEventListener('mozfullscreenchange', this.fullscreenChangeHandler);
            document.addEventListener('webkitfullscreenchange', this.fullscreenChangeHandler);
            document.addEventListener('MSFullscreenChange', this.fullscreenChangeHandler);
            // Solicita fullscreen no elemento
            const requestFullscreen =
                this.element.requestFullscreen ||
                this.element.mozRequestFullScreen ||
                this.element.webkitRequestFullscreen ||
                this.element.msRequestFullscreen;
            if (requestFullscreen) {
                requestFullscreen.call(this.element).catch((err) => {
                    console.error(`Erro ao tentar entrar em fullscreen: ${err.message}`);
                });
            } else {
                console.error('Fullscreen API não é suportada neste navegador.');
            }
        }
        /**
         * Sai do modo fullscreen.
         */
        exitFullscreen() {
            if (!this.isFullscreen) {
                console.warn('Não está em modo fullscreen.');
                return;
            }
            const exitFullscreen =
                document.exitFullscreen ||
                document.mozCancelFullScreen ||
                document.webkitExitFullscreen ||
                document.msExitFullscreen;
            if (exitFullscreen) {
                exitFullscreen.call(document).catch((err) => {
                    console.error(`Erro ao tentar sair do fullscreen: ${err.message}`);
                });
            } else {
                console.error('Fullscreen API não é suportada neste navegador.');
            }
        }
        /**
         * Handler para mudanças no estado de fullscreen.
         */
        onFullscreenChange() {
            const fullscreenElement =
                document.fullscreenElement ||
                document.mozFullScreenElement ||
                document.webkitFullscreenElement ||
                document.msFullscreenElement;
            if (fullscreenElement === this.element) {
                // Entrou no fullscreen
                this.isFullscreen = true;
                this.element.classList.add('fullscreen');
                const button = this.element.querySelector('#fullscreen-button');
                if (button) {
                    button.textContent = 'Sair do Fullscreen';
                    button.classList.add('fullscreen');
                }
                if (this.lockPointer) {
                    this.requestPointerLock();
                }
                if (this.resizeElement) {
                    this.setFullscreenElementSize();
                }
            } else {
                // Saiu do fullscreen
                this.isFullscreen = false;
                this.element.classList.remove('fullscreen');
                const button = this.element.querySelector('#fullscreen-button');
                if (button) {
                    button.textContent = 'Entrar em Fullscreen';
                    button.classList.remove('fullscreen');
                }
                if (this.lockPointer) {
                    this.exitPointerLock();
                }
                if (this.resizeElement) {
                    this.setWindowedElementSize();
                }
            }
        }
        /**
         * Solicita o bloqueio do ponteiro.
         */
        requestPointerLock() {
            this.element.requestPointerLock =
                this.element.requestPointerLock ||
                this.element.mozRequestPointerLock ||
                this.element.webkitRequestPointerLock ||
                this.element.msRequestPointerLock ||
                function () {
                    console.warn('Pointer Lock API não é suportada neste navegador.');
                };
            this.element.requestPointerLock();
        }
        /**
         * Sai do bloqueio do ponteiro.
         */
        exitPointerLock() {
            document.exitPointerLock =
                document.exitPointerLock ||
                document.mozExitPointerLock ||
                document.webkitExitPointerLock ||
                document.msExitPointerLock ||
                function () {
                    console.warn('Pointer Lock API não é suportada neste navegador.');
                };
            document.exitPointerLock();
        }
        /**
         * Redimensiona o elemento para ocupar toda a tela em fullscreen.
         */
        setFullscreenElementSize() {
            if (!this.isFullscreen) return;
            this.element.style.width = '100%';
            this.element.style.height = '100%';
        }
        /**
         * Redimensiona o elemento para o tamanho original ao sair do fullscreen.
         */
        setWindowedElementSize() {
            if (this.isFullscreen) return;
            this.element.style.width = '';
            this.element.style.height = '';
        }
        /**
         * Remove todos os event listeners e limpa referências.
         */
        destroy() {
            document.removeEventListener('fullscreenchange', this.fullscreenChangeHandler);
            document.removeEventListener('mozfullscreenchange', this.fullscreenChangeHandler);
            document.removeEventListener('webkitfullscreenchange', this.fullscreenChangeHandler);
            document.removeEventListener('MSFullscreenChange', this.fullscreenChangeHandler);
            if (this.isFullscreen) {
                this.exitFullscreen();
            }
            this.elementContainer = null;
            this.originalParent = null;
        }
    }
    const container = document.getElementById('l-canvas-container');
    const fsManager = new FullscreenManager(container);
    // ----------------- Botão flutuante -----------------
    class DraggableButton {
        constructor(buttonElement, clickHandler) {
            this.button = buttonElement;
            this.clickHandler = clickHandler;
            this.dragging = false;
            this.startX = 0;
            this.startY = 0;
            this.buttonStartLeft = 0;
            this.buttonStartTop = 0;
            this.threshold = 5; // Limite em pixels para diferenciar clique de arrasto
            if (!this.button) {
                console.error('Elemento do botão não fornecido ou inválido.');
                return;
            }
            // Certifique-se de que o botão tenha posição fixa
            this.button.style.position = 'fixed';
            // Obter as posições iniciais
            const rect = this.button.getBoundingClientRect();
            this.initialLeft = parseInt(this.button.style.left) || rect.left;
            this.initialTop = parseInt(this.button.style.top) || rect.top;
            // Definir 'left' e 'top' iniciais se não estiverem definidos
            if (!this.button.style.left) {
                this.button.style.left = this.initialLeft + 'px';
            }
            if (!this.button.style.top) {
                this.button.style.top = this.initialTop + 'px';
            }
            // Vincular os manipuladores de eventos ao contexto atual
            this.onMouseDown = this.onMouseDown.bind(this);
            this.onMouseMove = this.onMouseMove.bind(this);
            this.onMouseUp = this.onMouseUp.bind(this);
            this.onTouchStart = this.onTouchStart.bind(this);
            this.onTouchMove = this.onTouchMove.bind(this);
            this.onTouchEnd = this.onTouchEnd.bind(this);
            // Adicionar ouvintes de eventos
            this.button.addEventListener('mousedown', this.onMouseDown);
            this.button.addEventListener('touchstart', this.onTouchStart);
            // Prevenir o comportamento padrão em dispositivos de toque
            this.button.addEventListener(
                'touchmove',
                function (e) {
                    e.preventDefault();
                },
                { passive: false }
            );
        }
        onMouseDown(e) {
            e.preventDefault();
            this.dragging = false;
            this.startX = e.clientX;
            this.startY = e.clientY;
            this.buttonStartLeft = parseInt(this.button.style.left) || 0;
            this.buttonStartTop = parseInt(this.button.style.top) || 0;
            document.addEventListener('mousemove', this.onMouseMove);
            document.addEventListener('mouseup', this.onMouseUp);
        }
        onMouseMove(e) {
            e.preventDefault();
            const dx = e.clientX - this.startX;
            const dy = e.clientY - this.startY;
            if (!this.dragging) {
                if (Math.abs(dx) > this.threshold || Math.abs(dy) > this.threshold) {
                    this.dragging = true;
                } else {
                    return;
                }
            }
            this.button.style.left = this.buttonStartLeft + dx + 'px';
            this.button.style.top = this.buttonStartTop + dy + 'px';
        }
        onMouseUp(e) {
            e.preventDefault();
            document.removeEventListener('mousemove', this.onMouseMove);
            document.removeEventListener('mouseup', this.onMouseUp);
            if (!this.dragging) {
                // Foi um clique, não um arrasto
                this.clickHandler();
            }
        }
        onTouchStart(e) {
            e.preventDefault();
            if (e.touches.length !== 1) return; // Apenas um toque
            this.dragging = false;
            const touch = e.touches[0];
            this.startX = touch.clientX;
            this.startY = touch.clientY;
            this.buttonStartLeft = parseInt(this.button.style.left) || 0;
            this.buttonStartTop = parseInt(this.button.style.top) || 0;
            document.addEventListener('touchmove', this.onTouchMove, { passive: false });
            document.addEventListener('touchend', this.onTouchEnd);
        }
        onTouchMove(e) {
            e.preventDefault();
            if (e.touches.length !== 1) return; // Apenas um toque
            const touch = e.touches[0];
            const dx = touch.clientX - this.startX;
            const dy = touch.clientY - this.startY;
            if (!this.dragging) {
                if (Math.abs(dx) > this.threshold || Math.abs(dy) > this.threshold) {
                    this.dragging = true;
                } else {
                    return;
                }
            }
            this.button.style.left = this.buttonStartLeft + dx + 'px';
            this.button.style.top = this.buttonStartTop + dy + 'px';
        }
        onTouchEnd(e) {
            e.preventDefault();
            document.removeEventListener('touchmove', this.onTouchMove);
            document.removeEventListener('touchend', this.onTouchEnd);
            if (!this.dragging) {
                // Foi um toque (clique), não um arrasto
                this.clickHandler();
            }
        }
        /**
         * Move o botão para o canto inferior esquerdo com uma distância especificada das bordas.
         * @param {number} distance - Distância em pixels das bordas esquerda e inferior.
         */
        moveToBottomLeft(distance) {
            const viewportHeight = window.innerHeight;
            const rect = this.button.getBoundingClientRect();
            const top = viewportHeight - rect.height - distance;
            this.button.style.left = `${distance}px`;
            this.button.style.top = `${top}px`;
        }
        /**
         * Move o botão para o canto inferior direito com uma distância especificada das bordas.
         * @param {number} distance - Distância em pixels das bordas direita e inferior.
         */
        moveToBottomRight(distance) {
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            const rect = this.button.getBoundingClientRect();
            const left = viewportWidth - rect.width - distance;
            const top = viewportHeight - rect.height - distance;
            this.button.style.left = `${left}px`;
            this.button.style.top = `${top}px`;
        }
    }
    function debounce(func, wait) {
        let timeout;
        return function (...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }
    class ExpandingButton {
        constructor(buttonElement) {
            this.button = buttonElement;
            this.init();
        }
        init() {
            // Vincular métodos ao contexto atual
            this.handleMouseEnter = this.handleMouseEnter.bind(this);
            this.handleMouseLeave = this.handleMouseLeave.bind(this);
            // Aplicar debounce com um atraso de 200ms
            this.debouncedMouseEnter = debounce(this.handleMouseEnter, 200);
            this.debouncedMouseLeave = debounce(this.handleMouseLeave, 200);
            // Adicionar ouvintes de eventos
            this.button.addEventListener('mouseenter', this.debouncedMouseEnter);
            this.button.addEventListener('mouseleave', this.debouncedMouseLeave);
        }
        handleMouseEnter() {
            const rect = this.button.getBoundingClientRect();
            const windowWidth = window.innerWidth;
            this.button.classList.add('expanded');
            if (rect.left + rect.width / 2 < windowWidth / 2) {
                // Botão está na metade esquerda da tela
                this.button.classList.remove('expand-left');
            } else {
                // Botão está na metade direita da tela
                this.button.classList.add('expand-left');
            }
        }
        handleMouseLeave() {
            this.button.classList.remove('expanded');
            this.button.classList.remove('expand-left');
        }
    }
    // Uso da classe
    const fullscreenButton = document.querySelector('#fullscreen-button');
    const scriptButton = document.querySelector('#scriptButton');
    new ExpandingButton(fullscreenButton);
    new ExpandingButton(scriptButton);
    const fullscreenDraggableButton = new DraggableButton(fullscreenButton, () => {
        fsManager.enterFullscreen(false, true);
    });
    const scriptDraggableButton = new DraggableButton(scriptButton, () => {
        openOverlayFunction();
    });
    window.addEventListener('resize', () => {
        fullscreenDraggableButton.moveToBottomRight(20);
        scriptDraggableButton.moveToBottomLeft(20);
    });
    // ----------------- Overlay -----------------
    const closeButton = document.getElementById('overlay__close-button');
    const overlay = document.getElementById('overlay');
    const overlayWrapper = document.getElementById('overlay__pdf-wrapper');
    const pdfObject = document.getElementById('pdfObject');
    const pdfIframe = document.getElementById('pdf-frame');
    const overlayContent = document.getElementById('overlay__script-wrapper');
    const dynamicContent = document.getElementById('overlay__script-content');
    // Função para abrir o overlay
    function openHTMLOverlay(htmlString) {
        if (!contentLoaded) {
            // Atualizar o conteúdo HTML apenas se ainda não foi carregado ou se estava mostrando PDF
            dynamicContent.innerHTML = htmlString;
            contentLoaded = true;
        }
        // Atualizar o conteúdo HTML
        overlay.classList.add('active');
        overlay.setAttribute('aria-hidden', 'false');
        // Restaurar a posição de rolagem se disponível
        dynamicContent.scrollTop = lastScrollPosition;
        // Prevenir scroll do body
        document.body.style.overflow = 'hidden';
        // Focar no overlay para acessibilidade
        closeButton.focus();
        // Prevenir scroll do body
        document.body.style.overflow = 'hidden';
        // Mostrar conteúdo HTML
        overlayContent.style.display = 'block';
    }
    function openPDFOverlay(pdfUrl) {
        if (!contentLoaded) {
            // Atualizar o src do iframe apenas se ainda não foi carregado ou se estava mostrando HTML
            pdfIframe.src = pdfUrl;
            contentLoaded = true;
        }
        // Atualizar o src do iframe
        overlay.classList.add('active');
        overlay.setAttribute('aria-hidden', 'false');
        // Focar no overlay para acessibilidade
        closeButton.focus();
        // Prevenir scroll do body
        document.body.style.overflow = 'hidden';
        // Mostrar conteúdo HTML
        overlayWrapper.style.display = 'flex';
    }
    // Função para fechar o overlay
    function closeOverlay() {
        overlay.classList.remove('active');
        overlay.setAttribute('aria-hidden', 'true');
        // Armazenar a posição de rolagem atual
        if (isPDF) {
            lastScrollPosition = overlayWrapper.scrollTop;
        } else {
            lastScrollPosition = dynamicContent.scrollTop;
        }
        // Restaurar scroll do body
        document.body.style.overflow = '';
        // Esconder conteúdo HTML e PDF
        overlayContent.style.display = 'none';
        overlayWrapper.style.display = 'none';
    }
    // Fechar o overlay ao clicar fora do conteúdo
    function outsideClick(event) {
        if (event.target === overlay) {
            closeOverlay();
        }
    }
    // Fechar o overlay ao pressionar a tecla Esc
    function handleEsc(event) {
        if (event.key === 'Escape' && overlay.classList.contains('active')) {
            closeOverlay();
        }
    }
    // Adicionar event listeners
    closeButton.addEventListener('click', closeOverlay);
    overlay.addEventListener('click', outsideClick);
    document.addEventListener('keydown', handleEsc);
}
// Função que aguarda o carregamento do CSS, do DOM e a existência do elemento necessário
function startScript() {
    const linkElement = document.getElementById('style-link');
    const maxRetries = 100; // Limite de tentativas
    let attempts = 0;
    const checkResources = () => {
        const cssLoaded = linkElement.sheet;
        const domReady =
            document.readyState === 'interactive' || document.readyState === 'complete';
        const containerExists = document.getElementById('l-canvas-container') !== null;
        if (cssLoaded && domReady && containerExists) {
            console.log('Recursos carregados. Executando script...');
            setTimeout(createOverlay, 2000); // Aguarda 1 segundo antes de executar o script
        } else if (attempts >= maxRetries) {
            console.error(
                'Erro: Recursos necessários não foram carregados após várias tentativas.'
            );
        } else {
            attempts++;
            setTimeout(checkResources, 100);
        }
    };
    checkResources();
}
startScript();
