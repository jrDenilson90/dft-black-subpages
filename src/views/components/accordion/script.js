document.querySelectorAll('.accordionComponent .accordion-title').forEach(function (button) {
    button.addEventListener('click', function () {
        const isExpanded = button.getAttribute('aria-expanded') === 'true';
        const accordionComponent = button.closest('.accordionComponent');

        // Lógica de "Single-Open" (Fecha todos os outros)
        // Antes de abrir um novo, feche todos os outros botões do mesmo grupo.
        accordionComponent.querySelectorAll('.accordion-title').forEach(btn => {
            if (btn !== button) {
                btn.setAttribute('aria-expanded', 'false');
            }
        });

        // Lógica de "Toggle" (Abre ou Fecha o item clicado)
        // Se estava fechado (false), abre (true). Se estava aberto, fecha (false).
        if (isExpanded) {
            button.setAttribute('aria-expanded', 'false'); // Fecha
        } else {
            button.setAttribute('aria-expanded', 'true'); // Abre
        }
    });

    // Para acessibilidade, buttons não precisam de 'keydown' para Enter/Space,
    // o navegador já lida com isso. Apenas garanta que ele é focável.
});