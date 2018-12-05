import * as lodash from 'lodash';

let hero = {name: 'Герой', maxHp: 6, damage: 1, mannaCost: 0, movingPoints: 3};

let fat = {name: 'Толстокожая', maxHp: 6, damage: 3, mannaCost: 6, movingPoints: 3};
let goblin = {name: 'Гоблин', maxHp: 4, damage: 2, mannaCost: 4, movingPoints: 3};
let boar = {name: 'Кабан', maxHp: 4, damage: 2, mannaCost: 4, movingPoints: 3};
let reptile = {name: 'Ящер', maxHp: 2, damage: 1, mannaCost: 2, movingPoints: 3};
let skeleton = {name: 'Скелет', maxHp: 2, damage: 1, mannaCost: 2, movingPoints: 3};

let units = [fat, goblin, boar, reptile, skeleton];

function createUnits (): any {
  return lodash.shuffle(
    units.reduce((accumulator, card) => {
      return accumulator.concat(lodash.range(5).map(i => card));
    }, [])
  );
}

let playerA = {
  deck: createUnits(),
  heroes: [
    hero
  ]
};

let playerB = {
  deck: createUnits(),
  heroes: [
    hero
  ]
};

let startingCardsFixture = {
  playerA, playerB
};

export {startingCardsFixture};
