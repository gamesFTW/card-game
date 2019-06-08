from gym import error, spaces
import numpy as np

CARD_SPACE = spaces.Dict({
    "currentHp": spaces.Box(low=0, high=10, shape=(1,), dtype=np.int),
    "damage": spaces.Box(low=0, high=10, shape=(1,), dtype=np.int),
    "tapped": spaces.Box(low=0, high=1, shape=(1,), dtype=np.bool),
    "alive": spaces.Box(low=0, high=1, shape=(1,), dtype=np.bool),
    "currentMovingPoints": spaces.Box(low=0, high=10, shape=(1,), dtype=np.int),
    "range": spaces.Box(low=0, high=10, shape=(1,), dtype=np.int),
    "manaCost": spaces.Box(low=0, high=10, shape=(1,), dtype=np.int),

    "x": spaces.Box(low=1, high=9, shape=(1,), dtype=np.int),
    "y": spaces.Box(low=1, high=9, shape=(1,), dtype=np.int),

})

