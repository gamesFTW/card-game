from gym import error, spaces

CARD_SPACE = spaces.Dict({
    "hp": spaces.Discrete(10),
    "damage": spaces.Discrete(10),
    "tapped": spaces.Discrete(1), 
    "alive": spaces.Discrete(1),
    "movingPoints": spaces.Discrete(10),
    "range": spaces.Discrete(10),
    "manaCost": spaces.Discrete(10),
})

