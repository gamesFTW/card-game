#!/usr/bin/python3
from consts import API_URLS, CREATE_GAME_JSON
import requests


def what_commands_can_i_do():
  pass

def move_ceature(game_id, player_id, card_id, x, y):
  r = requests.post(API_URLS["MOVE_CARD"], json = {
    "gameId": game_id,
    "playerId": player_id,
    "cardId": card_id,
    "x": x, "y": y,
  })

  if not r.status_code == 200:
    print ("SOME WTF IN MOVE", r.text)
  

# move_ceature("v6sywzzngkg8bdeye0afxvmg6is4df", "0p4agfhf13punpgoezkqe0de02nxbg", "cf4zpfpezz8johugkakufkgmr0l9j4", 6, 4)
