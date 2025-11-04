document.querySelectorAll('.most_loved_tabs').forEach(function (tabsGroup) {
    const radios = tabsGroup.querySelectorAll('input[type="radio"]');
    const contents = tabsGroup.querySelectorAll('.tabContent');
    radios.forEach((radio, idx) => {
        radio.addEventListener('change', function () {
            if (radio.checked) {
                contents.forEach((content, cidx) => {
                    content.style.display = (idx === cidx) ? 'flex' : 'none';
                });
            }
        });
        // Inicializa: mostra só o conteúdo do radio checked
        if (radio.checked) {
            contents.forEach((content, cidx) => {
                content.style.display = (idx === cidx) ? 'flex' : 'none';
            });
        }
    });
});