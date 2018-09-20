import * as lodash from 'lodash';

let orc = {name: 'Орк', maxHp: 3, damage: 1, mannaCost: 2, movingPoints: 3};
let orcHero = {name: 'Геройский орк', maxHp: 6, damage: 1, mannaCost: 0, movingPoints: 3};

let playerA = {
  deck: lodash.range(20).map(i => orc),
  heroes: [
    orcHero
  ]
};

let playerB = {
  deck: lodash.range(20).map(i => orc),
  heroes: [
    orcHero
  ]
};

let startingCardsFixture = {
  playerA, playerB
};

export {startingCardsFixture};
