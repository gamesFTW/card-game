import numpy as np

from game_api import getters

def map_board(raw_game_state, player, opponent):
    board = np.zeros((9,9), dtype=int)

    for card in raw_game_state[player]['hand']:
        n = -1
        if card["hero"]:
            n = -2
        board[card["x"], card["y"]] = n

    for card in raw_game_state[opponent]['hand']:
        n = 1
        if card["hero"]:
            n = 2
        board[card["x"], card["y"]] = n

    return board

        

    
def map_hero(raw_game_state, player):
    hero = getters.get_hero(raw_game_state, player)
    return {
        "hp":  hero["alive"],
        "damage": hero["damage"],
        "tapped": hero["tapped"], 
        "alive": hero["alive"],
        "movingPoints": hero["movingPoints"],
        "range": 1,
        "manaCost": hero["manaCost"],
    }


def map_raw_state_to_observation(raw_game_state, player, opponent):
    return {
        "hero1": map_hero(raw_game_state, player),
        "board": map_board(raw_game_state, player, opponent)

    }


    