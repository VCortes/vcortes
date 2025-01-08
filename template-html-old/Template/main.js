// Função para fazer a requisição ao JSON
const requestDataFromJson = async () => {
    try {
        const response = await fetch('./data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const { names: dataFromJson } = await response.json();
        return dataFromJson;
    } catch (error) {
        console.error('Erro ao obter dados do JSON:', error);
        return null; // Retorna null ou um valor padrão em caso de erro
    }
};
// Função principal assíncrona para controlar o fluxo
const main = async () => {
    let dataFromJson;
    try {
        // Aguardar a obtenção dos dados
        dataFromJson = await requestDataFromJson();
    } catch (error) {
        console.error('Erro ao obter os dados:', error);
        await setDesktop(window.location.search); // Chama setDesktop em caso de erro
        return;
    }
    // Verificar se os dados foram obtidos com sucesso
    if (!dataFromJson) {
        console.error('Não foi possível obter os dados necessários.');
        await setDesktop(window.location.search);
        return;
    }
    // String com todos os query parameters da URL atual
    const queryString = window.location.search;
    // Obter os parâmetros da URL
    const urlParams = new URLSearchParams(queryString);
    const authorizationToken = urlParams.get('authorization');
    const userAgent =
        navigator.appVersion || navigator.platform || navigator.vendor || window.opera;
    const userPlatform = {};
    if (/windows phone/i.test(userAgent)) {
        userPlatform.os = 'Windows Phone';
    } else if (/Android/i.test(userAgent)) {
        userPlatform.os = 'Android';
    } else if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        userPlatform.os = 'iOS';
    }
    if (dataFromJson.length >= 1) {
        if (!dataFromJson[0]?.androidAvailable && !dataFromJson[0]?.iosAvailable) {
            userPlatform.os = 'Desktop';
        }
    }
    if (userPlatform.os !== 'Android' && userPlatform.os !== 'iOS') {
        await setDesktop(queryString);
    } else if (userPlatform.os === 'Android') {
        await setAndroid(dataFromJson, authorizationToken);
    } else if (userPlatform.os === 'iOS') {
        setiOS();
    }
};
// Função para configurar a plataforma Desktop
const setDesktop = async (queryString) => {
    // Apagar botão de redirecionamento
    const redirectButton = document.getElementById('redirect-button');
    if (redirectButton) redirectButton.remove();
    // URL do index-web.html
    const webglUrl = 'index-web.html' + queryString;
    // Elemento iframe
    const iframe = document.getElementById('webgl-iframe');
    if (iframe) {
        // Carrega URL no iframe
        iframe.src = webglUrl;
        // Adiciona o evento onload ao iframe
        iframe.onload = function () {
            transferContent(iframe);
        };
    }
};
// Função para transferir o conteúdo para dentro do iframe
const transferContent = (iframe) => {
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    if (!iframeDoc) {
        setTimeout(() => transferContent(iframe), 100);
        return;
    }
    const iframeBody = iframeDoc.body;
    if (!iframeBody) {
        setTimeout(() => transferContent(iframe), 100);
        return;
    }
    // Obtém o canvas
    const canvas = iframeDoc.querySelector('canvas');
    if (canvas) {
        // Remove os atributos width e height
        canvas.removeAttribute('width');
        canvas.removeAttribute('height');
        canvas.removeAttribute('style');
        // Remove o canvas do seu elemento pai atual
        const parent = canvas.parentNode;
        if (parent) {
            parent.removeChild(canvas);
        }
        // Remove todos os elementos do body, garantindo que o canvas seja o único
        iframeBody.replaceChildren();
        // Cria um #content
        const content = iframeDoc.createElement('div');
        content.id = 'l-content';
        content.className = 't-content';
        iframeBody.appendChild(content);
        // Cria um container para o canvas
        const canvasContainer = iframeDoc.createElement('div');
        canvasContainer.id = 'l-canvas-container';
        content.appendChild(canvasContainer);
        // Insere o canvas dentro do canvas-container
        canvasContainer.appendChild(canvas);
        // Obter referências aos elementos que serão movidos
        const scriptButton = document.getElementById('scriptButton');
        const fullscreenButton = document.getElementById('fullscreen-button');
        const overlay = document.getElementById('overlay');
        // Move elementos para dentro do contêiner
        try {
            if (fullscreenButton) content.appendChild(fullscreenButton);
            if (scriptButton) canvasContainer.appendChild(scriptButton);
            if (overlay) canvasContainer.appendChild(overlay);
        } catch (error) {
            console.log('Erro ao mover elementos para dentro do iframe:', error);
        }
        // Adicionar folhas de estilo ao iframe
        appendOnHeadById('style-link', iframeDoc);
        appendOnHeadById('font-link', iframeDoc);
        // Inserir script no iframe
        const scriptIframe = iframeDoc.createElement('script');
        scriptIframe.src = 'Template/overlay.js'; // Ajuste o caminho se necessário
        iframeDoc.body.appendChild(scriptIframe);
    }
};
// Função auxiliar para adicionar elementos ao head do iframe
const appendOnHeadById = (id, iframeDoc) => {
    const element = document.getElementById(id);
    if (element && iframeDoc) {
        const clone = element.cloneNode(true);
        iframeDoc.head.appendChild(clone);
    }
};
// Função para configurar a plataforma Android
const setAndroid = async (dataFromJson, authorizationToken) => {
    if (dataFromJson.length === 1) {
        console.log('Executando setAndroid');
        const labsAppEndpoint = `https://labsapp.grupoa.education/laboratory?laboratoryId=${dataFromJson[0]?.laboratoryId}`;
        try {
            const response = await fetch(labsAppEndpoint);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const [{ endpoint }] = await response.json();
            if (authorizationToken) {
                const requestToAccessFromMarketplace = `https://labsapp.grupoa.education/marketplace/store?id=${dataFromJson[0]?.laboratoryId}&token=${authorizationToken}`;
                await fetch(requestToAccessFromMarketplace);
            }
            setTimeout(() => {
                window.parent.location.href = endpoint;
            }, 500);
            // Atualizar a UI
            document.getElementById('webgl-iframe')?.classList.add('is-hidden');
            document.getElementById('fullscreen-button')?.classList.add('is-hidden');
            document.getElementById('scriptButton')?.classList.add('is-hidden');
            const redirectBtn = document.getElementById('redirect-button');
            if (redirectBtn) {
                redirectBtn.classList.remove('is-hidden');
                redirectBtn.addEventListener('click', () => {
                    window.parent.location.href = endpoint;
                });
            }
        } catch (error) {
            console.error('Erro em setAndroid:', error);
        }
    }
};
// Função para configurar a plataforma iOS
const setiOS = () => {
    document.getElementById('webgl-iframe')?.classList.add('is-hidden');
    document.getElementById('fullscreen-button')?.classList.add('is-hidden');
    document.getElementById('scriptButton')?.classList.add('is-hidden');
    const redirectButton = document.getElementById('redirect-button');
    if (redirectButton) {
        redirectButton.classList.remove('is-hidden');
        redirectButton.innerText = 'Aplicação não disponível para dispositivos iOS.';
    }
};
// Executar a função principal
main();
