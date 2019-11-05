const axios = require('axios');
const PF = require('pathfinding');

let gameId = 'xp90kyotfkfsey2lwwk2tscuia8fhe';
let playerId = 'l670w7momqn6329a6harl4puucloyx';
const serverAddress = 'http://localhost:3000/';

async function run () {
  let {gameData, currentPlayer, enemyPlayer} = await getGame();

  if (gameData.game.currentPlayersTurn === playerId) {
    for (let unit of currentPlayer.table) {
      let {gameData, currentPlayer, enemyPlayer} = await getGame();
      await doUnitAction(gameData, currentPlayer, enemyPlayer, unit);
    }

    await endTurn();
  } else {
    throw new Error('Its enemy turn');
  }
}

async function getGame() {
  // let response = await axios.get(`${serverAddress}getGame?gameId=${gameId}`);
  let response = await axios.get(`${serverAddress}getLastGame`);
  gameId = response.data.game.id;
  playerId = response.data.player1.id;

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

async function doUnitAction(game, currentPlayer, enemyPlayer, unit) {
  let {shortestPathUnit, shortestPath} = findShortestPath(game, currentPlayer, enemyPlayer, unit);

  shortestPath.pop();
  shortestPath.shift();

  if (shortestPath.length === 0) {
    // Можно бить
    await attack(unit, shortestPathUnit);
  } else if (shortestPath.length > unit.currentMovingPoints) {
    // Нужно идти
    let point = shortestPath[unit.currentMovingPoints - 1];
    await move(unit, point);
  } else {
    // Можно подойти и ударить
    let point = shortestPath[shortestPath.length - 1];
    await move(unit, point);
    await attack(unit, shortestPathUnit);
  }
}

async function endTurn() {
  await axios.post(`${serverAddress}endTurn`, {
    gameId,
    playerId
  });
}

async function move(unit, point) {
  console.log(`Unit x:${unit.x} y:${unit.y} try to move to x:${point[0]} y:${point[1]}`);
  await axios.post(`${serverAddress}moveCard`, {
    gameId,
    playerId,
    cardId: unit.id,
    x: point[0],
    y: point[1]
  });
}

async function attack(unit, attackedCard) {
  console.log(`Unit x:${unit.x} y:${unit.y} try to attack unit x:${attackedCard.x} y:${attackedCard.y}`);
  await axios.post(`${serverAddress}attackCard`, {
    gameId,
    playerId,
    attackerCardId: unit.id,
    attackedCardId: attackedCard.id
  });
}

function findShortestPath(game, currentPlayer, enemyPlayer, unit) {
  let shortestPath = new Array(100);
  let shortestPathUnit = null;

  for (let enemyUnit of enemyPlayer.table) {
    const grid = createMap(game, enemyPlayer);
    const finder = new PF.AStarFinder();
    const path = finder.findPath(unit.x, unit.y, enemyUnit.x, enemyUnit.y, grid);

    if (path.length < shortestPath.length) {
      shortestPathUnit = enemyUnit;
      shortestPath = path;
    }
  }

  return {shortestPathUnit, shortestPath};
}

function createMap(game, enemyPlayer) {
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
    grid.setWalkableAt(area.x, area.y, false);
  }

  // for (let unit of enemyPlayer.table) {
  //   grid.setWalkableAt(unit.x, unit.y, false);
  // }

  return grid;
}

run().catch((e)=> console.log(e.message));

// setInterval(run, 1000);
