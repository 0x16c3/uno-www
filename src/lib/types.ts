import { CardType, Color, GameState } from './enums';

export type Player = { id: string };

export type Game = {
  id: string;
  state: GameState;
  host: Player;
  players: { [id: string]: Card[] };
  players_max: number;
  turn: string;
  reverse: boolean;
  override_color: Color;
  drawed: boolean;
  deck: Card[];
  discard: Card[];
};

export type Card = {
  color: Color;
  type: CardType;
  value: number;
};
