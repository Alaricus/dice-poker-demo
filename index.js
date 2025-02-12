const die1 = document.querySelector('#die1');
const die2 = document.querySelector('#die2');
const die3 = document.querySelector('#die3');
const die4 = document.querySelector('#die4');
const die5 = document.querySelector('#die5');
const rollAll = document.querySelector('#roll-all');
const lockRow = document.querySelector('.lock-row');
const outcome = document.querySelector('h2');
const hint = document.querySelector('p');
const reload = document.querySelector('#reload');
const reroll = document.querySelector('#reroll');
const lock1 = document.querySelector('#lock1');
const lock2 = document.querySelector('#lock2');
const lock3 = document.querySelector('#lock3');
const lock4 = document.querySelector('#lock4');
const lock5 = document.querySelector('#lock5');

const dice = [die1, die2, die3, die4, die5];
const locks = [lock1, lock2, lock3, lock4, lock5];

const sideRotations = {
  1: 'rotateX(-15deg) rotateY(-15deg)',
  2: 'rotateX(-105deg) rotateY(0deg) rotateZ(-15deg)',
  3: 'rotateX(-15deg) rotateY(75deg)',
  4: 'rotateX(0deg) rotateY(-105deg) rotateZ(15deg)',
  5: 'rotateX(75deg) rotateY(0deg) rotateZ(15deg)',
  6: 'rotateX(165deg) rotateY(15deg)',
};

const holds = [true, true, true, true, true];

let results = [];

const lockSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" width="30" height="30" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" stroke="currentColor">
  <path d="M5 13a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-6z"></path>
  <path d="M11 16a1 1 0 1 0 2 0a1 1 0 0 0 -2 0"></path>
  <path d="M8 11v-4a4 4 0 1 1 8 0v4"></path>
</svg>`;

const unlockSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" width="30" height="30" stroke-width="2">
  <path d="M5 11m0 2a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2z"></path>
  <path d="M12 16m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
  <path d="M8 11v-5a4 4 0 0 1 8 0"></path>
</svg>`;

locks.forEach(lock => {
  lock.innerHTML = lockSVG;
})

const getHands = () => {
  const scores = [...results];
  scores.sort();

  const counts = scores.reduce((acc, cur) => {
    if (acc[cur]) {
      acc[cur] = acc[cur] + 1;
    } else {
      acc[cur] = 1;
    }
    return acc;
  }, {});

  if (Object.values(counts).includes(5)) {
    return 'Five-of-a-Kind';
  }

  if (Object.values(counts).includes(4)) {
    return 'Four-of-a-Kind';
  }

  if (Object.values(counts).includes(3) && Object.values(counts).includes(2)) {
    return 'Full House';
  }

  if (JSON.stringify(Object.keys(counts)) === '["2","3","4","5","6"]') {
    return 'Six High Straight';
  }

  if (JSON.stringify(Object.keys(counts)) === '["1","2","3","4","5"]') {
    return 'Five High Straight';
  }

  if (Object.values(counts).includes(3)) {
    return 'Three-of-a-Kind';
  }

  if (Object.values(counts).filter(count => count === 2).length === 2) {
    return 'Two Pairs';
  }

  if (Object.values(counts).includes(2)) {
    return 'Pair';
  }

  return 'Nothing'
};

const roll = (j) => {
  const sequence = [Math.floor(Math.random() * 6 + 1)];
  while (sequence.length < 10) {
    const randomSide = Math.floor(Math.random() * 6 + 1);
    if (sequence[sequence.length - 1] !== randomSide) {
      sequence.push(randomSide);
    }
  }

  results[j] = sequence[sequence.length - 1];

  for (let i = 1; i < sequence.length + 1; i++) {
    setTimeout(() => {
      dice[j].style.transform = sideRotations[sequence[i - 1]];
    }, i * 250);
  }

  setTimeout(() => {
    outcome.textContent = `Outcome: ${getHands()}`;
  }, 3000);
}

rollAll.addEventListener('click', () => {
  rollAll.style.display = 'none';

  results = [];
  outcome.textContent = '';
  dice.forEach((die, i) => roll(i));

  setTimeout(() => {
    outcome.textContent = `Outcome: ${getHands()}`;
    hint.style.display = 'block';
    reload.style.display = 'block';
    reroll.style.display = 'block';
    lockRow.style.display = 'flex';
  }, 3000);

  for (let i = 0; i < locks.length; i++) {
    locks[i].addEventListener('click', () => {
      Array.from(locks[i].children).forEach(() => {
        if (holds[i]) {
          locks[i].classList.replace('locked', 'unlocked');
          locks[i].innerHTML = unlockSVG;
          holds[i] = false;
        } else {
          locks[i].classList.replace('unlocked', 'locked');
          locks[i].innerHTML = lockSVG;
          holds[i] = true;
        }
      });
      console.log(holds);
    });
  }

  reroll.addEventListener('click', () => {
    lockRow.style.display = 'none';
    reroll.style.display = 'none';
    holds.forEach((hold, index) => {
      if (!hold) { roll(index) }
    })
  });

  reload.addEventListener('click', () => window.location.reload());
});
