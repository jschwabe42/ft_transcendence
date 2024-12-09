import asyncio
import math
import json


class PongGame:
	def __init__(self, player1, player2):
		self.player1 = player1
		self.player2 = player2
		self.canvas_width = 800
		self.canvas_height = 600


		self.playerOneUp = False
		self.playerOneDown = False

		self.playerTwoUp = False
		self.playerTwoDown = False

		# Ball state
		self.ball = {
			'x': self.canvas_width / 2,
			'y': self.canvas_height / 2,
			'radius': 10,
			'speed': 5,
			'vx': 5,
			'vy': 5,
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

		self.scores = {self.player1: 0, self.player2: 0}
		self.running = False

	def update_game_state(self):
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
			print("HElloWorld")
			if (key == "KeyDownArrowUp"):
				self.playerTwoKeyUp = True
			if (key == "KeyDownArrowDown"):
				self.playerTwoKeyDown = True
			if (key == "KeyUpArrowUp"):
				self.playerTwoKeyUp = False
			if (key == "KeyUpArrowDown"):
				self.playerTwoKeyDown = False







	def _check_paddle_collision(self):
		print("test")

	def _reset_ball(self):
		print("test")

	def serialize_state(self):
		return json.dumps({
			'ball': self.ball,
			'paddles': self.paddles,
			'scores': {
				str(player): score
				for player, score in self.scores.items()
			},
		})


	async def game_loop(self, broadcast_callback):
		self.running = True
		while self.running:
			self.update_game_state()
			# self.move_paddle(self.player1, 'up')
			state = self.serialize_state()
			await broadcast_callback(state)
			await asyncio.sleep(1 / 60)  # 60 FPS
