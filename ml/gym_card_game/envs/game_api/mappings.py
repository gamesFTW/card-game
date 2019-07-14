BOARD_EMPTY = 0

BOARD_HERO = 1
BOARD_OPPONENT_HERO = 2

BOARD_CREATURE = 5
BOARD_OPPONENT_CREATURE = 7

BOARD_WIND_WALL = -1
BOARD_LAKE = -2
BOARD_MONTAIN = -3

def get_board_mapping(entity = None, my = False):
    if not entity:
        return BOARD_EMPTY

    t = entity["type"]

    if t == "lake":
        return BOARD_LAKE

    if t == "mountain":
        return BOARD_MONTAIN

    if t == "windWall":
        # Из за бага с заменой x,y при вставании, пока не показываем боту wind wall
        # return BOARD_WIND_WALL
        return BOARD_EMPTY

    if my:
        if entity["hero"]:
            return BOARD_HERO
        return BOARD_CREATURE
    
    if not my:
        if entity["hero"]:
            return BOARD_OPPONENT_HERO
        return BOARD_OPPONENT_CREATURE

    
    raise Exception('Unknow entitny {}'.format(entity))
