import { io, Socket } from 'socket.io-client';
import { GameState, PlayerState } from './types';

let socket: Socket | null = null;

export function connectSocket(userId: string, username: string): Socket {
  if (socket && socket.connected) {
    return socket;
  }

  socket = io({
    auth: {
      userId,
      username,
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function getSocket(): Socket | null {
  return socket;
}

export function joinRoom(roomId: string, difficulty: 'easy' | 'medium' | 'hard') {
  if (!socket) throw new Error('Socket not connected');
  socket.emit('join-room', { roomId, difficulty });
}

export function startGame(sessionId: string, roomId: string) {
  if (!socket) throw new Error('Socket not connected');
  socket.emit('start-game', { sessionId, roomId });
}

export function submitAnswer(roomId: string, answer: number, responseTime: number) {
  if (!socket) throw new Error('Socket not connected');
  socket.emit('submit-answer', { roomId, answer, responseTime });
}

export function leaveRoom(roomId: string) {
  if (!socket) throw new Error('Socket not connected');
  socket.emit('leave-room', { roomId });
}

// Event listeners
export function onRoomUpdated(callback: (data: { players: PlayerState[]; currentPlayers: number }) => void) {
  if (!socket) throw new Error('Socket not connected');
  socket.on('room-updated', callback);
}

export function onGameStarted(callback: (data: { gameState: GameState }) => void) {
  if (!socket) throw new Error('Socket not connected');
  socket.on('game-started', callback);
}

export function onNewQuestion(callback: (data: { question: any; timeLimit: number }) => void) {
  if (!socket) throw new Error('Socket not connected');
  socket.on('new-question', callback);
}

export function onAnswerRevealed(callback: (data: { correctAnswer: number; playerScores: PlayerState[] }) => void) {
  if (!socket) throw new Error('Socket not connected');
  socket.on('answer-revealed', callback);
}

export function onGameFinished(callback: (data: { finalScores: PlayerState[]; winner?: PlayerState }) => void) {
  if (!socket) throw new Error('Socket not connected');
  socket.on('game-finished', callback);
}

export function onError(callback: (data: { message: string }) => void) {
  if (!socket) throw new Error('Socket not connected');
  socket.on('error', callback);
}

// Cleanup listeners
export function offAllListeners() {
  if (socket) {
    socket.off('room-updated');
    socket.off('game-started');
    socket.off('new-question');
    socket.off('answer-revealed');
    socket.off('game-finished');
    socket.off('error');
  }
}
