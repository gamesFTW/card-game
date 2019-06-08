DEFAULT_PLAYER = 'player1'
DEFAULT_HERO_N = 0
DEFAULT_DEAD_HERO = {
    "hp": 0,
    "damage": 0,
    "tapped": False, 
    "alive": False,
    "movingPoints": 0,
    "range": 0,
    "manaCost": 0,
    "x": 0,
    "y": 0,
    
}

def list_get(l, i):
    try:
        return l[i]
    except IndexError:
        return None

def get_game_id(raw_game_state):
    return raw_game_state["game"]["id"]

def get_hero(raw_game_state, player = DEFAULT_PLAYER, hero_n=DEFAULT_HERO_N):
    heroes = list(filter(lambda x: x["hero"] == True, 
        raw_game_state[player]["table"]))
    hero = list_get(heroes, hero_n) 

    if not hero:
        hero = DEFAULT_DEAD_HERO

    return hero

def get_hero_mp(raw_game_state, player = DEFAULT_PLAYER, hero_n=DEFAULT_HERO_N):
    hero = get_hero(raw_game_state, player, hero_n)
    return hero["currentMovingPoints"]

def get_hero_id(raw_game_state, player = DEFAULT_PLAYER, hero_n=DEFAULT_HERO_N):
    hero = get_hero(raw_game_state, player, hero_n)
    return hero["id"]

def get_hero_xy(raw_game_state, player = DEFAULT_PLAYER, hero_n=DEFAULT_HERO_N):
    hero = get_hero(raw_game_state, player, hero_n)
    return hero["x"], hero["y"]
    