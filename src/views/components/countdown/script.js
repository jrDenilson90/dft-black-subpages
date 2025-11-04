const countdownEl = document.querySelector('.countdown-dft');
const dataCountdown = countdownEl.getAttribute('data-countdown');
const countToDate = new Date(dataCountdown);

let previousTimeBetweenDates;
let intervalClock = setInterval(() => {
    const currentDate = new Date();
    const timeBetweenDates = Math.ceil((countToDate - currentDate) / 1000);
    timeBetweenDates <= 0 ? clearInterval(intervalClock) : flipAllCards(timeBetweenDates);

    previousTimeBetweenDates = timeBetweenDates;
}, 250);

function flipAllCards(time) {
    const seconds = time % 60;
    const minutes = Math.floor(time / 60) % 60;
    const hours = Math.floor((time / 3600) % 24);
    const days = Math.floor(time / 3600 / 24);

    flip(document.querySelector('[data-days-hundreds]'), Math.floor(days / 100));
    flip(document.querySelector('[data-days-tens]'), Math.floor(days / 10) % 10);
    flip(document.querySelector('[data-days-ones]'), days % 10);
    flip(document.querySelector('[data-hours-tens]'), Math.floor(hours / 10));
    flip(document.querySelector('[data-hours-ones]'), hours % 10);
    flip(document.querySelector('[data-minutes-tens]'), Math.floor(minutes / 10));
    flip(document.querySelector('[data-minutes-ones]'), minutes % 10);
    flip(document.querySelector('[data-seconds-tens]'), Math.floor(seconds / 10));
    flip(document.querySelector('[data-seconds-ones]'), seconds % 10);
}

function flip(flipCard, newNumber) {
    if (!flipCard) return;
    const topHalf = flipCard.querySelector('.top');
    const bottomHalf = flipCard.querySelector('.bottom');
    const startNumber = parseInt(topHalf.textContent) || 0;
    if (newNumber === startNumber) return;
  
    // Cria as metades animadas
    const topFlip = document.createElement('div');
    topFlip.classList.add('top-flip');
    topFlip.textContent = startNumber;
  
    const bottomFlip = document.createElement('div');
    bottomFlip.classList.add('bottom-flip');
    bottomFlip.textContent = newNumber;
  
    // Quando a animação do topo começa, troca o .top para o novo número
    topFlip.addEventListener('animationstart', () => {
      topHalf.textContent = newNumber;
    });
  
    // Quando a animação do topo termina, remove o elemento animado
    topFlip.addEventListener('animationend', () => {
      topFlip.remove();
    });
  
    // Quando a animação do bottom termina, troca o .bottom para o novo número e remove o animado
    bottomFlip.addEventListener('animationend', () => {
      bottomHalf.textContent = newNumber;
      bottomFlip.remove();
    });
  
    // Adiciona as metades animadas
    flipCard.append(topFlip, bottomFlip);
  }