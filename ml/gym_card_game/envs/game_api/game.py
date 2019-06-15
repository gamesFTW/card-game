#!/usr/bin/python3

import logging

from .infra.req_session import get_session
from .consts import API_URLS, CREATE_GAME_JSON

logger = logging.getLogger(__name__)



def create_game():
  session = get_session()
  r = session.post(API_URLS["CREATE_GAME"], json = CREATE_GAME_JSON)
  game_id = r.json()["gameId"]
  logger.debug("Created", game_id)
  return game_id

def end_turn(raw_state):
  session = get_session()
  data = {
    "playerId": raw_state["game"]["currentPlayersTurn"],
    "gameId": raw_state["game"]["id"]
  }
  r = session.post(API_URLS["END_TURN"], json = data)
  # game_id = r.json()["gameId"]
  logger.debug("End of turn")

def get_game_state(game_id):
  session = get_session()
  r = session.get(API_URLS["GET_GAME"], params={"gameId": game_id})
  if not r.status_code == 200:
    raise Exception('Error on get game {}'.format(game_id))
  return r.json()


def clear_cache_in_memory():
  session = get_session()
  r = session.post(API_URLS["CLREAR_CACHE"])  
  if r.status_code == 200:
    logger.debug("Cache clreaed")

  
# getGame("v6sywzzngkg8bdeye0afxvmg6is4df")
