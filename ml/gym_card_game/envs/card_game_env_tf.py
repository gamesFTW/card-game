import tensorflow as tf
import numpy as np

from tf_agents.environments import py_environment
from tf_agents.environments import tf_environment
from tf_agents.environments import tf_py_environment
from tf_agents.environments import utils
from tf_agents.specs import array_spec
from tf_agents.environments import wrappers
from tf_agents.environments import suite_gym
from tf_agents.trajectories import time_step as ts

from .game_api import game, commands, getters, actions, mappings
from .space.card import CARD_SPACE
from .state import map_raw_state_to_observation, map_raw_state_to_state
from .reward import calc_reward

tf.compat.v1.enable_v2_behavior()


class CardGameEnv(py_environment.PyEnvironment):

  def __init__(self):
    self._action_spec = array_spec.BoundedArraySpec(
        shape=(), dtype=np.int32, minimum=0, maximum=3, name='action')
    self._observation_spec = array_spec.BoundedArraySpec(
        shape=(10,10), dtype=np.int32, minimum=-10, maximum=10, name='observation')

    self._game_id = game.create_game()
    self.get_game()
    self._player = "player1"
    self._opponent = "player2"
        
    self._state = map_raw_state_to_observation(None, self.raw_state, self._player, self._opponent)

    self._episode_ended = False

  def action_spec(self):
    return self._action_spec

  def observation_spec(self):
    return self._observation_spec

  def _reset(self):
    game.clear_cache_in_memory()

    self._game_id = game.create_game()
    self.get_game()
        
    self._state = map_raw_state_to_observation(None, self.raw_state, self._player, self._opponent)
    self._episode_ended = False

    return ts.restart(np.array([self._state], dtype=np.int32))

  def _step(self, action):
    if self._episode_ended or self.is_game_stop():
      return self.reset()

    self.time_to_end_turn() # if your mp is over, end of turn
    
    self.save_prev_game()

    data = actions.action_move_to_command_data(self.raw_state, direction_code, self._player)
    isValid = commands.move_ceature(**data)
    self.get_game()

    self._state = map_raw_state_to_observation(self.observation_space, self.raw_state, self._player, self._opponent)

    is_done = self.is_game_stop()
    reward = -100

    if isValid:
      reward = calc_reward(self.prev_raw_state, self.raw_state, self._player, self._opponent)
    else:
      reward = -2

    if reward == 100:
      is_done = True

    if is_done:
      self._episode_ended = True
      return ts.termination(np.array([self._state], dtype=np.int32), reward)
    else:
      return ts.transition(
          np.array([self._state], dtype=np.int32), reward=reward, discount=1.0)


  def get_game(self):
    self.raw_state = game.get_game_state(self._game_id)

  def save_prev_game(self):
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
    # return False
    return self.raw_state["game"]["currentTurn"] > 8
