let hero = {hero: true, name: 'Герой', maxHp: 6, damage: 1, manaCost: 0, image: '/cfs/files/Images/7fx9bCmshAvACpudy/creature-range-boomerang1.png'};

let goblin = {name: 'Гоблин', maxHp: 4, damage: 1, manaCost: 0, image: '/cfs/files/Images/7fx9bCmshAvACpudy/creature-range-boomerang1.png'};

let playerA = {
  deck: [goblin, goblin, goblin, goblin, goblin, goblin, goblin, goblin, goblin, goblin, goblin, goblin],
  heroes: [hero, hero]
};

let playerB = {
  deck: [goblin, goblin, goblin, goblin, goblin, goblin, goblin, goblin, goblin, goblin, goblin, goblin],
  heroes: [hero, hero]
};

let startingCardsFixture = {
  playerA, playerB
};

export {startingCardsFixture};
