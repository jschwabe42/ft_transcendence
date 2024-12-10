import asyncio
import math
import json
import sys
import random


class PongGame:
	def __init__(self, player1, player2):
		self.player1 = player1
		self.player2 = player2
		self.canvas_width = 800
		self.canvas_height = 600

		self.playerOneKeyUp = False
		self.playerOneKeyDown = False
		self.playerTwoKeyUp = False
		self.playerTwoKeyDown = False

		self.paddle_collision = False
		self.game_tick = 0
		self.collision_timer = 0

		# Ball state
		self.ball = {
			'x': self.canvas_width / 2,
			'y': self.canvas_height / 2,
			'radius': 10,
			'speed': 2,
			'vx': 2,
			'vy': random.uniform(0, 3),
		}

		# Paddle state
		self.paddle_height = 180
		self.paddle_width = 20
		self.paddles = {
			self.player1: {
				'x': 0,
				'y': self.canvas_height / 2 - self.paddle_height / 2,
				},
			
			self.player2: {
				'x': self.canvas_width - self.paddle_width,
				'y': self.canvas_height / 2 - self.paddle_height / 2,
				},
		}

		self.scores = {
			self.player1: 0,
			self.player2: 0,
		}
		self.winner = {
			self.player1: False,
			self.player2: False,
		}
		self.running = False

	def update_game_state(self):
		self._check_paddle_collision()
		# move padels
		if self.playerOneKeyUp == True:
			paddle = self.paddles["player1"]
			paddle['y'] -= 5
		if (self.playerOneKeyDown == True):
			paddle = self.paddles["player1"]
			paddle['y'] += 5
		if self.playerTwoKeyUp == True:
			paddle = self.paddles["player2"]
			paddle['y'] -= 5
		if (self.playerTwoKeyDown == True):
			paddle = self.paddles["player2"]
			paddle['y'] += 5
		# move ball
		self.move_ball()


	def move_paddle(self, player, key):
		if (player == "player1"):
			if (key == "KeyDownArrowUp"):
				self.playerOneKeyUp = True
			if (key == "KeyDownArrowDown"):
				self.playerOneKeyDown = True
			if (key == "KeyUpArrowUp"):
				self.playerOneKeyUp = False
			if (key == "KeyUpArrowDown"):
				self.playerOneKeyDown = False

		if (player == "player2"):
			if (key == "KeyDownArrowUp"):
				self.playerTwoKeyUp = True
			if (key == "KeyDownArrowDown"):
				self.playerTwoKeyDown = True
			if (key == "KeyUpArrowUp"):
				self.playerTwoKeyUp = False
			if (key == "KeyUpArrowDown"):
				self.playerTwoKeyDown = False


	def _check_paddle_collision(self):
		# check if paddls are out of bounce
		if self.paddles["player1"]['y'] <= 0:
			self.playerOneKeyUp = False
		if self.paddles["player1"]['y'] >= self.canvas_height - self.paddle_height:
			self.playerOneKeyDown = False
		if self.paddles["player2"]['y'] <= 0:
			self.playerTwoKeyUp = False
		if self.paddles["player2"]['y'] >= self.canvas_height - self.paddle_height:
			self.playerTwoKeyDown = False

		# ball paddle collision
		if self.paddle_collision == False: # if hit no checks for a few iterations
			# Left Paddle
			if (self.ball['x'] - self.ball['radius'] <= self.paddles[self.player1]['x'] + self.paddle_width and
				self.paddles[self.player1]['y'] <= self.ball['y'] <= self.paddles[self.player1]['y'] + self.paddle_height):
				self.ball['vx'] *= -1
				self.paddle_collision = True
				return
			# Right Paddle
			if (self.ball['x'] + self.ball['radius'] >= self.paddles[self.player2]['x'] and
				self.paddles[self.player2]['y'] <= self.ball['y'] <= self.paddles[self.player2]['y'] + self.paddle_height):
				self.ball['vx'] *= -1
				self.paddle_collision = True
				return
		

	def move_ball(self):
		if self.ball['y'] <= 0 or self.ball['y'] >= self.canvas_height:
			self.ball['vy'] *= -1
		if self.ball['x'] <= 0 or self.ball['x'] >= self.canvas_width:
			if (self.ball['x'] <= 0):
				self.scores['player2'] += 1
			if (self.ball['x'] >= self.canvas_width):
				self.scores['player1'] += 1
			self.reset_ball()
		
		self.ball['y'] += self.ball['vy'] * self.ball['speed']
		self.ball['x'] += self.ball['vx'] * self.ball['speed']


	def reset_ball(self):
		self.ball['y'] = self.canvas_height / 2
		self.ball['x'] = self.canvas_width / 2
		self.ball['vx'] = 2
		self.ball['vy'] = random.uniform(0.5, 3)
		if random.choice([True, False]):
			self.ball['vx'] *= -1
		if random.choice([True, False]):
			self.ball['vy'] *= -1
		self.ball['speed'] = 2
		self.paddle_collision = False
		self.collision_timer = 0



	def serialize_state(self):
		return json.dumps({
			'ball': self.ball,
			'paddles': self.paddles,
			'scores': self.scores,
			'winner': self.winner,
		})


	async def game_loop(self, broadcast_callback):
		self.running = True
		while self.running:
			self.update_game_state()
			state = self.serialize_state()
			await broadcast_callback(state)
			self.game_tick += 1
			if self.paddle_collision:
				self.collision_timer += 1
			if self.collision_timer >= 10:
				self.paddle_collision = False
				self.collision_timer = 0
			if self.game_tick % 1000:
				self.ball['speed'] += 0.0001
			if self.scores['player1'] == 10 or self.scores['player2'] == 10:
				if self.scores['player1'] == 10:
					self.winner['player1'] = True
				else:
					self.winner['player2'] = True
				self.running = False
				state = self.serialize_state()
				await broadcast_callback(state)
			await asyncio.sleep(1 / 60)
