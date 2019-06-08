import math

from gym_card_game.envs.game_api import getters

def get_distance(x1, y1, x2, y2):
    return math.sqrt( ((x1-x2)**2)+((y1-y2)**2) )

def calc_heros_distance_reward(old_state, new_state, player, opponent):
    old_hero0 = getters.get_hero(old_state, player, 0)
    old_heroOpponent0 = getters.get_hero(old_state, opponent, 0)
    new_hero0 = getters.get_hero(new_state, player, 0)
    new_heroOpponent0 = getters.get_hero(new_state, opponent, 0)

    old_distance = get_distance(old_hero0["x"], old_hero0["y"], old_heroOpponent0["x"], old_heroOpponent0["y"])
    new_distance = get_distance(new_hero0["x"], new_hero0["y"], new_heroOpponent0["x"], new_heroOpponent0["y"])
 
    if old_distance < new_distance:
        return 1
    else:
        return 0


def calc_reward(old_state, new_state, player, opponent):
    reward = 0

    reward += calc_heros_distance_reward(old_state, new_state, player, opponent)

    return reward
