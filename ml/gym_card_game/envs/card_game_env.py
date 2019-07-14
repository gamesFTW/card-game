
    
import os, subprocess, time, signal, copy

import gym
from gym import error, spaces
from gym import utils
import numpy as np

from .game_api import game, commands, getters, actions, mappings
from .space.card import CARD_SPACE
from .state import map_raw_state_to_observation, map_raw_state_to_state
from .reward import calc_reward

import logging
# logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)


class CardGameEnv(gym.Env, utils.EzPickle):
    metadata = {'render.modes': ['human', 'ansii']}

    def __init__(self):
        self.observation_space = spaces.Box(low=-10, high=10, shape=(10,10), dtype=np.int)
            # (spaces.Discrete(2), spaces.Discrete(3))) spaces.Dict({
           
            # "hero0": CARD_SPACE,
            # "hero1": CARD_SPACE,
            # "opponentHero0": CARD_SPACE,
            # "opponentHero1": CARD_SPACE,
        self._create_action_space()

    def _seed(self, seed=None):
        self.np_random, seed = utils.seeding.np_random(seed)
        return [seed]

    def render(self, mode="ansii", close=False):
        ob = map_raw_state_to_state(self.raw_state, self._player, self._opponent)
        for x, row in enumerate(ob["board"]):
            line = []
            for y, board_code in enumerate(row):
                if board_code == mappings.BOARD_HERO:
                    line.append("😎")
                if board_code == mappings.BOARD_EMPTY:
                    line.append("░")
                if board_code == mappings.BOARD_OPPONENT_HERO:
                    line.append("👻")
                if board_code < 0:
                    line.append("▓")
            print(" ".join(line))
        print("---------")


    def _create_action_space(self):
        self.action_names = actions.ACTION
        self.action_space = spaces.Discrete(4)

        self.actions = spaces.Discrete(4)

        logger.debug(self.action_space)

    def reset(self):
        game.clear_cache_in_memory()

        self._game_id = game.create_game()
        self.get_game()
        self._player = "player1"
        self._opponent = "player2"
        
        self.state = map_raw_state_to_observation(self.observation_space, self.raw_state, self._player, self._opponent)
        return self.state


    def step(self, direction_code): # [кто, что, куда]
        self.time_to_end_turn()
        self.save_pre_game()

        data = actions.action_move_to_command_data(self.raw_state, direction_code, self._player)
        isValid = commands.move_ceature(**data)
        self.get_game()

        self.state = map_raw_state_to_observation(self.observation_space, self.raw_state, self._player, self._opponent)

        is_done = self.is_game_stop()
        reward = -100

        if isValid:
            reward = calc_reward(self.prev_raw_state, self.raw_state, self._player, self._opponent)
        else:
            reward = -2

        if reward == 100:
            is_done = True

        return self.state, reward, is_done, {}

    def get_game(self):
        self.raw_state = game.get_game_state(self._game_id)

    def save_pre_game(self):
        self.prev_raw_state = copy.deepcopy(self.raw_state)

    def time_to_end_turn(self):
        hero = getters.get_hero(self.raw_state, self._player)
        mp = hero["currentMovingPoints"]
        tapped = hero["tapped"]
        if mp < 1 or tapped:
            logger.debug("MP of hero {}. Double end of tour".format(mp))
            game.end_turn(self.raw_state, self.raw_state["game"]["player1Id"])
            game.end_turn(self.raw_state, self.raw_state["game"]["player2Id"])
            self.get_game()
            return 

        # logger.debug("state {}".format(getters.get_hero(self.raw_state, self._player)))
        logger.debug("MP of hero {}".format(mp))
        
    def is_game_stop(self):
        return False
        # return self.raw_state["game"]["currentTurn"] > 8


        


