import { GameResponse, GamesResponse, Status, UserIdResponse } from './schemes';

import { get, post } from './api';
import { Game } from './types';

export async function getGames(): Promise<[Game[] | null, string | null]> {
  var data = null;
  var error = null;

  try {
    const res = await get<GamesResponse>(`http://localhost:8000/GameList`);
    data = res.games;
  } catch (e: any) {
    if (e.error) error = e.error;
    else JSON.stringify(e);
  }

  return [data, error];
}

export async function getCurrentUserId(): Promise<
  [string | null, string | null]
> {
  var data = null;
  var error = null;

  try {
    const res = await get<UserIdResponse>(`http://localhost:8000/GameList/me`);
    data = res.id;
  } catch (e: any) {
    if (e.error)
      if (e.error) error = e.error;
      else JSON.stringify(e);
  }

  return [data, error];
}

export async function createGame(): Promise<[Game | null, string | null]> {
  var data = null;
  var error = null;

  try {
    const res = await post<GameResponse>(
      `http://localhost:8000/GameList/create`,
    );
    data = res.game;
  } catch (e: any) {
    if (e.error) error = e.error;
    else JSON.stringify(e);
  }

  return [data, error];
}

export async function getGame(
  gameId: string,
): Promise<[Game | null, string | null]> {
  var data = null;
  var error = null;

  try {
    const res = await get<GameResponse>(
      `http://localhost:8000/GameList/${gameId}`,
    );
    data = res.game;
  } catch (e: any) {
    if (e.error) error = e.error;
    else JSON.stringify(e);
  }

  return [data, error];
}

export async function joinGame(
  gameId: string,
): Promise<[Game | null, string | null]> {
  var data = null;
  var error = null;

  try {
    const res = await get<GameResponse>(
      `http://localhost:8000/GameList/${gameId}/join`,
    );
    data = res.game;
  } catch (e: any) {
    if (e.error) error = e.error;
    else JSON.stringify(e);
  }

  return [data, error];
}

export async function leaveGame(
  gameId: string,
): Promise<[Game | null, string | null]> {
  var data = null;
  var error = null;

  try {
    const res = await get<GameResponse>(
      `http://localhost:8000/GameList/${gameId}/leave`,
    );
    data = res.game;
  } catch (e: any) {
    if (e.error) error = e.error;
    else JSON.stringify(e);
  }

  return [data, error];
}

export async function endGame(
  gameId: string,
): Promise<[Status | null, string | null]> {
  var data = null;
  var error = null;

  try {
    const res = await post<Status>(
      `http://localhost:8000/GameList/${gameId}/end`,
    );
    data = res;
  } catch (e: any) {
    if (e.error) error = e.error;
    else JSON.stringify(e);
  }

  return [data, error];
}
