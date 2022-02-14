import { GameResponse } from './schemes';

import { post } from './api';
import { Card, Game } from './types';

export async function startGame(
  gameId: string,
): Promise<[Game | null, string | null]> {
  var data = null;
  var error = null;

  try {
    const res = await post<GameResponse>(
      `http://localhost:8000/GameController/${gameId}/start`,
    );
    data = res.game;
  } catch (e: any) {
    if (e.error) error = e.error;
    else JSON.stringify(e);
  }

  return [data, error];
}

export async function advanceGame(
  gameId: string,
  card: Card | null,
): Promise<[Game | null, string | null]> {
  var data = null;
  var error = null;

  try {
    const res = await post<GameResponse>(
      `http://localhost:8000/GameController/${gameId}/advance?timestamp=${new Date().getTime()}`,
      { card: card },
    );
    data = res.game;
  } catch (e: any) {
    if (e.error) error = e.error;
    else JSON.stringify(e);
  }

  return [data, error];
}
