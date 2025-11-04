document.querySelectorAll('.buzzfeed-quiz').forEach(function (quiz) {
    // Usa o identificador único do quiz
    const quizId = quiz.getAttribute('data-quiz-id') || 'quiz';
    const respostasKey = `${quizId}_buzzFeedRespostas`;
    const resultadoKey = `${quizId}_buzzFeedResultado`;
    const pontuacaoKey = `${quizId}_quizPontuacaoBuzzFeed`;

    const questions = Array.from(quiz.querySelectorAll('.quiz-question'));

    // Inicializa feeds dinamicamente
    let feedbacksSet = new Set();
    questions.forEach(q => {
        q.querySelectorAll('.quiz-option').forEach(opt => {
            feedbacksSet.add(opt.getAttribute('data-feedback'));
        });
    });
    const pontuacaoBuzzFeed = {};
    feedbacksSet.forEach(feed => pontuacaoBuzzFeed[feed] = 0);

    // Limpa localStorage ao iniciar para este quiz
    localStorage.removeItem(respostasKey);
    localStorage.removeItem(resultadoKey);
    localStorage.removeItem(pontuacaoKey);

    // Busca o marcador correto para este quiz
    const marcador = quiz.previousElementSibling;
    const marcadorLis = marcador && marcador.classList.contains('marcador')
        ? marcador.querySelectorAll('li')
        : [];

    // Esconde a última bolinha do marcador no início (se existir)
    if (marcadorLis[questions.length - 1]) {
        marcadorLis[questions.length - 1].style.display = 'none';
    }

    // Esconde a última pergunta ao iniciar
    questions.forEach((q, i) => {
        if (i === questions.length - 1) {
            q.style.display = 'none';
        } else {
            q.style.display = (i === 0) ? 'block' : 'none';
        }
    });

    // Função para encontrar feeds empatados
    function getEmpatados(pontuacao) {
        const max = Math.max(...Object.values(pontuacao));
        return Object.keys(pontuacao).filter(feed => pontuacao[feed] === max);
    }

    // Função para mostrar a última pergunta apenas com opções dos feeds empatados
    function mostrarPerguntaDesempate(pergunta, empatados) {
        pergunta.style.display = 'block';
        pergunta.querySelectorAll('.quiz-option').forEach(opt => {
            const feed = opt.getAttribute('data-feedback');
            if (empatados.includes(feed)) {
                opt.closest('label').style.display = '';
            } else {
                opt.closest('label').style.display = 'none';
            }
        });
        // Mostra a última bolinha do marcador
        if (marcadorLis[questions.length - 1]) {
            marcadorLis[questions.length - 1].style.display = '';
        }
    }

    questions.forEach((question, qIndex) => {
        const confirmBtn = question.querySelector('.confirm-btn');
        const options = question.querySelectorAll('.quiz-option');

        // Desabilita o botão inicialmente
        confirmBtn.disabled = true;

        // Feedback visual de seleção
        options.forEach(opt => {
            opt.addEventListener('change', function () {
                options.forEach(o => o.closest('label').classList.remove('selected'));
                if (opt.checked) {
                    opt.closest('label').classList.add('selected');
                }

                const selected = !!question.querySelector('.quiz-option:checked');
                confirmBtn.disabled = !selected;
            });
        });

        confirmBtn.addEventListener('click', function () {
            const checked = question.querySelector('.quiz-option:checked');
            if (!checked) {
                alert('Selecione pelo menos uma opção!');
                return;
            }

            // Recupera respostas já salvas OU cria um array do tamanho das perguntas
            let respostas = JSON.parse(localStorage.getItem(respostasKey) || '[]');
            if (respostas.length < questions.length) {
                respostas = Array(questions.length).fill(null);
            }

            const feedback = checked.getAttribute('data-feedback');
            if (pontuacaoBuzzFeed.hasOwnProperty(feedback)) {
                pontuacaoBuzzFeed[feedback]++;
            }
            respostas[qIndex] = feedback;

            localStorage.setItem(respostasKey, JSON.stringify(respostas));

            question.style.display = 'none';

            // Lógica para mostrar a última pergunta apenas se houver empate
            if (qIndex + 1 === questions.length - 1) { // Após responder a penúltima pergunta
                const empatados = getEmpatados(pontuacaoBuzzFeed);
                if (empatados.length > 1 && questions[questions.length - 1]) {
                    mostrarPerguntaDesempate(questions[questions.length - 1], empatados);
                    if (marcadorLis[qIndex]) {
                        marcadorLis[qIndex].classList.remove('hide');
                        marcadorLis[qIndex].classList.add('checked');
                    }
                    return; // Não chama showResult ainda!
                } else {
                    // Não há empate, mostra o resultado imediatamente
                    showResult();
                    if (marcadorLis[qIndex]) {
                        marcadorLis[qIndex].classList.remove('hide');
                        marcadorLis[qIndex].classList.add('checked');
                    }
                    return;
                }
            }

            // Mostra próxima pergunta (se não for a última) ou resultado
            if (qIndex + 1 < questions.length) {
                // Só mostra a última pergunta se ela não foi filtrada por empate
                if (!(qIndex === questions.length - 2 && questions[questions.length - 1])) {
                    questions[qIndex + 1].style.display = 'block';
                }
            } else {
                showResult();
            }

            // Marca o marcador como respondido
            if (marcadorLis[qIndex]) {
                marcadorLis[qIndex].classList.remove('hide');
                marcadorLis[qIndex].classList.add('checked');
            }
        });
    });

    function showResult() {
        // Encontra o resultado com maior pontuação
        let max = -1, result = '';
        for (const [key, value] of Object.entries(pontuacaoBuzzFeed)) {
            if (value > max) {
                max = value;
                result = key;
            }
        }
        quiz.querySelectorAll('.quiz-modal').forEach(modal => modal.style.display = 'none');
        const modal = quiz.querySelector('.quiz-modal.feedback-' + result);
        if (modal) modal.style.display = 'flex';

        // Salva o resultado final e a pontuação no localStorage
        localStorage.setItem(resultadoKey, result);
        localStorage.setItem(pontuacaoKey, JSON.stringify(pontuacaoBuzzFeed));
    }

    quiz.querySelectorAll('.closeModal').forEach(btn => {
        btn.addEventListener('click', function () {
            quiz.querySelectorAll('.quiz-modal').forEach(modal => modal.style.display = 'none');
        });
    });
});