type CardId = string;

type CardData = {
  id: CardId;
  name?: string;
  maxHp?: number;
  currentHp?: number;
  damage?: number;
  alive?: boolean;
  tapped?: boolean;
  mannaCost?: number;
  movingPoints?: number;
  currentMovingPoints?: number;
  x?: number;
  y?: number;
};

export {CardData, CardId};
