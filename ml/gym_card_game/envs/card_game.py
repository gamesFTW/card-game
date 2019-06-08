
    
import os, subprocess, time, signal
import gym
import numpy as np
from gym import error, spaces
from gym import utils
from gym.utils import seeding

from .game_api import game, commands, getters, actions
from .space.card import CARD_SPACE
from .state import map_raw_state_to_observation, map_raw_state_to_state




import logging
logger = logging.getLogger(__name__)



class CardGameEnv(gym.Env, utils.EzPickle):
    metadata = {'render.modes': ['human', 'ansii']}

    def __init__(self):
        self.observation_space = spaces.Dict({
            "board": spaces.Box(low=-2, high=2, shape=(9,9), dtype=np.int),
            "hero0": CARD_SPACE,
            "hero1": CARD_SPACE,
            "opponentHero0": CARD_SPACE,
            "opponentHero1": CARD_SPACE,
        })
        self._create_action_space()

    def _seed(self, seed=None):
        self.np_random, seed = seeding.np_random(seed)
        return [seed]

    def render(self, mode="ansii", close=False):
        ob = map_raw_state_to_state(self.raw_state, self._player, self._opponent)
        logger.info(ob["board"])


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


    def step(self, direction_code):
        self.time_to_end_turn()

        data = actions.action_move_to_command_data(self.raw_state, direction_code, self._player)
        commands.move_ceature(**data)
        self.get_game()

        self.state = map_raw_state_to_observation(self.observation_space, self.raw_state, self._player, self._opponent)

        reward = 0
        return self.state, reward, self.is_game_stop(), {}

    def get_game(self):
         self.raw_state = game.get_game_state(self._game_id)

    def time_to_end_turn(self):
        mp = getters.get_hero_mp(self.raw_state, self._player)
        if mp < 1:
            logger.debug("MP of hero {}. Double end of tour".format(mp))
            game.end_turn(self.raw_state)
            self.get_game()
            game.end_turn(self.raw_state)
            self.get_game()
            return 

        logger.debug("MP of hero {}".format(mp))
        
    def is_game_stop(self):
        return self.raw_state["game"]["currentTurn"] > 10


        


