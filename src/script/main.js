window.dataLayer = window.dataLayer || [];

window.dataLayer.push({
    event: 'page_view_ga4',
    page_path: window.location.pathname,
    page_location: window.location.href,
    page_title: `ecommerce - content - ${document.title}`
});

const glitchContainersInfinite = document.querySelectorAll('.glitch-img-infinite');
const glitchContainersText = document.querySelectorAll('.glitch');
const NUM_COPIES = 9;

glitchContainersInfinite.forEach(container => {
    const originalLine = container.querySelector('.line');

    if (!originalLine || container.dataset.hasBeenDuplicated) {
        return;
    }

    for (let i = 0; i < NUM_COPIES; i++) {
        const newLine = originalLine.cloneNode(true);
        
        container.appendChild(newLine);
    }

    container.dataset.hasBeenDuplicated = 'true';
});

glitchContainersText.forEach(container => {
    // 1. Encontra o H2 original
    const originalLine = container.querySelector('.line');

    if (!originalLine || container.dataset.hasBeenDuplicated) {
        return;
    }

    // 2. Cria a div 'copy'
    const copyDiv = document.createElement('div');
    // copyDiv.classList.add('copy');
    
    // As 9 cópias virão antes desta div, mas a div 'copy' também será injetada.
    
    // 3. Obtém o conteúdo interno (OFERTAS <span>EXCLUSIVAS</span>)
    const innerContent = originalLine.innerHTML;
    
    // Ponto de Referência para Inserção
    // Usamos o h2 original como ponto de referência para inserir os novos elementos logo após ele.
    let referenceNode = originalLine; 

    // 4. Gera as 9 cópias e as insere individualmente no contêiner, APÓS o elemento anterior
    for (let i = 0; i < NUM_COPIES; i++) {
        // Cria a cópia (DIV)
        const newLine = document.createElement('div'); 
        newLine.classList.add('line');
        newLine.innerHTML = innerContent;
        
        // Insere a nova linha logo após o último elemento inserido (ou o H2 original na primeira iteração)
        referenceNode.after(newLine);
        
        // Atualiza o ponto de referência para que a próxima cópia seja inserida depois desta
        referenceNode = newLine; 
    }
    
    // 5. Insere a div 'copy' por último, para que ela fique no final da lista de irmãos
    // O último elemento que inserimos foi a 9ª cópia, então a div 'copy' virá depois dela.
    referenceNode.after(copyDiv);

    // 6. Marca o container como duplicado
    container.dataset.hasBeenDuplicated = 'true';
});

const glitchContainers = document.querySelectorAll('.glitch-img');

glitchContainers.forEach(container => {
    const originalLine = container.querySelector('.line');

    if (!originalLine || container.dataset.hasBeenDuplicated) {
        return;
    }

    for (let i = 0; i < NUM_COPIES; i++) {
        const newLine = originalLine.cloneNode(true);
        container.appendChild(newLine);
    }

    container.dataset.hasBeenDuplicated = 'true';
});

// Função para adicionar/remover classe 'block' de forma aleatória
function randomGlitchEffect() {
    glitchContainers.forEach(container => {
        const allLines = container.querySelectorAll('.line');
        
        // Decide aleatoriamente se TODOS os .line deste container terão a classe 'block'
        const shouldAddBlock = Math.random() > 0.5;
        
        allLines.forEach(line => {
            if (shouldAddBlock) {
                line.classList.add('block');
            } else {
                line.classList.remove('block');
            }
        });
    });
}

// Defina o intervalo em milissegundos (exemplo: 3000 = 3 segundos)
const INTERVAL_MS = 2000;

// Executa a função a cada X segundos
setInterval(randomGlitchEffect, INTERVAL_MS);

// Executa uma vez imediatamente ao carregar
randomGlitchEffect();