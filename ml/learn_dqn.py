import numpy as np

import gym
from gym.spaces.utils import flatdim
import gym_card_game

from keras.models import Sequential
from keras.layers import Dense, Activation, Flatten, Input, Reshape
from keras.optimizers import Adam

from tensorflow.python.keras.callbacks import TensorBoard

from rl.agents.dqn import DQNAgent
from rl.policy import LinearAnnealedPolicy, BoltzmannQPolicy, EpsGreedyQPolicy
from rl.memory import SequentialMemory

ENV_NAME = 'card_game-v0'

# Get the environment and extract the number of actions.
tensor_board = TensorBoard('/tmp/tensor')
env = gym.make(ENV_NAME)
nb_actions = env.action_space.n


# Model
obs_dims = flatdim(env.observation_space)

model = Sequential()
model.add(Flatten(input_shape=(1, obs_dims)))
model.add(Dense(24))
model.add(Activation('relu'))
model.add(Dense(12))
model.add(Activation('relu'))
model.add(Dense(nb_actions))
model.add(Activation('linear'))
print(model.summary())

# Agent
# gamma = 0.95
# epsilon = 1.0
# epsilon_min = 0.01
# epsilon_decay = 0.995
learning_rate = .001
steps = 5000

memory = SequentialMemory(limit=1000, window_length=1)
# policy = BoltzmannQPolicy()
policy = LinearAnnealedPolicy(EpsGreedyQPolicy(), attr='eps', value_max=1., value_min=.1, value_test=.05,
                              nb_steps=int(steps*0.75))
dqn = DQNAgent(
    model=model, nb_actions=nb_actions, memory=memory,
    nb_steps_warmup=10, policy=policy,
    gamma=.99, target_model_update=1000,
 )
dqn.compile(Adam(lr=learning_rate), metrics=['mae'])


dqn.fit(env, nb_steps=steps, visualize=False, verbose=2, callbacks=[tensor_board])


dqn.save_weights('dqn_{}_weights.h5f'.format(ENV_NAME), overwrite=True)

# Finally, evaluate our algorithm for 5 episodes.
dqn.test(env, nb_episodes=2, visualize=True)
