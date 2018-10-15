let pointerToIcometric = function (pointer: {x: number, y: number}) {
  let x = pointer.x;
  let y = pointer.y;

  //let TILE_WIDTH = 120;
  //let TILE_HEIGHT = 60;
  //let xOffset = 680;
  //let yOffset = 120;

  let TILE_WIDTH = 130;
  let TILE_HEIGHT = 65;

  let xOffset = 580 + 20;//870;
  let yOffset = 60; //210;

  return {
    x: (x - y) * (TILE_WIDTH / 2) + xOffset,
    y: (x + y) * (TILE_HEIGHT / 2) + yOffset
  };
};

export {pointerToIcometric};
