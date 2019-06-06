from gym.envs.registration import register

register(
    id='card_game-v0',
    entry_point='gym_card_game.envs:CardGameEnv',
)
