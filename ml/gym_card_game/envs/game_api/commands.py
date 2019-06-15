#!/usr/bin/python3
import logging

from gym_card_game.envs.infra.req_session import get_session

from .consts import API_URLS, CREATE_GAME_JSON

logger = logging.getLogger(__name__)

def move_ceature(game_id, player_id, card_id, x, y):
  session = get_session()
  data = {
    "gameId": game_id,
    "playerId": player_id,
    "cardId": card_id,
    "x": x, "y": y,
  }
  r = session.post(API_URLS["MOVE_CARD"], json = data)

  logger.debug("move {} {} {}".format(card_id, x, y))
  if r.status_code == 500:
    logger.debug("{} {}".format(r.status_code,r.text))
    return False

  if r.status_code == 520:
    raise Exception('Server returned 520: "{}" on "{}" '.format(r.text, data))

  
  return True
  

# move_ceature("v6sywzzngkg8bdeye0afxvmg6is4df", "0p4agfhf13punpgoezkqe0de02nxbg", "cf4zpfpezz8johugkakufkgmr0l9j4", 6, 4)
