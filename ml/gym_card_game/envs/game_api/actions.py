from .getters import get_hero_id, get_hero_xy, get_game_id

# TODO remove after real actions
ACTION = ["N", "S", "E", "W"]


def action_move_to_command_data(raw_state, direction_code, player):
    action = ACTION[direction_code]
    
    hero_id = get_hero_id(raw_game_state, player)
    hero_x, hero_y = get_hero_xy(raw_game_state, player)
    x, y = hero_x, hero_y
    if ACTION == "N":
        y = hero_y + 1
    if ACTION == "S":
        y = hero_y - 1
    if ACTION == "E":
        x = hero_x + 1
    if ACTION == "W":
        x = hero_x - 1
        
    return {
        "x": x,
        "y": y,
        "game_id": get_game_id(raw_game_state),
        "card_id": hero_id,
     }
