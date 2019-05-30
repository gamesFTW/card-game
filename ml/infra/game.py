#!/usr/bin/python3
from consts import API_URLS, CREATE_GAME_JSON
import requests



def create_game():
  r = requests.post(API_URLS["CREATE_GAME"], json = CREATE_GAME_JSON)
  game_id = r.json()["gameId"]
  print ("Created", game_id)
  return game_id

def get_game_state(game_id):
  r = requests.get(API_URLS["GET_GAME"], {"gameId": game_id})
  return r.json()


  
# getGame("v6sywzzngkg8bdeye0afxvmg6is4df")
