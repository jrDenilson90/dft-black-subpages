const scriptURL = 'https://script.google.com/macros/s/AKfycbw0slY3-HzeN8bhmT6jqXi2lWMq0KjkqoZcmYnvZZ4oYG_aY-zNdjHJujAbZ4uabPeF1Q/exec';
const form = document.forms['contact-form'];
const loadingElement = document.querySelector('.loading');
const modal = document.querySelector('.modal-dados');
const closeModal = document.querySelector('.modal-fechar');

closeModal.addEventListener('click', function () {
    modal.style.display = 'none';
});

form.addEventListener('submit', e => {
    loadingElement.style.display = 'flex';
    e.preventDefault();

    const nome = form.nome.value;
    const email = form.email.value;
    const numero = form.numero.value;

    // Agora pega direto do form:
    const campaign = form.getAttribute('data-campaign');

    // Obtendo a data atual formatada
    const dataAtual = new Date();
    const dia = String(dataAtual.getDate()).padStart(2, '0');
    const mes = String(dataAtual.getMonth() + 1).padStart(2, '0');
    const ano = dataAtual.getFullYear();
    const dataFormatada = `${dia}/${mes}/${ano}`;

    // Coletar todos os checkboxes de categorias
    const checkboxes1 = document.querySelectorAll('.flexCategories input[type="checkbox"]:checked');
    const categorias = Array.from(checkboxes1).map(checkbox => checkbox.value);

    // Coletar o gênero
    const checkboxes2 = document.querySelectorAll('.flexOptions input[type="checkbox"]:checked');
    const genero = Array.from(checkboxes2).map(checkbox => checkbox.value);

    // Validações
    if (!validarNome(nome)) {
        alert("Nome inválido.");
        return;
    }
    if (!validarNumero(numero)) {
        alert("Número deve ter no mínimo 10 e máximo de 11 dígitos.");
        return;
    }
    if (!validarEmail(email)) {
        alert("Email inválido.");
        return;
    }
    if (!validarCategorias(categorias)) {
        alert("Selecione pelo menos uma categoria.");
        return;
    }
    if (!validarGenero(genero)) {
        alert("Selecione pelo menos um gênero.");
        return;
    }

    // Se todas as validações passarem, prepara os dados para envio
    const categoriesString = categorias.join(', ');
    const formData = new FormData(form);
    formData.append('categoriesString', categoriesString);
    formData.append('campanha', campaign); // Nome igual ao da coluna na planilha
    formData.append('data', dataFormatada);

    // Envio do formulário
    fetch(scriptURL, { method: 'POST', body: formData })
        .then(response => {
            if (response.ok) {
                loadingElement.style.display = 'none';
                modal.style.display = 'flex';
                form.reset();
            } else {
                throw new Error('Erro ao enviar os dados.');
            }
        })
        .catch(error => console.error('Error!', error.message));
});

document.querySelectorAll('.template-formulario-crm .btnCat').forEach(function(btn) {
    // Pega o texto do <label> filho
    const label = btn.querySelector('label');
    const labelText = label ? label.textContent.trim() : '';

    // Define o aria-label inicial na .btnCat
    btn.setAttribute('aria-label', 'Categoria ' + labelText);

    btn.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            const checkbox = btn.querySelector('input[type="checkbox"]');
            if (checkbox) {
                checkbox.checked = !checkbox.checked;
                if (checkbox.checked) {
                    btn.setAttribute('aria-label', 'Categoria ' + labelText + ' selecionada');
                } else {
                    btn.setAttribute('aria-label', 'Categoria ' + labelText);
                }
            }
        }
    });
});

function validarNome(nome) {
    const regex = /^[A-Za-zÀ-ÿ\s]+$/;
    return nome.length >= 2 && regex.test(nome);
}

const inputTelefone = document.getElementById('telefone');

inputTelefone.addEventListener('input', function () {
    let value = this.value;
    if (!value) return;

    value = value.replace(/\D/g, '');
    value = value.replace(/(\d{2})(\d)/, "($1) $2");
    value = value.replace(/(\d)(\d{4})$/, "$1-$2");

    this.value = value;
});

function validarNumero(numero) {
    const apenasNumeros = numero.replace(/\D/g, '');
    const regex = /^\d{10,11}$/;
    return regex.test(apenasNumeros);
}

function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function validarCategorias(categorias) {
    return categorias.length > 0;
}

function validarGenero(genero) {
    return genero.length > 0;
}