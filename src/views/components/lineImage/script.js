console.log('componente-lineImage');

document.querySelectorAll('.component-lineImage').forEach(function(component) {
    const images = component.querySelectorAll('img.image');
    const boxLoading = component.querySelector('.boxLoading');
    
    if (!boxLoading || images.length === 0) return;

    let loadedCount = 0;
    const totalImages = images.length;

    function checkAllImagesLoaded() {
        loadedCount++;
        // console.log(`Imagens carregadas: ${loadedCount}/${totalImages}`);
        
        // Remove o loading quando TODAS as imagens carregarem
        if (loadedCount === totalImages) {
            // console.log('Todas as imagens carregadas! Removendo boxLoading...');
            boxLoading.classList.add('zoomOut');
            setTimeout(() => {
                if (boxLoading && boxLoading.parentNode) {
                    boxLoading.parentNode.removeChild(boxLoading);
                    // console.log('boxLoading removido com sucesso');
                }
            }, 400); // tempo igual à animação CSS
        }
    }

    // Para cada imagem, verifica se já está carregada ou aguarda
    images.forEach(function(img) {
        // Adiciona acessibilidade ao link
        const link = img.closest('a');
        if (link && img.alt) {
            link.setAttribute(
                'aria-label',
                img.alt + ' — ao clicar você será direcionado para outra página'
            );
        }

        // Se já está carregada (cache)
        if (img.complete && img.naturalWidth > 0) {
            // console.log('Imagem já carregada (cache):', img.src);
            checkAllImagesLoaded();
        } else {
            // Aguarda o carregamento
            // console.log('Aguardando carregamento:', img.src);
            img.addEventListener('load', checkAllImagesLoaded, { once: true });
            img.addEventListener('error', checkAllImagesLoaded, { once: true });
        }
    });
});