import numpy as np

from gym.spaces.utils import flatten

from .game_api import getters
from .game_api.mappings import get_board_mapping


def map_board(raw_game_state, player, opponent):
    board = np.zeros((10,10), dtype=int)

    for card in raw_game_state[player]['table']:
        n = get_board_mapping(card, my=True)
        board[card["x"], card["y"]] = n

    for card in raw_game_state[opponent]['table']:
        n = get_board_mapping(card, my=False)
        board[card["x"], card["y"]] = n

    for card in raw_game_state["areas"]:
        n = get_board_mapping(card)
        if not n == 0: #  из за бага windwall см get_board_mapping
            board[card["x"], card["y"]] = n


    return board

    
def map_hero(raw_game_state, player, n=0):
    hero = getters.get_hero(raw_game_state, player, n)
    return {
        # "currentHp":  hero["currentHp"],
        # "damage": hero["damage"],
        # "tapped": hero["tapped"], 
        # "alive": hero["alive"],
        # "currentMovingPoints": hero["currentMovingPoints"],
        # "range": 1,
        # "manaCost": hero["manaCost"],
        "x": hero["x"],
        "y": hero["y"],
    }

def map_raw_state_to_state(raw_game_state, player, opponent):
    return {
        # "hero0": map_hero(raw_game_state, player, 0),
        # "hero1": map_hero(raw_game_state, player, 1),
        # "opponentHero0": map_hero(raw_game_state, opponent, 0),
        # "opponentHero1": map_hero(raw_game_state, opponent, 1),
        "board": map_board(raw_game_state, player, opponent)
    }

# def map_raw_state_to_observation(observation_space, raw_game_state, player, opponent):
#     return flatten(observation_space, map_raw_state_to_state(raw_game_state, player, opponent))

def map_raw_state_to_observation(observation_space, raw_game_state, player, opponent):
    return map_raw_state_to_state(raw_game_state, player, opponent)["board"]

   