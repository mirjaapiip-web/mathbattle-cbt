import { Server, Socket } from 'socket.io';
import { createServerClient } from './supabase';
import { GameState, PlayerState, GameQuestion } from './types';
import { getRandomQuestions, calculatePoints, recordGameResponse } from './api';

interface RoomState {
  sessionId: string;
  difficulty: 'easy' | 'medium' | 'hard';
  players: Map<string, PlayerState>;
  questions: GameQuestion[];
  currentQuestionIndex: number;
  gameActive: boolean;
  createdAt: Date;
}

const rooms = new Map<string, RoomState>();

export function initializeSocket(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-room', async (data) => {
      const { roomId, difficulty } = data;
      const userId = socket.handshake.auth.userId;
      const username = socket.handshake.auth.username;

      if (!userId || !username) {
        socket.emit('error', { message: 'Unauthorized' });
        return;
      }

      socket.join(roomId);

      if (!rooms.has(roomId)) {
        // Create new room
        const questions = await getRandomQuestions(difficulty, 10);
        rooms.set(roomId, {
          sessionId: `session_${Date.now()}`,
          difficulty,
          players: new Map(),
          questions,
          currentQuestionIndex: 0,
          gameActive: false,
          createdAt: new Date(),
        });
      }

      const room = rooms.get(roomId)!;
      room.players.set(userId, {
        userId,
        username,
        score: 0,
        streak: 0,
        answered: false,
      });

      io.to(roomId).emit('room-updated', {
        players: Array.from(room.players.values()),
        currentPlayers: room.players.size,
      });
    });

    socket.on('start-game', (data) => {
      const { roomId } = data;
      const room = rooms.get(roomId);

      if (!room || room.players.size < 1) {
        socket.emit('error', { message: 'Room not found or empty' });
        return;
      }

      room.gameActive = true;
      room.currentQuestionIndex = 0;

      // Reset player states
      room.players.forEach((player) => {
        player.answered = false;
      });

      const gameState: GameState = {
        sessionId: room.sessionId,
        roomId,
        question: room.questions[0],
        questionIndex: 1,
        totalQuestions: room.questions.length,
        players: Array.from(room.players.values()),
        status: 'question',
        timeRemaining: 30,
      };

      io.to(roomId).emit('game-started', { gameState });
    });

    socket.on('submit-answer', async (data) => {
      const { roomId, answer, responseTime } = data;
      const userId = socket.handshake.auth.userId;
      const room = rooms.get(roomId);

      if (!room || !room.gameActive) {
        socket.emit('error', { message: 'Game not active' });
        return;
      }

      const player = room.players.get(userId);
      if (!player) {
        socket.emit('error', { message: 'Player not in room' });
        return;
      }

      const currentQuestion = room.questions[room.currentQuestionIndex];
      const isCorrect = answer === currentQuestion.answer;
      const pointsEarned = isCorrect ? calculatePoints(room.difficulty, responseTime) : 0;

      player.answered = true;
      player.isCorrect = isCorrect;
      player.responseTime = responseTime;

      if (isCorrect) {
        player.score += pointsEarned;
        player.streak++;
      } else {
        player.streak = 0;
      }

      // Check if all players have answered
      const allAnswered = Array.from(room.players.values()).every((p) => p.answered);

      if (allAnswered) {
        room.currentQuestionIndex++;

        if (room.currentQuestionIndex < room.questions.length) {
          // Reset for next question
          room.players.forEach((p) => {
            p.answered = false;
          });

          const nextQuestion = room.questions[room.currentQuestionIndex];
          io.to(roomId).emit('answer-revealed', {
            correctAnswer: currentQuestion.answer,
            playerScores: Array.from(room.players.values()),
          });

          setTimeout(() => {
            io.to(roomId).emit('new-question', {
              question: nextQuestion,
              timeLimit: 30,
            });
          }, 2000);
        } else {
          // Game finished
          room.gameActive = false;
          const finalScores = Array.from(room.players.values()).sort((a, b) => b.score - a.score);

          io.to(roomId).emit('game-finished', {
            finalScores,
            winner: finalScores[0],
          });

          // Cleanup room after 5 seconds
          setTimeout(() => {
            rooms.delete(roomId);
            socket.leave(roomId);
          }, 5000);
        }
      }
    });

    socket.on('leave-room', (data) => {
      const { roomId } = data;
      const userId = socket.handshake.auth.userId;
      const room = rooms.get(roomId);

      if (room) {
        room.players.delete(userId);

        if (room.players.size === 0) {
          rooms.delete(roomId);
        } else {
          io.to(roomId).emit('room-updated', {
            players: Array.from(room.players.values()),
            currentPlayers: room.players.size,
          });
        }
      }

      socket.leave(roomId);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      // Cleanup logic if needed
    });
  });

  return io;
}

export { rooms };
