const die1btn = document.querySelector('#die1');
const die2btn = document.querySelector('#die2');
const die3btn = document.querySelector('#die3');
const die4btn = document.querySelector('#die4');
const die5btn = document.querySelector('#die5');
const rollAll = document.querySelector('button');
const outcome = document.querySelector('h2');
const hint = document.querySelector('p');
const reload = document.querySelector('#reload');

const elems = [die1btn, die2btn, die3btn, die4btn, die5btn];

const sideRotations = {
  1: 'rotateX(-15deg) rotateY(-15deg)',
  2: 'rotateX(-105deg) rotateY(0deg) rotateZ(-15deg)',
  3: 'rotateX(-15deg) rotateY(75deg)',
  4: 'rotateX(0deg) rotateY(-105deg) rotateZ(15deg)',
  5: 'rotateX(75deg) rotateY(0deg) rotateZ(15deg)',
  6: 'rotateX(165deg) rotateY(15deg)',
}

let results = [];

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
      elems[j].style.transform = sideRotations[sequence[i - 1]];
    }, i * 250);
  }

  setTimeout(() => {
    outcome.textContent = getHands();
  }, 3000);
}

rollAll.addEventListener('click', () => {
  rollAll.style.display = 'none';

  results = [];
  outcome.textContent = '';
  elems.forEach((elem, i) => roll(i));

  setTimeout(() => {
    outcome.textContent = `Outcome: ${getHands()}`;
    hint.style.display = 'block';
    reload.style.display = 'block';
  }, 3000);

  for (let i = 0; i < elems.length; i++) {
    elems[i].addEventListener('click', () => {
      roll(i);
      Array.from(elems[i].children).forEach(child => child.classList.add('rerolled'));
    }, { once: true });
  }

  reload.addEventListener('click', () => window.location.reload());
});
