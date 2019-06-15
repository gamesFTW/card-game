
    
import os, subprocess, time, signal, copy

from game_api.game import create_game, end_turn, get_game_state
from game_api.actions import action_move_to_command_data
from game_api.commands import move_ceature

import time

#from game_api import game, commands, getters, actions

import logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)


class Game():
    def go(self):
        direction_code = 1
        self.player = "player1"
        self.opponent = "player2"




        self.game_id = create_game()
        self.get_game()



        data = action_move_to_command_data(self.raw_state, direction_code, self.player)
        
        start = time.time()
        move_ceature(**data)
        end = time.time()
        print("move_ceature: " + str(end - start))

        self.get_game()




        start = time.time()
        end_turn(self.raw_state)
        end = time.time()
        print("end_turn: " + str(end - start))
        self.get_game()

    def get_game(self):
        start = time.time()
        self.raw_state = get_game_state(self.game_id)
        end = time.time()
        print("get_game: " + str(end - start))

game = Game()
game.go()

