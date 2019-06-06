DEFAULT_PLAYER = 'player1'
DEFAULT_HERO_N = 0

def get_game_id(raw_game_state):
    return raw_game_state["game"]["id"]

def get_hero(raw_game_state, player = DEFAULT_PLAYER, hero_n=DEFAULT_HERO_N):
    heros = filter(lambda x: x["hero"] == True, 
        raw_game_state[player]["hand"])
    return heroes[hero_n]

def get_hero_mp(raw_game_state, player = DEFAULT_PLAYER, hero_n=DEFAULT_HERO_N):
    heros = filter(lambda x: x["hero"] == True, 
        raw_game_state[player]["hand"])
    return heroes[hero_n]["movingPoints"]

def get_hero_id(raw_game_state, player = DEFAULT_PLAYER, hero_n=DEFAULT_HERO_N):
    heros = filter(lambda x: x["hero"] == True, 
        raw_game_state[player]["hand"])
    return heroes[hero_n]["_id"]

def get_hero_xy(raw_game_state, player = DEFAULT_PLAYER, hero_n=DEFAULT_HERO_N):
    heros = filter(lambda x: x["hero"] == True, 
        raw_game_state[player]["hand"])
    return heroes[hero_n]["x"], heroes[hero_n]["y"] 
    