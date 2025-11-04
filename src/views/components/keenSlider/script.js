console.log('componente-keenSlider');

// Função helper para decodificar HTML entities E corrigir JSON malformado do Pug
function fixAndDecodeBreakpoints(str) {
    // 1. Decodifica HTML entities (&quot; → ")
    const textArea = document.createElement('textarea');
    textArea.innerHTML = str;
    let decoded = textArea.value;
    
    // 2. Corrige JSON sem aspas nas chaves
    // Adiciona aspas duplas em: {palavra: ou ,palavra: ou ,(palavra):
    decoded = decoded.replace(/([{,]\s*)([a-zA-Z0-9\-_().:\s]+?)(\s*):/g, function(match, prefix, key, space) {
        const trimmedKey = key.trim();
        // Se já tem aspas, mantém
        if (trimmedKey.startsWith('"') || trimmedKey.startsWith("'")) {
            return match;
        }
        // Adiciona aspas duplas
        return prefix + '"' + trimmedKey + '"' + space + ':';
    });
    
    return decoded;
}

// Inicializa todos sliders dinamicamente, cada um com suas opções/plugins
document.querySelectorAll(".keen-slider").forEach(function (sliderElem) {
    const loop = sliderElem.getAttribute("data-loop") === "true";
    const autoplay = sliderElem.getAttribute("data-autoplay") === "true";
    const perView = sliderElem.getAttribute("data-per-view");
    const spacing = sliderElem.getAttribute("data-spacing");
    const animationType = sliderElem.getAttribute("data-animation-type");
    const renderMode = sliderElem.getAttribute("data-render-mode");
    const slides = Array.from(sliderElem.querySelectorAll('.keen-slider__slide'));

    // console.log(document.querySelector('.component-keen-slider').getAttribute('data-breakpoints'));

    let slidesConf;
    if (perView || spacing) {
        slidesConf = {};
        if (perView) slidesConf.perView = Number(perView);
        if (spacing) slidesConf.spacing = Number(spacing);
    }

    // Responsivo
    let breakpoints = undefined;
    const breakpointsAttr = sliderElem.getAttribute("data-breakpoints");
    if (breakpointsAttr) {
        try {
            // Corrige e decodifica o JSON malformado do Pug
            const fixed = fixAndDecodeBreakpoints(breakpointsAttr);
            breakpoints = JSON.parse(fixed);
        } catch (e) {
            console.error("KeenSlider: Erro ao interpretar data-breakpoints", e);
            console.error("Valor original:", breakpointsAttr);
        }
    }

    // Plugins
    const plugins = [navigation];
    if (autoplay) plugins.push(autoplayPlugin);

    // Opções finais
    const options = {
        loop,
        mode: "free-snap",
        slides: slidesConf,
    };
    if (breakpoints) options.breakpoints = breakpoints;
    if (renderMode) options.renderMode = renderMode;

    if (animationType) {
        const animation = { duration: 5000, easing: t => t };
        options.drag = false;
        options.renderMode = "performance";
        options.created = (s) => s.moveToIdx(1, true, animation);
        options.updated = (s) => s.moveToIdx(s.track.details.abs + 1, true, animation);
        options.animationEnded = (s) => s.moveToIdx(s.track.details.abs + 1, true, animation);
    }

    slides.forEach(function (slide, idx) {
        Array.from(slide.classList).forEach(cls => {
            if (cls.startsWith('number-slide')) slide.classList.remove(cls);
        });
        slide.classList.add(`number-slide${idx + 1}`);
    });

    Object.keys(options).forEach(key => options[key] === undefined && delete options[key]);

    new KeenSlider(sliderElem, options, plugins);

    // LOADING PARA AS IMAGENS DO BANNER DESTE SLIDER!
    const boxLoading = sliderElem.querySelector('.boxLoading');
    const images = Array.from(sliderElem.querySelectorAll('img')).filter(img => !img.closest('.ks-arrow'));
    
    if (!boxLoading || images.length === 0) return;

    let loadedCount = 0;
    const totalImages = images.length;

    function checkAllImagesLoaded() {
        loadedCount++;
        // console.log(`[KeenSlider] Imagens carregadas: ${loadedCount}/${totalImages}`);
        
        if (loadedCount === totalImages) {
            // console.log('[KeenSlider] Todas as imagens carregadas! Removendo boxLoading...');
            boxLoading.classList.add('zoomOut');
            setTimeout(() => {
                if (boxLoading && boxLoading.parentNode) {
                    boxLoading.parentNode.removeChild(boxLoading);
                    // console.log('[KeenSlider] boxLoading removido com sucesso');
                }
            }, 500);
        }
    }

    images.forEach(function(img) {
        if (img.complete && img.naturalWidth > 0) {
            // console.log('[KeenSlider] Imagem já carregada (cache):', img.src);
            checkAllImagesLoaded();
        } else {
            // console.log('[KeenSlider] Aguardando carregamento:', img.src);
            img.addEventListener('load', checkAllImagesLoaded, { once: true });
            img.addEventListener('error', checkAllImagesLoaded, { once: true });
        }
    });
});
// Plugin de navegação para KeenSlider
function navigation(slider) {
    let dots, arrowLeft, arrowRight;

    function markup(remove) {
        dotMarkup(remove);
        arrowMarkup(remove);
    }

    function arrowMarkup(remove) {
        arrowLeft = slider.container.querySelector(".ks-arrow--prev");
        arrowRight = slider.container.querySelector(".ks-arrow--next");

        if (remove) {
            if (arrowLeft) arrowLeft.replaceWith(arrowLeft.cloneNode(true));
            if (arrowRight) arrowRight.replaceWith(arrowRight.cloneNode(true));
            return;
        }

        if (arrowLeft) {
            arrowLeft.addEventListener("click", () => slider.prev());
        }
        if (arrowRight) {
            arrowRight.addEventListener("click", () => slider.next());
        }
    }

    function dotMarkup(remove) {
        dots = slider.container.querySelector(".ks-dots");
        if (!dots) return;

        if (remove) {
            dots.innerHTML = '';
            return;
        }

        dots.innerHTML = '';
        slider.track.details.slides.forEach((_e, idx) => {
            const dot = document.createElement("button");
            dot.className = "ks-dot";
            dot.type = "button";
            dot.setAttribute("aria-label", `Slide ${idx + 1}`);
            dot.addEventListener("click", () => slider.moveToIdx(idx));
            dots.appendChild(dot);
        });
    }

    function updateClasses() {
        const slide = slider.track.details.rel;
        const slidesCount = slider.track.details.slides.length;
        const slidesPerView = slider.options.slides && slider.options.slides.perView ? slider.options.slides.perView : 1;
        const isLoop = slider.options.loop;

        // O índice do último "página"
        const lastActive = slidesCount - slidesPerView;

        if (!isLoop) {
            if (arrowLeft) {
                if (slide === 0) {
                    arrowLeft.classList.add("arrow--disabled");
                } else {
                    arrowLeft.classList.remove("arrow--disabled");
                }
            }
            if (arrowRight) {
                if (slide >= lastActive) {
                    arrowRight.classList.add("arrow--disabled");
                } else {
                    arrowRight.classList.remove("arrow--disabled");
                }
            }
        } else {
            if (arrowLeft) arrowLeft.classList.remove("arrow--disabled");
            if (arrowRight) arrowRight.classList.remove("arrow--disabled");
        }

        if (dots) {
            Array.from(dots.children).forEach((dot, idx) => {
                idx === slide
                    ? dot.classList.add("ks-dot--active")
                    : dot.classList.remove("ks-dot--active");
            });
        }
    }

    slider.on("created", () => {
        markup();
        updateClasses();
    });
    slider.on("optionsChanged", () => {
        markup(true);
        markup();
        updateClasses();
    });
    slider.on("slideChanged", () => {
        updateClasses();
    });
    slider.on("destroyed", () => {
        markup(true);
    });
}

// Autoplay plugin – adiciona autoplay apenas se data-autoplay="true"
function autoplayPlugin(slider) {
    let timeout;
    let mouseOver = false;

    function clearNextTimeout() {
        clearTimeout(timeout);
    }
    function nextTimeout() {
        clearTimeout(timeout);
        if (mouseOver) return;
        timeout = setTimeout(() => {
            slider.next();
        }, 5000);
    }
    slider.on("created", () => {
        slider.container.addEventListener("mouseover", () => {
            mouseOver = true;
            clearNextTimeout();
        });
        slider.container.addEventListener("mouseout", () => {
            mouseOver = false;
            nextTimeout();
        });
        nextTimeout();
    });
    slider.on("dragStarted", clearNextTimeout);
    slider.on("animationEnded", nextTimeout);
    slider.on("updated", nextTimeout);
}