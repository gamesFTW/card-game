const axios = require('axios');
const lodash = require('lodash');
const PF = require('pathfinding');

let gameId = 'xp90kyotfkfsey2lwwk2tscuia8fhe';
let playerId = 'l670w7momqn6329a6harl4puucloyx';
const serverAddress = 'http://game.ep1c.org:3000/';

async function run () {
  let {gameData, currentPlayer, enemyPlayer} = await getGame();

  if (gameData.game.currentPlayersTurn === playerId) {
    try {
      if (currentPlayer.manaPool.length < 5) {
          await playCardAsMana(currentPlayer.hand[0]);
          await playCardAsMana(currentPlayer.hand[1]);
      }

      await playCards(gameData, currentPlayer, enemyPlayer);

      for (let unit of currentPlayer.table) {
          let {gameData, currentPlayer, enemyPlayer} = await getGame();
          await doUnitAction(gameData, currentPlayer, enemyPlayer, unit);
      }
    } catch(e) {
      console.log(e);
    }

    await endTurn();
  } else {
    console.log('Its enemy turn');
  }
}

async function getGame() {
  // let response = await axios.get(`${serverAddress}getGame?gameId=${gameId}`);
  let response = await axios.get(`${serverAddress}getLastGame`);
  gameId = response.data.game.id;
  playerId = response.data.player2.id;

  const gameData = response.data;
  let currentPlayer = null;
  let enemyPlayer = null;

  if (gameData.player1.id === playerId) {
    currentPlayer = gameData.player1;
    enemyPlayer = gameData.player2;
  } else {
    currentPlayer = gameData.player2;
    enemyPlayer = gameData.player1;
  }

  return {gameData, currentPlayer, enemyPlayer};
}

async function playCards(gameData, currentPlayer, enemyPlayer) {
  let mana = currentPlayer.manaPool.filter(card => !card.tapped).length;
  let cards = currentPlayer.hand.filter((card) => card.manaCost <= mana);

  let heroes = currentPlayer.table.filter((card) => card.hero);

  if (cards.length > 0 && heroes.length > 0) {
    const cardToPlay = cards[0];

    const map = createMap(gameData, currentPlayer, enemyPlayer);
    const pointsToCast = [];
    for (let hero of heroes) {
      if (map[hero.x - 1][hero.y] === 0){
        pointsToCast.push([hero.x - 1, hero.y]);
      }
      if (map[hero.x + 1][hero.y] === 0){
        pointsToCast.push([hero.x + 1, hero.y]);
      }
      if (map[hero.x][hero.y - 1] === 0){
        pointsToCast.push([hero.x, hero.y - 1]);
      }
      if (map[hero.x][hero.y + 1] === 0){
        pointsToCast.push([hero.x, hero.y + 1]);
      }
    }

    let point = lodash.sample(pointsToCast);

    await playCard(cardToPlay, point);
  }
}

async function doUnitAction(game, currentPlayer, enemyPlayer, unit) {
  let adjacentUnit = getAdjacentUnit(game, currentPlayer, enemyPlayer, unit);

  if (adjacentUnit) {
    // Можно бить
    await attack(unit, adjacentUnit);
  } else {
    if (unit.currentMovingPoints > 0) {
      const ignoreTiles = [];
      let i = 1;
      await moveOrAttackLoop(game, currentPlayer, enemyPlayer, unit, i, ignoreTiles);
    }
  }
}

async function moveOrAttackLoop(game, currentPlayer, enemyPlayer, unit, i, ignoreTiles) {
  const result = await moveOrAttack(game, currentPlayer, enemyPlayer, unit, ignoreTiles);

  if (result.result === 'ok') {
    return;
  } else if (i < 3) {
    ignoreTiles.push(result.point);
    i++;
    await moveOrAttackLoop(game, currentPlayer, enemyPlayer, unit, i, ignoreTiles);
  }
}

async function moveOrAttack(game, currentPlayer, enemyPlayer, unit, ignoreTiles) {
  let {shortestPathUnit, shortestPath} = findShortestPath(game, currentPlayer, enemyPlayer, unit, ignoreTiles);

  if (shortestPath.length > unit.currentMovingPoints) {
    // Нужно идти
    let point = shortestPath[unit.currentMovingPoints - 1];
    const result = await move(unit, point);
    return {result, point};
  } else {
    // Можно подойти и ударить
    let point = shortestPath[shortestPath.length - 1];
    const result = await move(unit, point);
    if (result === 'fail') {
      return {result, point};
    }
    await wait(700);
    await attack(unit, shortestPathUnit);
    return {result: 'ok'};
  }
}

async function playCard(unit, point) {
  console.log(`Try cast card to x:${point[0]} y:${point[1]}`);

  try {
    await axios.post(`${serverAddress}playCard`, {
      gameId,
      playerId,
      cardId: unit.id,
      x: point[0],
      y: point[1]
    });
    console.log('ok');
    return 'ok';
  } catch(e) {
    console.log('fail');
    return 'fail';
  }
}

async function playCardAsMana(unit) {
  console.log(`Try cast card as mana`);

  try {
    await axios.post(`${serverAddress}playCardAsMana`, {
      gameId,
      playerId,
      cardId: unit.id
    });
    console.log('ok');
  } catch(e) {
    console.log('fail');
  }
}

async function move(unit, point) {
  console.log(`Unit x:${unit.x} y:${unit.y} try to move to x:${point[0]} y:${point[1]}`);

  try {
    await axios.post(`${serverAddress}moveCard`, {
      gameId,
      playerId,
      cardId: unit.id,
      x: point[0],
      y: point[1]
    });
    console.log('ok');
    return 'ok';
  } catch(e) {
    console.log('fail');
    return 'fail';
  }
}

async function attack(unit, attackedCard) {
  console.log(`Unit x:${unit.x} y:${unit.y} try to attack unit x:${attackedCard.x} y:${attackedCard.y}`);

  try {
    await axios.post(`${serverAddress}attackCard`, {
      gameId,
      playerId,
      attackerCardId: unit.id,
      attackedCardId: attackedCard.id
    });
      console.log('ok');
  } catch(e) {
      console.log('fail');
  }
}

async function endTurn() {
  await axios.post(`${serverAddress}endTurn`, {
    gameId,
    playerId
  });
}

function findShortestPath(game, currentPlayer, enemyPlayer, unit, ignoreTiles) {
  let shortestPath = new Array(100);
  let shortestPathUnit = null;

  for (let enemyUnit of enemyPlayer.table) {
    const grid = createPFMap(game, enemyPlayer, ignoreTiles);
    const finder = new PF.AStarFinder();
    const path = finder.findPath(unit.x, unit.y, enemyUnit.x, enemyUnit.y, grid);

    if (path.length > 0 && path.length < shortestPath.length) {
      shortestPathUnit = enemyUnit;
      shortestPath = path;
    }
  }

  shortestPath.pop();
  shortestPath.shift();

  return {shortestPathUnit, shortestPath};
}

function getAdjacentUnit(game, currentPlayer, enemyPlayer, unit) {
  let adjacentUnit = null;

  for (let enemyUnit of enemyPlayer.table) {
    if (checkUnitsAdjacency(unit, enemyUnit)) {
      adjacentUnit = enemyUnit;
    }
  }

  return adjacentUnit;
}

function createPFMap(game, enemyPlayer, ignoreTiles) {
  const grid = new PF.Grid([
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ]);

  for (let area of game.areas) {
    if (area.type !== "windWall") {
      grid.setWalkableAt(area.x, area.y, false);
    }
  }

  for (let point of ignoreTiles) {
    grid.setWalkableAt(point[0], point[1], false);
  }

  return grid;
}

function createMap(game, currentPlayer, enemyPlayer) {
  const grid = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ];

  for (let area of game.areas) {
    if (area.type !== "windWall") {
      grid[area.x][area.y] = 1;
    }
  }

  for (let unit of currentPlayer.table) {
    grid[unit.x][unit.y] = 1;
  }

  for (let unit of enemyPlayer.table) {
    grid[unit.x][unit.y] = 1;
  }

  return grid;
}

function checkUnitsAdjacency (firstCard, secondCard) {
  let xDistance = Math.abs(firstCard.x - secondCard.x);
  let yDistance = Math.abs(firstCard.y - secondCard.y);

  if (xDistance + yDistance < 2) {
    return true;
  }

  return false;
}


async function wait(ms) {
  return new Promise((res, rej) => setTimeout(() => res(), ms));
}


async function runInterval() {
  await run();

  await wait(1000);

  await runInterval();
}

runInterval();

//run().catch((e)=> console.log(e.message));