// Seleciona todos os elementos listados e insere o tabindex
const selectorsAccessibility = [
    '.dafitiStructure .component-headerLp img',
    '.dafitiStructure .component-lineImage a',
    '.dafitiStructure .template-formulario-crm .flexInputs input, .dafitiStructure .template-formulario-crm p, .dafitiStructure .template-formulario-crm p a, .dafitiStructure .template-formulario-crm .flexCategories .btnCat, .dafitiStructure .template-formulario-crm .flexOptions .btnCat, .dafitiStructure .template-formulario-crm .submit, .dafitiStructure .template-formulario-crm .modal-dados .textModal, .dafitiStructure .template-formulario-crm .modal-dados .modal-fechar',
    '.dafitiStructure .accordionComponent .accordion label, .dafitiStructure .accordionComponent .accordion .accordion-content',
    '.dafitiStructure .flip-cards-container .flip-card'
];
  
const itensAccessibility = document.querySelectorAll(selectorsAccessibility.join(', '));

itensAccessibility.forEach((element, index) => {
    // Define tabindex sequencialmente a partir de 1
    // element.setAttribute('tabindex', index + 1);
    element.setAttribute('tabindex', '0');

    // Adiciona aria-live="polite" apenas se necessário
    // Descomente a linha abaixo se o conteúdo do elemento for dinâmico
    // element.setAttribute('aria-live', 'polite');
});