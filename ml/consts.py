import json

HOST = "localhost"
PORT = 3000
HOST_URL = "http://" + HOST + ":" + str(PORT)

API_URLS = {
  "CREATE_GAME": HOST_URL + "/createGame",
  "GET_GAME": HOST_URL + "/getGame",
  "MOVE_CARD": HOST_URL + "/moveCard"
}


f = open("fixtures/test-initial-game-data.json", 'r')
CREATE_GAME_JSON = json.load(f)
