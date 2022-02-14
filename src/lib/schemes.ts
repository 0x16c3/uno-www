import { Game } from './types';

export type Status = {
  status: boolean;
  message?: string;
};

export type GamesResponse = {
  games: Game[];
};

export type GameResponse = {
  game: Game;
};

export type UserIdResponse = {
  id: string;
};
