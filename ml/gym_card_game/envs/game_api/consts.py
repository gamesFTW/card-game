import json
import os

HOST = "localhost"
PORT = 3000
HOST_URL = "http://" + HOST + ":" + str(PORT)

API_URLS = {
  "CREATE_GAME": HOST_URL + "/createGame",
  "GET_GAME": HOST_URL + "/getGame",
  "MOVE_CARD": HOST_URL + "/moveCard",
  "END_TURN": HOST_URL + "/endTurn",
  "CLREAR_CACHE": HOST_URL + "/clearInMemoryCache",
}


CREATE_GAME_JSON = ''
with open(os.path.dirname(os.path.realpath(__file__)) + "/fixtures/test-initial-game-data.json", 'r') as f:
  CREATE_GAME_JSON = json.load(f)
