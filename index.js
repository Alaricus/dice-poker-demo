const [pcDie1, pcDie2, pcDie3, pcDie4, pcDie5, userDie1, userDie2, userDie3, userDie4, userDie5] = document.querySelectorAll('.die');
const rollAll = document.querySelector('#roll-all');
const lockRow = document.querySelector('.lock-row');
const [pcOutcome, userOutcome] = document.querySelectorAll('h2');
const hint = document.querySelector('p');
const reload = document.querySelector('#reload');
const reroll = document.querySelector('#reroll');
const [lock1, lock2, lock3, lock4, lock5] = document.querySelectorAll('input[type=checkbox]');

const pcDice = [pcDie1, pcDie2, pcDie3, pcDie4, pcDie5];
const userDice = [userDie1, userDie2, userDie3, userDie4, userDie5];
const locks = [lock1, lock2, lock3, lock4, lock5];

const sideRotations = {
  1: 'rotateX(-15deg) rotateY(-15deg)',
  2: 'rotateX(-105deg) rotateY(0deg) rotateZ(-15deg)',
  3: 'rotateX(-15deg) rotateY(75deg)',
  4: 'rotateX(0deg) rotateY(-105deg) rotateZ(15deg)',
  5: 'rotateX(75deg) rotateY(0deg) rotateZ(15deg)',
  6: 'rotateX(165deg) rotateY(15deg)',
};

let pcResults = [];
let userResults = [];
let pcHandRank = 0;
let userHandRank = 0;

const suggestionsToHold = (toBeat) => {
  let indicesToReroll = [];

  if (toBeat === 'Nothing' && getHands(pcResults, 'pc') !== 'Nothing') {
    return;
  }

  const hand = lookupTable[[...pcResults].sort().join('')];
  const holdList = (hand[toBeat === 'Nothing' ? 'Pair' : toBeat]).toString().split('');
  pcResults.forEach((result, index) => {
    if (!holdList.includes(result.toString())) {
      indicesToReroll.push(index);
    }
  });

  indicesToReroll.forEach((i) => roll(pcDice, i, 'pc'));
  setTimeout(() => {
    pcOutcome.children[1].textContent = getHands(pcResults, 'pc');
    const winner = compareHands();
    if (winner === 'Tie') {
      pcOutcome.style.color = "dodgerblue";
      userOutcome.style.color = "dodgerblue";
      pcOutcome.children[0].textContent = 'TIE: ';
      userOutcome.children[0].textContent = 'TIE: ';
    }
    if (winner === 'PC') {
      pcOutcome.style.color = "forestgreen";
      userOutcome.style.color = "crimson";
      pcOutcome.children[0].textContent = 'WINNER: ';
    }
    if (winner === 'You') {
      pcOutcome.style.color = "crimson";
      userOutcome.style.color = "forestgreen";
      userOutcome.children[0].textContent = 'WINNER: ';
    }
  }, holdList.length === 5 ? 0 : 3000);

};

const getHands = (results, agent) => {
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
    if (agent === 'user') {
      userHandRank = 8;
    } else {
      pcHandRank = 8;
    }
    return 'Five of a Kind';
  }

  if (Object.values(counts).includes(4)) {
    if (agent === 'user') {
      userHandRank = 7;
    } else {
      pcHandRank = 7;
    }
    return 'Four of a Kind';
  }

  if (Object.values(counts).includes(3) && Object.values(counts).includes(2)) {
    if (agent === 'user') {
      userHandRank = 6;
    } else {
      pcHandRank = 6;
    }
    return 'Full House';
  }

  if (JSON.stringify(Object.keys(counts)) === '["2","3","4","5","6"]') {
    if (agent === 'user') {
      userHandRank = 5;
    } else {
      pcHandRank = 5;
    }
    return 'Six High Straight';
  }

  if (JSON.stringify(Object.keys(counts)) === '["1","2","3","4","5"]') {
    if (agent === 'user') {
      userHandRank = 4;
    } else {
      pcHandRank = 4;
    }
    return 'Five High Straight';
  }

  if (Object.values(counts).includes(3)) {
    if (agent === 'user') {
      userHandRank = 3;
    } else {
      pcHandRank = 3;
    }
    return 'Three of a Kind';
  }

  if (Object.values(counts).filter(count => count === 2).length === 2) {
    if (agent === 'user') {
      userHandRank = 2;
    } else {
      pcHandRank = 2;
    }
    return 'Two Pairs';
  }

  if (Object.values(counts).includes(2)) {
    if (agent === 'user') {
      userHandRank = 1;
    } else {
      pcHandRank = 1;
    }
    return 'Pair';
  }

  if (agent === 'user') {
    userHandRank = 0;
  } else {
    pcHandRank = 0;
  }
  return 'Nothing'
};

const compareHands = () => {
  if (pcHandRank !== userHandRank) {
    return pcHandRank > userHandRank ? 'PC' : 'You';
  }

  const pcTally = getTallies(pcResults);
  const userTally = getTallies(userResults);

  if (pcHandRank === 1) { // Pair
    const pcWeight = pcTally.findIndex(t => t === 2);
    const userWeight = userTally.findIndex(t => t === 2);
    if (pcWeight !== userWeight) {
      return pcWeight > userWeight ? 'PC' : 'You';
    }
  }

  if (pcHandRank === 2) { // Two Pairs
    const pcWeight1 = pcTally.reduce((acc, cur, i) => cur === 2 && i > acc ? i : acc, 0);
    const userWeight1 = userTally.reduce((acc, cur, i) => cur === 2 && i > acc ? i : acc, 0);

    if (pcWeight1 !== userWeight1) {
      return pcWeight1 > userWeight1 ? 'PC' : 'You';
    }

    const pcWeight2 = pcTally.reduce((acc, cur, i) => cur === 2 && i < acc ? i : acc, pcWeight1);
    const userWeight2 = userTally.reduce((acc, cur, i) => cur === 2 && i < acc ? i : acc, userWeight1);

    if (pcWeight2 !== userWeight2) {
      return pcWeight2 > userWeight2 ? 'PC' : 'You';
    }
  }

  if (pcHandRank === 3) { // Three of a Kind
    const pcWeight = pcTally.findIndex(t => t === 3);
    const userWeight = userTally.findIndex(t => t === 3);
    if (pcWeight !== userWeight) {
      return pcWeight > userWeight ? 'PC' : 'You';
    }
  }

  if (pcHandRank === 6) { // Full House
    const pcWeightTriple = pcTally.findIndex(t => t === 3);
    const userWeightTriple = userTally.findIndex(t => t === 3);
    if (pcWeightTriple !== userWeightTriple) {
      return pcWeightTriple > userWeightTriple ? 'PC' : 'You';
    }
    const pcWeightPair = pcTally.findIndex(t => t === 2);
    const userWeightPair = userTally.findIndex(t => t === 2);
    if (pcWeightPair !== userWeightPair) {
      return pcWeightPair > userWeightPair ? 'PC' : 'You';
    }
  }

  if (pcHandRank === 7) { // Four of a Kind
    const pcWeight = pcTally.findIndex(t => t === 4);
    const userWeight = userTally.findIndex(t => t === 4);
    if (pcWeight !== userWeight) {
      return pcWeight > userWeight ? 'PC' : 'You';
    }
  }

  if (pcHandRank === 8) { // Five of a Kind
    const pcWeight = pcTally.findIndex(t => t === 5);
    const userWeight = userTally.findIndex(t => t === 5);
    if (pcWeight !== userWeight) {
      return pcWeight > userWeight ? 'PC' : 'You';
    }
  }

  // Counting up all the cards both in case of "Nothing" and also when other numbers match: [11345] and [11245]
  const pcWeight = pcResults.reduce((acc, cur) => acc + cur, 0);
  const userWeight = userResults.reduce((acc, cur) => acc + cur, 0);

  if (pcWeight !== userWeight) {
    return pcWeight > userWeight ? 'PC' : 'You';
  }

  return 'Tie';
};

const getTallies = (hand) => {
  const tallies = [0, 0, 0, 0, 0, 0];
  hand.forEach(die => tallies[die - 1] += 1);
  return tallies;
}

const roll = (dice, j, agent) => {
  const sequence = [Math.floor(Math.random() * 6 + 1)];
  while (sequence.length < 10) {
    const randomSide = Math.floor(Math.random() * 6 + 1);
    if (sequence[sequence.length - 1] !== randomSide) {
      sequence.push(randomSide);
    }
  }

  if (agent === 'user') {
    userResults[j] = sequence[sequence.length - 1];
  } else {
    pcResults[j] = sequence[sequence.length - 1];
  }

  for (let i = 1; i < sequence.length + 1; i++) {
    setTimeout(() => {
      dice[j].style.transform = sideRotations[sequence[i - 1]];
    }, i * 250);
  }
};

rollAll.addEventListener('click', () => {
  rollAll.style.display = 'none';
  userDice.forEach((die, i) => roll(userDice, i, 'user'));
  pcDice.forEach((die, i) => roll(pcDice, i, 'pc'));

  setTimeout(() => {
    pcOutcome.children[0].textContent = 'Opponent\'s Outcome: ';
    pcOutcome.children[1].textContent = getHands(pcResults, 'pc');
    userOutcome.children[0].textContent = 'Your Outcome: ';
    userOutcome.children[1].textContent = getHands(userResults, 'user');
    hint.style.display = 'block';
    reload.style.display = 'block';
    reroll.style.display = 'block';
    lockRow.style.display = 'flex';
  }, 3000);

  reroll.addEventListener('click', () => {
    lockRow.style.display = 'none';
    reroll.style.display = 'none';
    locks.forEach((lock, index) => {
      if (lock.checked) { roll(userDice, index, 'user') }
    });
    setTimeout(() => {
      const userHand = getHands(userResults, 'user');
      userOutcome.children[1].textContent = getHands(userResults, 'user');
      suggestionsToHold(userHand);
    }, locks.every(lock => !lock.checked) ? 0 : 3000);
  }, { once: true });

  reload.addEventListener('click', () => window.location.reload(), { once: true });
}, { once: true });

const lookupTable = {
  11111: { 'Pair': '11111', 'Two Pairs': '11111', 'Three of a Kind': '11111', 'Five High Straight': '11111', 'Six High Straight': '11111', 'Full House': '11111', 'Four of a Kind': '11111', 'Five of a Kind': '11111' },
  11112: { 'Pair': '1111', 'Two Pairs': '1111', 'Three of a Kind': '1111', 'Five High Straight': '1111', 'Six High Straight': '1111', 'Full House': '1111', 'Four of a Kind': '1111', 'Five of a Kind': '1111' },
  11113: { 'Pair': '1111', 'Two Pairs': '1111', 'Three of a Kind': '1111', 'Five High Straight': '1111', 'Six High Straight': '1111', 'Full House': '1111', 'Four of a Kind': '1111', 'Five of a Kind': '1111' },
  11114: { 'Pair': '1111', 'Two Pairs': '1111', 'Three of a Kind': '1111', 'Five High Straight': '1111', 'Six High Straight': '1111', 'Full House': '1111', 'Four of a Kind': '1111', 'Five of a Kind': '1111' },
  11115: { 'Pair': '1111', 'Two Pairs': '1111', 'Three of a Kind': '1111', 'Five High Straight': '1111', 'Six High Straight': '1111', 'Full House': '1111', 'Four of a Kind': '1111', 'Five of a Kind': '1111' },
  11116: { 'Pair': '1111', 'Two Pairs': '1111', 'Three of a Kind': '1111', 'Five High Straight': '1111', 'Six High Straight': '1111', 'Full House': '1111', 'Four of a Kind': '1111', 'Five of a Kind': '1111' },
  11122: { 'Pair': '11122', 'Two Pairs': '11122', 'Three of a Kind': '11122', 'Five High Straight': '11122', 'Six High Straight': '11122', 'Full House': '11122', 'Four of a Kind': '111', 'Five of a Kind': '111' },
  11123: { 'Pair': '111', 'Two Pairs': '111', 'Three of a Kind': '111', 'Five High Straight': '111', 'Six High Straight': '111', 'Full House': '111', 'Four of a Kind': '111', 'Five of a Kind': '111' },
  11124: { 'Pair': '111', 'Two Pairs': '111', 'Three of a Kind': '111', 'Five High Straight': '111', 'Six High Straight': '111', 'Full House': '111', 'Four of a Kind': '111', 'Five of a Kind': '111' },
  11125: { 'Pair': '111', 'Two Pairs': '111', 'Three of a Kind': '111', 'Five High Straight': '111', 'Six High Straight': '111', 'Full House': '111', 'Four of a Kind': '111', 'Five of a Kind': '111' },
  11126: { 'Pair': '111', 'Two Pairs': '111', 'Three of a Kind': '111', 'Five High Straight': '111', 'Six High Straight': '111', 'Full House': '111', 'Four of a Kind': '111', 'Five of a Kind': '111' },
  11133: { 'Pair': '11133', 'Two Pairs': '11133', 'Three of a Kind': '11133', 'Five High Straight': '11133', 'Six High Straight': '11133', 'Full House': '11133', 'Four of a Kind': '111', 'Five of a Kind': '111' },
  11134: { 'Pair': '111', 'Two Pairs': '111', 'Three of a Kind': '111', 'Five High Straight': '111', 'Six High Straight': '111', 'Full House': '111', 'Four of a Kind': '111', 'Five of a Kind': '111' },
  11135: { 'Pair': '111', 'Two Pairs': '111', 'Three of a Kind': '111', 'Five High Straight': '111', 'Six High Straight': '111', 'Full House': '111', 'Four of a Kind': '111', 'Five of a Kind': '111' },
  11136: { 'Pair': '111', 'Two Pairs': '111', 'Three of a Kind': '111', 'Five High Straight': '111', 'Six High Straight': '111', 'Full House': '111', 'Four of a Kind': '111', 'Five of a Kind': '111' },
  11144: { 'Pair': '11144', 'Two Pairs': '11144', 'Three of a Kind': '11144', 'Five High Straight': '11144', 'Six High Straight': '11144', 'Full House': '11144', 'Four of a Kind': '111', 'Five of a Kind': '111' },
  11145: { 'Pair': '111', 'Two Pairs': '111', 'Three of a Kind': '111', 'Five High Straight': '111', 'Six High Straight': '111', 'Full House': '111', 'Four of a Kind': '111', 'Five of a Kind': '111' },
  11146: { 'Pair': '111', 'Two Pairs': '111', 'Three of a Kind': '111', 'Five High Straight': '111', 'Six High Straight': '111', 'Full House': '111', 'Four of a Kind': '111', 'Five of a Kind': '111' },
  11155: { 'Pair': '11155', 'Two Pairs': '11155', 'Three of a Kind': '11155', 'Five High Straight': '11155', 'Six High Straight': '11155', 'Full House': '11155', 'Four of a Kind': '111', 'Five of a Kind': '111' },
  11156: { 'Pair': '111', 'Two Pairs': '111', 'Three of a Kind': '111', 'Five High Straight': '111', 'Six High Straight': '111', 'Full House': '111', 'Four of a Kind': '111', 'Five of a Kind': '111' },
  11166: { 'Pair': '11166', 'Two Pairs': '11166', 'Three of a Kind': '11166', 'Five High Straight': '11166', 'Six High Straight': '11166', 'Full House': '11166', 'Four of a Kind': '111', 'Five of a Kind': '111' },
  11222: { 'Pair': '11222', 'Two Pairs': '11222', 'Three of a Kind': '11222', 'Five High Straight': '11222', 'Six High Straight': '11222', 'Full House': '11222', 'Four of a Kind': '222', 'Five of a Kind': '222' },
  11223: { 'Pair': '1122', 'Two Pairs': '1122', 'Three of a Kind': '22', 'Five High Straight': '1122', 'Six High Straight': '1122', 'Full House': '1122', 'Four of a Kind': '22', 'Five of a Kind': '22' },
  11224: { 'Pair': '1122', 'Two Pairs': '1122', 'Three of a Kind': '22', 'Five High Straight': '1122', 'Six High Straight': '1122', 'Full House': '1122', 'Four of a Kind': '22', 'Five of a Kind': '22' },
  11225: { 'Pair': '1122', 'Two Pairs': '1122', 'Three of a Kind': '22', 'Five High Straight': '1122', 'Six High Straight': '1122', 'Full House': '1122', 'Four of a Kind': '22', 'Five of a Kind': '22' },
  11226: { 'Pair': '1122', 'Two Pairs': '1122', 'Three of a Kind': '22', 'Five High Straight': '1122', 'Six High Straight': '1122', 'Full House': '1122', 'Four of a Kind': '22', 'Five of a Kind': '22' },
  11233: { 'Pair': '1133', 'Two Pairs': '1133', 'Three of a Kind': '33', 'Five High Straight': '1133', 'Six High Straight': '1133', 'Full House': '1133', 'Four of a Kind': '33', 'Five of a Kind': '33' },
  11234: { 'Pair': '11', 'Two Pairs': '11', 'Three of a Kind': '11', 'Five High Straight': '11', 'Six High Straight': '11', 'Full House': '11', 'Four of a Kind': '11', 'Five of a Kind': '11' },
  11235: { 'Pair': '11', 'Two Pairs': '11', 'Three of a Kind': '11', 'Five High Straight': '11', 'Six High Straight': '11', 'Full House': '11', 'Four of a Kind': '11', 'Five of a Kind': '11' },
  11236: { 'Pair': '11', 'Two Pairs': '11', 'Three of a Kind': '11', 'Five High Straight': '11', 'Six High Straight': '11', 'Full House': '11', 'Four of a Kind': '11', 'Five of a Kind': '11' },
  11244: { 'Pair': '1144', 'Two Pairs': '1144', 'Three of a Kind': '44', 'Five High Straight': '1144', 'Six High Straight': '1144', 'Full House': '1144', 'Four of a Kind': '44', 'Five of a Kind': '44' },
  11245: { 'Pair': '11', 'Two Pairs': '11', 'Three of a Kind': '11', 'Five High Straight': '11', 'Six High Straight': '11', 'Full House': '11', 'Four of a Kind': '11', 'Five of a Kind': '11' },
  11246: { 'Pair': '11', 'Two Pairs': '11', 'Three of a Kind': '11', 'Five High Straight': '11', 'Six High Straight': '11', 'Full House': '11', 'Four of a Kind': '11', 'Five of a Kind': '11' },
  11255: { 'Pair': '1155', 'Two Pairs': '1155', 'Three of a Kind': '55', 'Five High Straight': '1155', 'Six High Straight': '1155', 'Full House': '1155', 'Four of a Kind': '55', 'Five of a Kind': '55' },
  11256: { 'Pair': '11', 'Two Pairs': '11', 'Three of a Kind': '11', 'Five High Straight': '11', 'Six High Straight': '11', 'Full House': '11', 'Four of a Kind': '11', 'Five of a Kind': '11' },
  11266: { 'Pair': '1166', 'Two Pairs': '1166', 'Three of a Kind': '66', 'Five High Straight': '1166', 'Six High Straight': '1166', 'Full House': '1166', 'Four of a Kind': '66', 'Five of a Kind': '66' },
  11333: { 'Pair': '11333', 'Two Pairs': '11333', 'Three of a Kind': '11333', 'Five High Straight': '11333', 'Six High Straight': '11333', 'Full House': '11333', 'Four of a Kind': '333', 'Five of a Kind': '333' },
  11334: { 'Pair': '1133', 'Two Pairs': '1133', 'Three of a Kind': '33', 'Five High Straight': '1133', 'Six High Straight': '1133', 'Full House': '1133', 'Four of a Kind': '33', 'Five of a Kind': '33' },
  11335: { 'Pair': '1133', 'Two Pairs': '1133', 'Three of a Kind': '33', 'Five High Straight': '1133', 'Six High Straight': '1133', 'Full House': '1133', 'Four of a Kind': '33', 'Five of a Kind': '33' },
  11336: { 'Pair': '1133', 'Two Pairs': '1133', 'Three of a Kind': '33', 'Five High Straight': '1133', 'Six High Straight': '1133', 'Full House': '1133', 'Four of a Kind': '33', 'Five of a Kind': '33' },
  11344: { 'Pair': '1144', 'Two Pairs': '1144', 'Three of a Kind': '44', 'Five High Straight': '1144', 'Six High Straight': '1144', 'Full House': '1144', 'Four of a Kind': '44', 'Five of a Kind': '44' },
  11345: { 'Pair': '11', 'Two Pairs': '11', 'Three of a Kind': '11', 'Five High Straight': '11', 'Six High Straight': '11', 'Full House': '11', 'Four of a Kind': '11', 'Five of a Kind': '11' },
  11346: { 'Pair': '11', 'Two Pairs': '11', 'Three of a Kind': '11', 'Five High Straight': '11', 'Six High Straight': '11', 'Full House': '11', 'Four of a Kind': '11', 'Five of a Kind': '11' },
  11355: { 'Pair': '1155', 'Two Pairs': '1155', 'Three of a Kind': '55', 'Five High Straight': '1155', 'Six High Straight': '1155', 'Full House': '1155', 'Four of a Kind': '55', 'Five of a Kind': '55' },
  11356: { 'Pair': '11', 'Two Pairs': '11', 'Three of a Kind': '11', 'Five High Straight': '11', 'Six High Straight': '11', 'Full House': '11', 'Four of a Kind': '11', 'Five of a Kind': '11' },
  11366: { 'Pair': '1166', 'Two Pairs': '1166', 'Three of a Kind': '66', 'Five High Straight': '1166', 'Six High Straight': '1166', 'Full House': '1166', 'Four of a Kind': '66', 'Five of a Kind': '66' },
  11444: { 'Pair': '11444', 'Two Pairs': '11444', 'Three of a Kind': '11444', 'Five High Straight': '11444', 'Six High Straight': '11444', 'Full House': '11444', 'Four of a Kind': '444', 'Five of a Kind': '444' },
  11445: { 'Pair': '1144', 'Two Pairs': '1144', 'Three of a Kind': '44', 'Five High Straight': '1144', 'Six High Straight': '1144', 'Full House': '1144', 'Four of a Kind': '44', 'Five of a Kind': '44' },
  11446: { 'Pair': '1144', 'Two Pairs': '1144', 'Three of a Kind': '44', 'Five High Straight': '1144', 'Six High Straight': '1144', 'Full House': '1144', 'Four of a Kind': '44', 'Five of a Kind': '44' },
  11455: { 'Pair': '1155', 'Two Pairs': '1155', 'Three of a Kind': '55', 'Five High Straight': '1155', 'Six High Straight': '1155', 'Full House': '1155', 'Four of a Kind': '55', 'Five of a Kind': '55' },
  11456: { 'Pair': '11', 'Two Pairs': '11', 'Three of a Kind': '11', 'Five High Straight': '11', 'Six High Straight': '11', 'Full House': '11', 'Four of a Kind': '11', 'Five of a Kind': '11' },
  11466: { 'Pair': '1166', 'Two Pairs': '1166', 'Three of a Kind': '66', 'Five High Straight': '1166', 'Six High Straight': '1166', 'Full House': '1166', 'Four of a Kind': '66', 'Five of a Kind': '66' },
  11555: { 'Pair': '11555', 'Two Pairs': '11555', 'Three of a Kind': '11555', 'Five High Straight': '11555', 'Six High Straight': '11555', 'Full House': '11555', 'Four of a Kind': '555', 'Five of a Kind': '555' },
  11556: { 'Pair': '1155', 'Two Pairs': '1155', 'Three of a Kind': '55', 'Five High Straight': '1155', 'Six High Straight': '1155', 'Full House': '1155', 'Four of a Kind': '55', 'Five of a Kind': '55' },
  11566: { 'Pair': '1166', 'Two Pairs': '1166', 'Three of a Kind': '66', 'Five High Straight': '1166', 'Six High Straight': '1166', 'Full House': '1166', 'Four of a Kind': '66', 'Five of a Kind': '66' },
  11666: { 'Pair': '11666', 'Two Pairs': '11666', 'Three of a Kind': '11666', 'Five High Straight': '11666', 'Six High Straight': '11666', 'Full House': '11666', 'Four of a Kind': '666', 'Five of a Kind': '666' },
  12222: { 'Pair': '2222', 'Two Pairs': '2222', 'Three of a Kind': '2222', 'Five High Straight': '2222', 'Six High Straight': '2222', 'Full House': '2222', 'Four of a Kind': '2222', 'Five of a Kind': '2222' },
  12223: { 'Pair': '222', 'Two Pairs': '222', 'Three of a Kind': '222', 'Five High Straight': '222', 'Six High Straight': '222', 'Full House': '222', 'Four of a Kind': '222', 'Five of a Kind': '222' },
  12224: { 'Pair': '222', 'Two Pairs': '222', 'Three of a Kind': '222', 'Five High Straight': '222', 'Six High Straight': '222', 'Full House': '222', 'Four of a Kind': '222', 'Five of a Kind': '222' },
  12225: { 'Pair': '222', 'Two Pairs': '222', 'Three of a Kind': '222', 'Five High Straight': '222', 'Six High Straight': '222', 'Full House': '222', 'Four of a Kind': '222', 'Five of a Kind': '222' },
  12226: { 'Pair': '222', 'Two Pairs': '222', 'Three of a Kind': '222', 'Five High Straight': '222', 'Six High Straight': '222', 'Full House': '222', 'Four of a Kind': '222', 'Five of a Kind': '222' },
  12233: { 'Pair': '2233', 'Two Pairs': '2233', 'Three of a Kind': '33', 'Five High Straight': '2233', 'Six High Straight': '2233', 'Full House': '2233', 'Four of a Kind': '33', 'Five of a Kind': '33' },
  12234: { 'Pair': '22', 'Two Pairs': '22', 'Three of a Kind': '22', 'Five High Straight': '22', 'Six High Straight': '22', 'Full House': '22', 'Four of a Kind': '22', 'Five of a Kind': '22' },
  12235: { 'Pair': '22', 'Two Pairs': '22', 'Three of a Kind': '22', 'Five High Straight': '22', 'Six High Straight': '22', 'Full House': '22', 'Four of a Kind': '22', 'Five of a Kind': '22' },
  12236: { 'Pair': '22', 'Two Pairs': '22', 'Three of a Kind': '22', 'Five High Straight': '22', 'Six High Straight': '22', 'Full House': '22', 'Four of a Kind': '22', 'Five of a Kind': '22' },
  12244: { 'Pair': '2244', 'Two Pairs': '2244', 'Three of a Kind': '44', 'Five High Straight': '2244', 'Six High Straight': '2244', 'Full House': '2244', 'Four of a Kind': '44', 'Five of a Kind': '44' },
  12245: { 'Pair': '22', 'Two Pairs': '22', 'Three of a Kind': '22', 'Five High Straight': '22', 'Six High Straight': '22', 'Full House': '22', 'Four of a Kind': '22', 'Five of a Kind': '22' },
  12246: { 'Pair': '22', 'Two Pairs': '22', 'Three of a Kind': '22', 'Five High Straight': '22', 'Six High Straight': '22', 'Full House': '22', 'Four of a Kind': '22', 'Five of a Kind': '22' },
  12255: { 'Pair': '2255', 'Two Pairs': '2255', 'Three of a Kind': '55', 'Five High Straight': '2255', 'Six High Straight': '2255', 'Full House': '2255', 'Four of a Kind': '55', 'Five of a Kind': '55' },
  12256: { 'Pair': '22', 'Two Pairs': '22', 'Three of a Kind': '22', 'Five High Straight': '22', 'Six High Straight': '22', 'Full House': '22', 'Four of a Kind': '22', 'Five of a Kind': '22' },
  12266: { 'Pair': '2266', 'Two Pairs': '2266', 'Three of a Kind': '66', 'Five High Straight': '2266', 'Six High Straight': '2266', 'Full House': '2266', 'Four of a Kind': '66', 'Five of a Kind': '66' },
  12333: { 'Pair': '333', 'Two Pairs': '333', 'Three of a Kind': '333', 'Five High Straight': '333', 'Six High Straight': '333', 'Full House': '333', 'Four of a Kind': '333', 'Five of a Kind': '333' },
  12334: { 'Pair': '33', 'Two Pairs': '33', 'Three of a Kind': '33', 'Five High Straight': '33', 'Six High Straight': '33', 'Full House': '33', 'Four of a Kind': '33', 'Five of a Kind': '33' },
  12335: { 'Pair': '33', 'Two Pairs': '33', 'Three of a Kind': '33', 'Five High Straight': '33', 'Six High Straight': '33', 'Full House': '33', 'Four of a Kind': '33', 'Five of a Kind': '33' },
  12336: { 'Pair': '33', 'Two Pairs': '33', 'Three of a Kind': '33', 'Five High Straight': '33', 'Six High Straight': '33', 'Full House': '33', 'Four of a Kind': '33', 'Five of a Kind': '33' },
  12344: { 'Pair': '44', 'Two Pairs': '44', 'Three of a Kind': '44', 'Five High Straight': '1234', 'Six High Straight': '44', 'Full House': '44', 'Four of a Kind': '44', 'Five of a Kind': '44' },
  12345: { 'Pair': '12345', 'Two Pairs': '12345', 'Three of a Kind': '12345', 'Five High Straight': '12345', 'Six High Straight': '2345', 'Full House': '', 'Four of a Kind': '', 'Five of a Kind': '' },
  12346: { 'Pair': '234', 'Two Pairs': '4', 'Three of a Kind': '4', 'Five High Straight': '2346', 'Six High Straight': '2346', 'Full House': '', 'Four of a Kind': '', 'Five of a Kind': '' },
  12355: { 'Pair': '55', 'Two Pairs': '55', 'Three of a Kind': '55', 'Five High Straight': '1235', 'Six High Straight': '55', 'Full House': '55', 'Four of a Kind': '55', 'Five of a Kind': '55' },
  12356: { 'Pair': '235', 'Two Pairs': '5', 'Three of a Kind': '5', 'Five High Straight': '2356', 'Six High Straight': '2356', 'Full House': '', 'Four of a Kind': '', 'Five of a Kind': '' },
  12366: { 'Pair': '66', 'Two Pairs': '66', 'Three of a Kind': '66', 'Five High Straight': '66', 'Six High Straight': '66', 'Full House': '66', 'Four of a Kind': '66', 'Five of a Kind': '66' },
  12444: { 'Pair': '444', 'Two Pairs': '444', 'Three of a Kind': '444', 'Five High Straight': '444', 'Six High Straight': '444', 'Full House': '444', 'Four of a Kind': '444', 'Five of a Kind': '444' },
  12445: { 'Pair': '44', 'Two Pairs': '44', 'Three of a Kind': '44', 'Five High Straight': '1245', 'Six High Straight': '44', 'Full House': '44', 'Four of a Kind': '44', 'Five of a Kind': '44' },
  12446: { 'Pair': '44', 'Two Pairs': '44', 'Three of a Kind': '44', 'Five High Straight': '44', 'Six High Straight': '44', 'Full House': '44', 'Four of a Kind': '44', 'Five of a Kind': '44' },
  12455: { 'Pair': '55', 'Two Pairs': '55', 'Three of a Kind': '55', 'Five High Straight': '1245', 'Six High Straight': '55', 'Full House': '55', 'Four of a Kind': '55', 'Five of a Kind': '55' },
  12456: { 'Pair': '245', 'Two Pairs': '5', 'Three of a Kind': '5', 'Five High Straight': '2456', 'Six High Straight': '2456', 'Full House': '', 'Four of a Kind': '', 'Five of a Kind': '' },
  12466: { 'Pair': '66', 'Two Pairs': '66', 'Three of a Kind': '66', 'Five High Straight': '66', 'Six High Straight': '66', 'Full House': '66', 'Four of a Kind': '66', 'Five of a Kind': '66' },
  12555: { 'Pair': '555', 'Two Pairs': '555', 'Three of a Kind': '555', 'Five High Straight': '555', 'Six High Straight': '555', 'Full House': '555', 'Four of a Kind': '555', 'Five of a Kind': '555' },
  12556: { 'Pair': '55', 'Two Pairs': '55', 'Three of a Kind': '55', 'Five High Straight': '55', 'Six High Straight': '55', 'Full House': '55', 'Four of a Kind': '55', 'Five of a Kind': '55' },
  12566: { 'Pair': '66', 'Two Pairs': '66', 'Three of a Kind': '66', 'Five High Straight': '66', 'Six High Straight': '66', 'Full House': '66', 'Four of a Kind': '66', 'Five of a Kind': '66' },
  12666: { 'Pair': '666', 'Two Pairs': '666', 'Three of a Kind': '666', 'Five High Straight': '666', 'Six High Straight': '666', 'Full House': '666', 'Four of a Kind': '666', 'Five of a Kind': '666' },
  13333: { 'Pair': '3333', 'Two Pairs': '3333', 'Three of a Kind': '3333', 'Five High Straight': '3333', 'Six High Straight': '3333', 'Full House': '3333', 'Four of a Kind': '3333', 'Five of a Kind': '3333' },
  13334: { 'Pair': '333', 'Two Pairs': '333', 'Three of a Kind': '333', 'Five High Straight': '333', 'Six High Straight': '333', 'Full House': '333', 'Four of a Kind': '333', 'Five of a Kind': '333' },
  13335: { 'Pair': '333', 'Two Pairs': '333', 'Three of a Kind': '333', 'Five High Straight': '333', 'Six High Straight': '333', 'Full House': '333', 'Four of a Kind': '333', 'Five of a Kind': '333' },
  13336: { 'Pair': '333', 'Two Pairs': '333', 'Three of a Kind': '333', 'Five High Straight': '333', 'Six High Straight': '333', 'Full House': '333', 'Four of a Kind': '333', 'Five of a Kind': '333' },
  13344: { 'Pair': '3344', 'Two Pairs': '3344', 'Three of a Kind': '44', 'Five High Straight': '3344', 'Six High Straight': '3344', 'Full House': '3344', 'Four of a Kind': '44', 'Five of a Kind': '44' },
  13345: { 'Pair': '33', 'Two Pairs': '33', 'Three of a Kind': '33', 'Five High Straight': '33', 'Six High Straight': '33', 'Full House': '33', 'Four of a Kind': '33', 'Five of a Kind': '33' },
  13346: { 'Pair': '33', 'Two Pairs': '33', 'Three of a Kind': '33', 'Five High Straight': '33', 'Six High Straight': '33', 'Full House': '33', 'Four of a Kind': '33', 'Five of a Kind': '33' },
  13355: { 'Pair': '3355', 'Two Pairs': '3355', 'Three of a Kind': '55', 'Five High Straight': '3355', 'Six High Straight': '3355', 'Full House': '3355', 'Four of a Kind': '55', 'Five of a Kind': '55' },
  13356: { 'Pair': '33', 'Two Pairs': '33', 'Three of a Kind': '33', 'Five High Straight': '33', 'Six High Straight': '33', 'Full House': '33', 'Four of a Kind': '33', 'Five of a Kind': '33' },
  13366: { 'Pair': '3366', 'Two Pairs': '3366', 'Three of a Kind': '66', 'Five High Straight': '3366', 'Six High Straight': '3366', 'Full House': '3366', 'Four of a Kind': '66', 'Five of a Kind': '66' },
  13444: { 'Pair': '444', 'Two Pairs': '444', 'Three of a Kind': '444', 'Five High Straight': '444', 'Six High Straight': '444', 'Full House': '444', 'Four of a Kind': '444', 'Five of a Kind': '444' },
  13445: { 'Pair': '44', 'Two Pairs': '44', 'Three of a Kind': '44', 'Five High Straight': '44', 'Six High Straight': '44', 'Full House': '44', 'Four of a Kind': '44', 'Five of a Kind': '44' },
  13446: { 'Pair': '44', 'Two Pairs': '44', 'Three of a Kind': '44', 'Five High Straight': '44', 'Six High Straight': '44', 'Full House': '44', 'Four of a Kind': '44', 'Five of a Kind': '44' },
  13455: { 'Pair': '55', 'Two Pairs': '55', 'Three of a Kind': '55', 'Five High Straight': '1345', 'Six High Straight': '55', 'Full House': '55', 'Four of a Kind': '55', 'Five of a Kind': '55' },
  13456: { 'Pair': '345', 'Two Pairs': '5', 'Three of a Kind': '5', 'Five High Straight': '3456', 'Six High Straight': '3456', 'Full House': '', 'Four of a Kind': '', 'Five of a Kind': '' },
  13466: { 'Pair': '66', 'Two Pairs': '66', 'Three of a Kind': '66', 'Five High Straight': '66', 'Six High Straight': '66', 'Full House': '66', 'Four of a Kind': '66', 'Five of a Kind': '66' },
  13555: { 'Pair': '555', 'Two Pairs': '555', 'Three of a Kind': '555', 'Five High Straight': '555', 'Six High Straight': '555', 'Full House': '555', 'Four of a Kind': '555', 'Five of a Kind': '555' },
  13556: { 'Pair': '55', 'Two Pairs': '55', 'Three of a Kind': '55', 'Five High Straight': '55', 'Six High Straight': '55', 'Full House': '55', 'Four of a Kind': '55', 'Five of a Kind': '55' },
  13566: { 'Pair': '66', 'Two Pairs': '66', 'Three of a Kind': '66', 'Five High Straight': '66', 'Six High Straight': '66', 'Full House': '66', 'Four of a Kind': '66', 'Five of a Kind': '66' },
  13666: { 'Pair': '666', 'Two Pairs': '666', 'Three of a Kind': '666', 'Five High Straight': '666', 'Six High Straight': '666', 'Full House': '666', 'Four of a Kind': '666', 'Five of a Kind': '666' },
  14444: { 'Pair': '4444', 'Two Pairs': '4444', 'Three of a Kind': '4444', 'Five High Straight': '4444', 'Six High Straight': '4444', 'Full House': '4444', 'Four of a Kind': '4444', 'Five of a Kind': '4444' },
  14445: { 'Pair': '444', 'Two Pairs': '444', 'Three of a Kind': '444', 'Five High Straight': '444', 'Six High Straight': '444', 'Full House': '444', 'Four of a Kind': '444', 'Five of a Kind': '444' },
  14446: { 'Pair': '444', 'Two Pairs': '444', 'Three of a Kind': '444', 'Five High Straight': '444', 'Six High Straight': '444', 'Full House': '444', 'Four of a Kind': '444', 'Five of a Kind': '444' },
  14455: { 'Pair': '4455', 'Two Pairs': '4455', 'Three of a Kind': '55', 'Five High Straight': '4455', 'Six High Straight': '4455', 'Full House': '4455', 'Four of a Kind': '55', 'Five of a Kind': '55' },
  14456: { 'Pair': '44', 'Two Pairs': '44', 'Three of a Kind': '44', 'Five High Straight': '44', 'Six High Straight': '44', 'Full House': '44', 'Four of a Kind': '44', 'Five of a Kind': '44' },
  14466: { 'Pair': '4466', 'Two Pairs': '4466', 'Three of a Kind': '66', 'Five High Straight': '4466', 'Six High Straight': '4466', 'Full House': '4466', 'Four of a Kind': '66', 'Five of a Kind': '66' },
  14555: { 'Pair': '555', 'Two Pairs': '555', 'Three of a Kind': '555', 'Five High Straight': '555', 'Six High Straight': '555', 'Full House': '555', 'Four of a Kind': '555', 'Five of a Kind': '555' },
  14556: { 'Pair': '55', 'Two Pairs': '55', 'Three of a Kind': '55', 'Five High Straight': '55', 'Six High Straight': '55', 'Full House': '55', 'Four of a Kind': '55', 'Five of a Kind': '55' },
  14566: { 'Pair': '66', 'Two Pairs': '66', 'Three of a Kind': '66', 'Five High Straight': '66', 'Six High Straight': '66', 'Full House': '66', 'Four of a Kind': '66', 'Five of a Kind': '66' },
  14666: { 'Pair': '666', 'Two Pairs': '666', 'Three of a Kind': '666', 'Five High Straight': '666', 'Six High Straight': '666', 'Full House': '666', 'Four of a Kind': '666', 'Five of a Kind': '666' },
  15555: { 'Pair': '5555', 'Two Pairs': '5555', 'Three of a Kind': '5555', 'Five High Straight': '5555', 'Six High Straight': '5555', 'Full House': '5555', 'Four of a Kind': '5555', 'Five of a Kind': '5555' },
  15556: { 'Pair': '555', 'Two Pairs': '555', 'Three of a Kind': '555', 'Five High Straight': '555', 'Six High Straight': '555', 'Full House': '555', 'Four of a Kind': '555', 'Five of a Kind': '555' },
  15566: { 'Pair': '5566', 'Two Pairs': '5566', 'Three of a Kind': '66', 'Five High Straight': '5566', 'Six High Straight': '5566', 'Full House': '5566', 'Four of a Kind': '66', 'Five of a Kind': '66' },
  15666: { 'Pair': '666', 'Two Pairs': '666', 'Three of a Kind': '666', 'Five High Straight': '666', 'Six High Straight': '666', 'Full House': '666', 'Four of a Kind': '666', 'Five of a Kind': '666' },
  16666: { 'Pair': '6666', 'Two Pairs': '6666', 'Three of a Kind': '6666', 'Five High Straight': '6666', 'Six High Straight': '6666', 'Full House': '6666', 'Four of a Kind': '6666', 'Five of a Kind': '6666' },
  22222: { 'Pair': '22222', 'Two Pairs': '22222', 'Three of a Kind': '22222', 'Five High Straight': '22222', 'Six High Straight': '22222', 'Full House': '22222', 'Four of a Kind': '22222', 'Five of a Kind': '22222' },
  22223: { 'Pair': '2222', 'Two Pairs': '2222', 'Three of a Kind': '2222', 'Five High Straight': '2222', 'Six High Straight': '2222', 'Full House': '2222', 'Four of a Kind': '2222', 'Five of a Kind': '2222' },
  22224: { 'Pair': '2222', 'Two Pairs': '2222', 'Three of a Kind': '2222', 'Five High Straight': '2222', 'Six High Straight': '2222', 'Full House': '2222', 'Four of a Kind': '2222', 'Five of a Kind': '2222' },
  22225: { 'Pair': '2222', 'Two Pairs': '2222', 'Three of a Kind': '2222', 'Five High Straight': '2222', 'Six High Straight': '2222', 'Full House': '2222', 'Four of a Kind': '2222', 'Five of a Kind': '2222' },
  22226: { 'Pair': '2222', 'Two Pairs': '2222', 'Three of a Kind': '2222', 'Five High Straight': '2222', 'Six High Straight': '2222', 'Full House': '2222', 'Four of a Kind': '2222', 'Five of a Kind': '2222' },
  22233: { 'Pair': '22233', 'Two Pairs': '22233', 'Three of a Kind': '22233', 'Five High Straight': '22233', 'Six High Straight': '22233', 'Full House': '22233', 'Four of a Kind': '222', 'Five of a Kind': '222' },
  22234: { 'Pair': '222', 'Two Pairs': '222', 'Three of a Kind': '222', 'Five High Straight': '222', 'Six High Straight': '222', 'Full House': '222', 'Four of a Kind': '222', 'Five of a Kind': '222' },
  22235: { 'Pair': '222', 'Two Pairs': '222', 'Three of a Kind': '222', 'Five High Straight': '222', 'Six High Straight': '222', 'Full House': '222', 'Four of a Kind': '222', 'Five of a Kind': '222' },
  22236: { 'Pair': '222', 'Two Pairs': '222', 'Three of a Kind': '222', 'Five High Straight': '222', 'Six High Straight': '222', 'Full House': '222', 'Four of a Kind': '222', 'Five of a Kind': '222' },
  22244: { 'Pair': '22244', 'Two Pairs': '22244', 'Three of a Kind': '22244', 'Five High Straight': '22244', 'Six High Straight': '22244', 'Full House': '22244', 'Four of a Kind': '222', 'Five of a Kind': '222' },
  22245: { 'Pair': '222', 'Two Pairs': '222', 'Three of a Kind': '222', 'Five High Straight': '222', 'Six High Straight': '222', 'Full House': '222', 'Four of a Kind': '222', 'Five of a Kind': '222' },
  22246: { 'Pair': '222', 'Two Pairs': '222', 'Three of a Kind': '222', 'Five High Straight': '222', 'Six High Straight': '222', 'Full House': '222', 'Four of a Kind': '222', 'Five of a Kind': '222' },
  22255: { 'Pair': '22255', 'Two Pairs': '22255', 'Three of a Kind': '22255', 'Five High Straight': '22255', 'Six High Straight': '22255', 'Full House': '22255', 'Four of a Kind': '222', 'Five of a Kind': '222' },
  22256: { 'Pair': '222', 'Two Pairs': '222', 'Three of a Kind': '222', 'Five High Straight': '222', 'Six High Straight': '222', 'Full House': '222', 'Four of a Kind': '222', 'Five of a Kind': '222' },
  22266: { 'Pair': '22266', 'Two Pairs': '22266', 'Three of a Kind': '22266', 'Five High Straight': '22266', 'Six High Straight': '22266', 'Full House': '22266', 'Four of a Kind': '222', 'Five of a Kind': '222' },
  22333: { 'Pair': '22333', 'Two Pairs': '22333', 'Three of a Kind': '22333', 'Five High Straight': '22333', 'Six High Straight': '22333', 'Full House': '22333', 'Four of a Kind': '333', 'Five of a Kind': '333' },
  22334: { 'Pair': '2233', 'Two Pairs': '2233', 'Three of a Kind': '33', 'Five High Straight': '2233', 'Six High Straight': '2233', 'Full House': '2233', 'Four of a Kind': '33', 'Five of a Kind': '33' },
  22335: { 'Pair': '2233', 'Two Pairs': '2233', 'Three of a Kind': '33', 'Five High Straight': '2233', 'Six High Straight': '2233', 'Full House': '2233', 'Four of a Kind': '33', 'Five of a Kind': '33' },
  22336: { 'Pair': '2233', 'Two Pairs': '2233', 'Three of a Kind': '33', 'Five High Straight': '2233', 'Six High Straight': '2233', 'Full House': '2233', 'Four of a Kind': '33', 'Five of a Kind': '33' },
  22344: { 'Pair': '2244', 'Two Pairs': '2244', 'Three of a Kind': '44', 'Five High Straight': '2244', 'Six High Straight': '2244', 'Full House': '2244', 'Four of a Kind': '44', 'Five of a Kind': '44' },
  22345: { 'Pair': '22', 'Two Pairs': '22', 'Three of a Kind': '22', 'Five High Straight': '2345', 'Six High Straight': '22', 'Full House': '22', 'Four of a Kind': '22', 'Five of a Kind': '22' },
  22346: { 'Pair': '22', 'Two Pairs': '22', 'Three of a Kind': '22', 'Five High Straight': '22', 'Six High Straight': '22', 'Full House': '22', 'Four of a Kind': '22', 'Five of a Kind': '22' },
  22355: { 'Pair': '2255', 'Two Pairs': '2255', 'Three of a Kind': '55', 'Five High Straight': '2255', 'Six High Straight': '2255', 'Full House': '2255', 'Four of a Kind': '55', 'Five of a Kind': '55' },
  22356: { 'Pair': '22', 'Two Pairs': '22', 'Three of a Kind': '22', 'Five High Straight': '22', 'Six High Straight': '22', 'Full House': '22', 'Four of a Kind': '22', 'Five of a Kind': '22' },
  22366: { 'Pair': '2266', 'Two Pairs': '2266', 'Three of a Kind': '66', 'Five High Straight': '2266', 'Six High Straight': '2266', 'Full House': '2266', 'Four of a Kind': '66', 'Five of a Kind': '66' },
  22444: { 'Pair': '22444', 'Two Pairs': '22444', 'Three of a Kind': '22444', 'Five High Straight': '22444', 'Six High Straight': '22444', 'Full House': '22444', 'Four of a Kind': '444', 'Five of a Kind': '444' },
  22445: { 'Pair': '2244', 'Two Pairs': '2244', 'Three of a Kind': '44', 'Five High Straight': '2244', 'Six High Straight': '2244', 'Full House': '2244', 'Four of a Kind': '44', 'Five of a Kind': '44' },
  22446: { 'Pair': '2244', 'Two Pairs': '2244', 'Three of a Kind': '44', 'Five High Straight': '2244', 'Six High Straight': '2244', 'Full House': '2244', 'Four of a Kind': '44', 'Five of a Kind': '44' },
  22455: { 'Pair': '2255', 'Two Pairs': '2255', 'Three of a Kind': '55', 'Five High Straight': '2255', 'Six High Straight': '2255', 'Full House': '2255', 'Four of a Kind': '55', 'Five of a Kind': '55' },
  22456: { 'Pair': '22', 'Two Pairs': '22', 'Three of a Kind': '22', 'Five High Straight': '22', 'Six High Straight': '22', 'Full House': '22', 'Four of a Kind': '22', 'Five of a Kind': '22' },
  22466: { 'Pair': '2266', 'Two Pairs': '2266', 'Three of a Kind': '66', 'Five High Straight': '2266', 'Six High Straight': '2266', 'Full House': '2266', 'Four of a Kind': '66', 'Five of a Kind': '66' },
  22555: { 'Pair': '22555', 'Two Pairs': '22555', 'Three of a Kind': '22555', 'Five High Straight': '22555', 'Six High Straight': '22555', 'Full House': '22555', 'Four of a Kind': '555', 'Five of a Kind': '555' },
  22556: { 'Pair': '2255', 'Two Pairs': '2255', 'Three of a Kind': '55', 'Five High Straight': '2255', 'Six High Straight': '2255', 'Full House': '2255', 'Four of a Kind': '55', 'Five of a Kind': '55' },
  22566: { 'Pair': '2266', 'Two Pairs': '2266', 'Three of a Kind': '66', 'Five High Straight': '2266', 'Six High Straight': '2266', 'Full House': '2266', 'Four of a Kind': '66', 'Five of a Kind': '66' },
  22666: { 'Pair': '22666', 'Two Pairs': '22666', 'Three of a Kind': '22666', 'Five High Straight': '22666', 'Six High Straight': '22666', 'Full House': '22666', 'Four of a Kind': '666', 'Five of a Kind': '666' },
  23333: { 'Pair': '3333', 'Two Pairs': '3333', 'Three of a Kind': '3333', 'Five High Straight': '3333', 'Six High Straight': '3333', 'Full House': '3333', 'Four of a Kind': '3333', 'Five of a Kind': '3333' },
  23334: { 'Pair': '333', 'Two Pairs': '333', 'Three of a Kind': '333', 'Five High Straight': '333', 'Six High Straight': '333', 'Full House': '333', 'Four of a Kind': '333', 'Five of a Kind': '333' },
  23335: { 'Pair': '333', 'Two Pairs': '333', 'Three of a Kind': '333', 'Five High Straight': '333', 'Six High Straight': '333', 'Full House': '333', 'Four of a Kind': '333', 'Five of a Kind': '333' },
  23336: { 'Pair': '333', 'Two Pairs': '333', 'Three of a Kind': '333', 'Five High Straight': '333', 'Six High Straight': '333', 'Full House': '333', 'Four of a Kind': '333', 'Five of a Kind': '333' },
  23344: { 'Pair': '3344', 'Two Pairs': '3344', 'Three of a Kind': '44', 'Five High Straight': '3344', 'Six High Straight': '3344', 'Full House': '3344', 'Four of a Kind': '44', 'Five of a Kind': '44' },
  23345: { 'Pair': '33', 'Two Pairs': '33', 'Three of a Kind': '33', 'Five High Straight': '2345', 'Six High Straight': '33', 'Full House': '33', 'Four of a Kind': '33', 'Five of a Kind': '33' },
  23346: { 'Pair': '33', 'Two Pairs': '33', 'Three of a Kind': '33', 'Five High Straight': '33', 'Six High Straight': '33', 'Full House': '33', 'Four of a Kind': '33', 'Five of a Kind': '33' },
  23355: { 'Pair': '3355', 'Two Pairs': '3355', 'Three of a Kind': '55', 'Five High Straight': '3355', 'Six High Straight': '3355', 'Full House': '3355', 'Four of a Kind': '55', 'Five of a Kind': '55' },
  23356: { 'Pair': '33', 'Two Pairs': '33', 'Three of a Kind': '33', 'Five High Straight': '33', 'Six High Straight': '33', 'Full House': '33', 'Four of a Kind': '33', 'Five of a Kind': '33' },
  23366: { 'Pair': '3366', 'Two Pairs': '3366', 'Three of a Kind': '66', 'Five High Straight': '3366', 'Six High Straight': '3366', 'Full House': '3366', 'Four of a Kind': '66', 'Five of a Kind': '66' },
  23444: { 'Pair': '444', 'Two Pairs': '444', 'Three of a Kind': '444', 'Five High Straight': '444', 'Six High Straight': '444', 'Full House': '444', 'Four of a Kind': '444', 'Five of a Kind': '444' },
  23445: { 'Pair': '44', 'Two Pairs': '44', 'Three of a Kind': '44', 'Five High Straight': '2345', 'Six High Straight': '44', 'Full House': '44', 'Four of a Kind': '44', 'Five of a Kind': '44' },
  23446: { 'Pair': '44', 'Two Pairs': '44', 'Three of a Kind': '44', 'Five High Straight': '44', 'Six High Straight': '44', 'Full House': '44', 'Four of a Kind': '44', 'Five of a Kind': '44' },
  23455: { 'Pair': '55', 'Two Pairs': '55', 'Three of a Kind': '55', 'Five High Straight': '2345', 'Six High Straight': '2345', 'Full House': '55', 'Four of a Kind': '55', 'Five of a Kind': '55' },
  23456: { 'Pair': '23456', 'Two Pairs': '23456', 'Three of a Kind': '23456', 'Five High Straight': '23456', 'Six High Straight': '23456', 'Full House': '', 'Four of a Kind': '', 'Five of a Kind': '' },
  23466: { 'Pair': '66', 'Two Pairs': '66', 'Three of a Kind': '66', 'Five High Straight': '2346', 'Six High Straight': '2346', 'Full House': '66', 'Four of a Kind': '66', 'Five of a Kind': '66' },
  23555: { 'Pair': '555', 'Two Pairs': '555', 'Three of a Kind': '555', 'Five High Straight': '555', 'Six High Straight': '555', 'Full House': '555', 'Four of a Kind': '555', 'Five of a Kind': '555' },
  23556: { 'Pair': '55', 'Two Pairs': '55', 'Three of a Kind': '55', 'Five High Straight': '2356', 'Six High Straight': '2356', 'Full House': '55', 'Four of a Kind': '55', 'Five of a Kind': '55' },
  23566: { 'Pair': '66', 'Two Pairs': '66', 'Three of a Kind': '66', 'Five High Straight': '2356', 'Six High Straight': '2356', 'Full House': '66', 'Four of a Kind': '66', 'Five of a Kind': '66' },
  23666: { 'Pair': '666', 'Two Pairs': '666', 'Three of a Kind': '666', 'Five High Straight': '666', 'Six High Straight': '666', 'Full House': '666', 'Four of a Kind': '666', 'Five of a Kind': '666' },
  24444: { 'Pair': '4444', 'Two Pairs': '4444', 'Three of a Kind': '4444', 'Five High Straight': '4444', 'Six High Straight': '4444', 'Full House': '4444', 'Four of a Kind': '4444', 'Five of a Kind': '4444' },
  24445: { 'Pair': '444', 'Two Pairs': '444', 'Three of a Kind': '444', 'Five High Straight': '444', 'Six High Straight': '444', 'Full House': '444', 'Four of a Kind': '444', 'Five of a Kind': '444' },
  24446: { 'Pair': '444', 'Two Pairs': '444', 'Three of a Kind': '444', 'Five High Straight': '444', 'Six High Straight': '444', 'Full House': '444', 'Four of a Kind': '444', 'Five of a Kind': '444' },
  24455: { 'Pair': '4455', 'Two Pairs': '4455', 'Three of a Kind': '55', 'Five High Straight': '4455', 'Six High Straight': '4455', 'Full House': '4455', 'Four of a Kind': '55', 'Five of a Kind': '55' },
  24456: { 'Pair': '44', 'Two Pairs': '44', 'Three of a Kind': '44', 'Five High Straight': '44', 'Six High Straight': '44', 'Full House': '44', 'Four of a Kind': '44', 'Five of a Kind': '44' },
  24466: { 'Pair': '4466', 'Two Pairs': '4466', 'Three of a Kind': '66', 'Five High Straight': '4466', 'Six High Straight': '4466', 'Full House': '4466', 'Four of a Kind': '66', 'Five of a Kind': '66' },
  24555: { 'Pair': '555', 'Two Pairs': '555', 'Three of a Kind': '555', 'Five High Straight': '555', 'Six High Straight': '555', 'Full House': '555', 'Four of a Kind': '555', 'Five of a Kind': '555' },
  24556: { 'Pair': '55', 'Two Pairs': '55', 'Three of a Kind': '55', 'Five High Straight': '55', 'Six High Straight': '55', 'Full House': '55', 'Four of a Kind': '55', 'Five of a Kind': '55' },
  24566: { 'Pair': '66', 'Two Pairs': '66', 'Three of a Kind': '66', 'Five High Straight': '2456', 'Six High Straight': '2456', 'Full House': '66', 'Four of a Kind': '66', 'Five of a Kind': '66' },
  24666: { 'Pair': '666', 'Two Pairs': '666', 'Three of a Kind': '666', 'Five High Straight': '666', 'Six High Straight': '666', 'Full House': '666', 'Four of a Kind': '666', 'Five of a Kind': '666' },
  25555: { 'Pair': '5555', 'Two Pairs': '5555', 'Three of a Kind': '5555', 'Five High Straight': '5555', 'Six High Straight': '5555', 'Full House': '5555', 'Four of a Kind': '5555', 'Five of a Kind': '5555' },
  25556: { 'Pair': '555', 'Two Pairs': '555', 'Three of a Kind': '555', 'Five High Straight': '555', 'Six High Straight': '555', 'Full House': '555', 'Four of a Kind': '555', 'Five of a Kind': '555' },
  25566: { 'Pair': '5566', 'Two Pairs': '5566', 'Three of a Kind': '66', 'Five High Straight': '5566', 'Six High Straight': '5566', 'Full House': '5566', 'Four of a Kind': '66', 'Five of a Kind': '66' },
  25666: { 'Pair': '666', 'Two Pairs': '666', 'Three of a Kind': '666', 'Five High Straight': '666', 'Six High Straight': '666', 'Full House': '666', 'Four of a Kind': '666', 'Five of a Kind': '666' },
  26666: { 'Pair': '6666', 'Two Pairs': '6666', 'Three of a Kind': '6666', 'Five High Straight': '6666', 'Six High Straight': '6666', 'Full House': '6666', 'Four of a Kind': '6666', 'Five of a Kind': '6666' },
  33333: { 'Pair': '33333', 'Two Pairs': '33333', 'Three of a Kind': '33333', 'Five High Straight': '33333', 'Six High Straight': '33333', 'Full House': '33333', 'Four of a Kind': '33333', 'Five of a Kind': '33333' },
  33334: { 'Pair': '3333', 'Two Pairs': '3333', 'Three of a Kind': '3333', 'Five High Straight': '3333', 'Six High Straight': '3333', 'Full House': '3333', 'Four of a Kind': '3333', 'Five of a Kind': '3333' },
  33335: { 'Pair': '3333', 'Two Pairs': '3333', 'Three of a Kind': '3333', 'Five High Straight': '3333', 'Six High Straight': '3333', 'Full House': '3333', 'Four of a Kind': '3333', 'Five of a Kind': '3333' },
  33336: { 'Pair': '3333', 'Two Pairs': '3333', 'Three of a Kind': '3333', 'Five High Straight': '3333', 'Six High Straight': '3333', 'Full House': '3333', 'Four of a Kind': '3333', 'Five of a Kind': '3333' },
  33344: { 'Pair': '33344', 'Two Pairs': '33344', 'Three of a Kind': '33344', 'Five High Straight': '33344', 'Six High Straight': '33344', 'Full House': '33344', 'Four of a Kind': '333', 'Five of a Kind': '333' },
  33345: { 'Pair': '333', 'Two Pairs': '333', 'Three of a Kind': '333', 'Five High Straight': '333', 'Six High Straight': '333', 'Full House': '333', 'Four of a Kind': '333', 'Five of a Kind': '333' },
  33346: { 'Pair': '333', 'Two Pairs': '333', 'Three of a Kind': '333', 'Five High Straight': '333', 'Six High Straight': '333', 'Full House': '333', 'Four of a Kind': '333', 'Five of a Kind': '333' },
  33355: { 'Pair': '33355', 'Two Pairs': '33355', 'Three of a Kind': '33355', 'Five High Straight': '33355', 'Six High Straight': '33355', 'Full House': '33355', 'Four of a Kind': '333', 'Five of a Kind': '333' },
  33356: { 'Pair': '333', 'Two Pairs': '333', 'Three of a Kind': '333', 'Five High Straight': '333', 'Six High Straight': '333', 'Full House': '333', 'Four of a Kind': '333', 'Five of a Kind': '333' },
  33366: { 'Pair': '33366', 'Two Pairs': '33366', 'Three of a Kind': '33366', 'Five High Straight': '33366', 'Six High Straight': '33366', 'Full House': '33366', 'Four of a Kind': '333', 'Five of a Kind': '333' },
  33444: { 'Pair': '33444', 'Two Pairs': '33444', 'Three of a Kind': '33444', 'Five High Straight': '33444', 'Six High Straight': '33444', 'Full House': '33444', 'Four of a Kind': '444', 'Five of a Kind': '444' },
  33445: { 'Pair': '3344', 'Two Pairs': '3344', 'Three of a Kind': '44', 'Five High Straight': '3344', 'Six High Straight': '3344', 'Full House': '3344', 'Four of a Kind': '44', 'Five of a Kind': '44' },
  33446: { 'Pair': '3344', 'Two Pairs': '3344', 'Three of a Kind': '44', 'Five High Straight': '3344', 'Six High Straight': '3344', 'Full House': '3344', 'Four of a Kind': '44', 'Five of a Kind': '44' },
  33455: { 'Pair': '3355', 'Two Pairs': '3355', 'Three of a Kind': '55', 'Five High Straight': '3355', 'Six High Straight': '3355', 'Full House': '3355', 'Four of a Kind': '55', 'Five of a Kind': '55' },
  33456: { 'Pair': '33', 'Two Pairs': '33', 'Three of a Kind': '33', 'Five High Straight': '33', 'Six High Straight': '33', 'Full House': '33', 'Four of a Kind': '33', 'Five of a Kind': '33' },
  33466: { 'Pair': '3366', 'Two Pairs': '3366', 'Three of a Kind': '66', 'Five High Straight': '3366', 'Six High Straight': '3366', 'Full House': '3366', 'Four of a Kind': '66', 'Five of a Kind': '66' },
  33555: { 'Pair': '33555', 'Two Pairs': '33555', 'Three of a Kind': '33555', 'Five High Straight': '33555', 'Six High Straight': '33555', 'Full House': '33555', 'Four of a Kind': '555', 'Five of a Kind': '555' },
  33556: { 'Pair': '3355', 'Two Pairs': '3355', 'Three of a Kind': '55', 'Five High Straight': '3355', 'Six High Straight': '3355', 'Full House': '3355', 'Four of a Kind': '55', 'Five of a Kind': '55' },
  33566: { 'Pair': '3366', 'Two Pairs': '3366', 'Three of a Kind': '66', 'Five High Straight': '3366', 'Six High Straight': '3366', 'Full House': '3366', 'Four of a Kind': '66', 'Five of a Kind': '66' },
  33666: { 'Pair': '33666', 'Two Pairs': '33666', 'Three of a Kind': '33666', 'Five High Straight': '33666', 'Six High Straight': '33666', 'Full House': '33666', 'Four of a Kind': '666', 'Five of a Kind': '666' },
  34444: { 'Pair': '4444', 'Two Pairs': '4444', 'Three of a Kind': '4444', 'Five High Straight': '4444', 'Six High Straight': '4444', 'Full House': '4444', 'Four of a Kind': '4444', 'Five of a Kind': '4444' },
  34445: { 'Pair': '444', 'Two Pairs': '444', 'Three of a Kind': '444', 'Five High Straight': '444', 'Six High Straight': '444', 'Full House': '444', 'Four of a Kind': '444', 'Five of a Kind': '444' },
  34446: { 'Pair': '444', 'Two Pairs': '444', 'Three of a Kind': '444', 'Five High Straight': '444', 'Six High Straight': '444', 'Full House': '444', 'Four of a Kind': '444', 'Five of a Kind': '444' },
  34455: { 'Pair': '4455', 'Two Pairs': '4455', 'Three of a Kind': '55', 'Five High Straight': '4455', 'Six High Straight': '4455', 'Full House': '4455', 'Four of a Kind': '55', 'Five of a Kind': '55' },
  34456: { 'Pair': '44', 'Two Pairs': '44', 'Three of a Kind': '44', 'Five High Straight': '44', 'Six High Straight': '44', 'Full House': '44', 'Four of a Kind': '44', 'Five of a Kind': '44' },
  34466: { 'Pair': '4466', 'Two Pairs': '4466', 'Three of a Kind': '66', 'Five High Straight': '4466', 'Six High Straight': '4466', 'Full House': '4466', 'Four of a Kind': '66', 'Five of a Kind': '66' },
  34555: { 'Pair': '555', 'Two Pairs': '555', 'Three of a Kind': '555', 'Five High Straight': '555', 'Six High Straight': '555', 'Full House': '555', 'Four of a Kind': '555', 'Five of a Kind': '555' },
  34556: { 'Pair': '55', 'Two Pairs': '55', 'Three of a Kind': '55', 'Five High Straight': '3456', 'Six High Straight': '3456', 'Full House': '55', 'Four of a Kind': '55', 'Five of a Kind': '55' },
  34566: { 'Pair': '66', 'Two Pairs': '66', 'Three of a Kind': '66', 'Five High Straight': '3456', 'Six High Straight': '3456', 'Full House': '66', 'Four of a Kind': '66', 'Five of a Kind': '66' },
  34666: { 'Pair': '666', 'Two Pairs': '666', 'Three of a Kind': '666', 'Five High Straight': '666', 'Six High Straight': '666', 'Full House': '666', 'Four of a Kind': '666', 'Five of a Kind': '666' },
  35555: { 'Pair': '5555', 'Two Pairs': '5555', 'Three of a Kind': '5555', 'Five High Straight': '5555', 'Six High Straight': '5555', 'Full House': '5555', 'Four of a Kind': '5555', 'Five of a Kind': '5555' },
  35556: { 'Pair': '555', 'Two Pairs': '555', 'Three of a Kind': '555', 'Five High Straight': '555', 'Six High Straight': '555', 'Full House': '555', 'Four of a Kind': '555', 'Five of a Kind': '555' },
  35566: { 'Pair': '5566', 'Two Pairs': '5566', 'Three of a Kind': '66', 'Five High Straight': '5566', 'Six High Straight': '5566', 'Full House': '5566', 'Four of a Kind': '66', 'Five of a Kind': '66' },
  35666: { 'Pair': '666', 'Two Pairs': '666', 'Three of a Kind': '666', 'Five High Straight': '666', 'Six High Straight': '666', 'Full House': '666', 'Four of a Kind': '666', 'Five of a Kind': '666' },
  36666: { 'Pair': '6666', 'Two Pairs': '6666', 'Three of a Kind': '6666', 'Five High Straight': '6666', 'Six High Straight': '6666', 'Full House': '6666', 'Four of a Kind': '6666', 'Five of a Kind': '6666' },
  44444: { 'Pair': '44444', 'Two Pairs': '44444', 'Three of a Kind': '44444', 'Five High Straight': '44444', 'Six High Straight': '44444', 'Full House': '44444', 'Four of a Kind': '44444', 'Five of a Kind': '44444' },
  44445: { 'Pair': '4444', 'Two Pairs': '4444', 'Three of a Kind': '4444', 'Five High Straight': '4444', 'Six High Straight': '4444', 'Full House': '4444', 'Four of a Kind': '4444', 'Five of a Kind': '4444' },
  44446: { 'Pair': '4444', 'Two Pairs': '4444', 'Three of a Kind': '4444', 'Five High Straight': '4444', 'Six High Straight': '4444', 'Full House': '4444', 'Four of a Kind': '4444', 'Five of a Kind': '4444' },
  44455: { 'Pair': '44455', 'Two Pairs': '44455', 'Three of a Kind': '44455', 'Five High Straight': '44455', 'Six High Straight': '44455', 'Full House': '44455', 'Four of a Kind': '444', 'Five of a Kind': '444' },
  44456: { 'Pair': '444', 'Two Pairs': '444', 'Three of a Kind': '444', 'Five High Straight': '444', 'Six High Straight': '444', 'Full House': '444', 'Four of a Kind': '444', 'Five of a Kind': '444' },
  44466: { 'Pair': '44466', 'Two Pairs': '44466', 'Three of a Kind': '44466', 'Five High Straight': '44466', 'Six High Straight': '44466', 'Full House': '44466', 'Four of a Kind': '444', 'Five of a Kind': '444' },
  44555: { 'Pair': '44555', 'Two Pairs': '44555', 'Three of a Kind': '44555', 'Five High Straight': '44555', 'Six High Straight': '44555', 'Full House': '44555', 'Four of a Kind': '555', 'Five of a Kind': '555' },
  44556: { 'Pair': '4455', 'Two Pairs': '4455', 'Three of a Kind': '55', 'Five High Straight': '4455', 'Six High Straight': '4455', 'Full House': '4455', 'Four of a Kind': '55', 'Five of a Kind': '55' },
  44566: { 'Pair': '4466', 'Two Pairs': '4466', 'Three of a Kind': '66', 'Five High Straight': '4466', 'Six High Straight': '4466', 'Full House': '4466', 'Four of a Kind': '66', 'Five of a Kind': '66' },
  44666: { 'Pair': '44666', 'Two Pairs': '44666', 'Three of a Kind': '44666', 'Five High Straight': '44666', 'Six High Straight': '44666', 'Full House': '44666', 'Four of a Kind': '666', 'Five of a Kind': '666' },
  45555: { 'Pair': '5555', 'Two Pairs': '5555', 'Three of a Kind': '5555', 'Five High Straight': '5555', 'Six High Straight': '5555', 'Full House': '5555', 'Four of a Kind': '5555', 'Five of a Kind': '5555' },
  45556: { 'Pair': '555', 'Two Pairs': '555', 'Three of a Kind': '555', 'Five High Straight': '555', 'Six High Straight': '555', 'Full House': '555', 'Four of a Kind': '555', 'Five of a Kind': '555' },
  45566: { 'Pair': '5566', 'Two Pairs': '5566', 'Three of a Kind': '66', 'Five High Straight': '5566', 'Six High Straight': '5566', 'Full House': '5566', 'Four of a Kind': '66', 'Five of a Kind': '66' },
  45666: { 'Pair': '666', 'Two Pairs': '666', 'Three of a Kind': '666', 'Five High Straight': '666', 'Six High Straight': '666', 'Full House': '666', 'Four of a Kind': '666', 'Five of a Kind': '666' },
  46666: { 'Pair': '6666', 'Two Pairs': '6666', 'Three of a Kind': '6666', 'Five High Straight': '6666', 'Six High Straight': '6666', 'Full House': '6666', 'Four of a Kind': '6666', 'Five of a Kind': '6666' },
  55555: { 'Pair': '55555', 'Two Pairs': '55555', 'Three of a Kind': '55555', 'Five High Straight': '55555', 'Six High Straight': '55555', 'Full House': '55555', 'Four of a Kind': '55555', 'Five of a Kind': '55555' },
  55556: { 'Pair': '5555', 'Two Pairs': '5555', 'Three of a Kind': '5555', 'Five High Straight': '5555', 'Six High Straight': '5555', 'Full House': '5555', 'Four of a Kind': '5555', 'Five of a Kind': '5555' },
  55566: { 'Pair': '55566', 'Two Pairs': '55566', 'Three of a Kind': '55566', 'Five High Straight': '55566', 'Six High Straight': '55566', 'Full House': '55566', 'Four of a Kind': '555', 'Five of a Kind': '555' },
  55666: { 'Pair': '55666', 'Two Pairs': '55666', 'Three of a Kind': '55666', 'Five High Straight': '55666', 'Six High Straight': '55666', 'Full House': '55666', 'Four of a Kind': '666', 'Five of a Kind': '666' },
  56666: { 'Pair': '6666', 'Two Pairs': '6666', 'Three of a Kind': '6666', 'Five High Straight': '6666', 'Six High Straight': '6666', 'Full House': '6666', 'Four of a Kind': '6666', 'Five of a Kind': '6666' },
  66666: { 'Pair': '66666', 'Two Pairs': '66666', 'Three of a Kind': '66666', 'Five High Straight': '66666', 'Six High Straight': '66666', 'Full House': '66666', 'Four of a Kind': '66666', 'Five of a Kind': '66666' },
};
