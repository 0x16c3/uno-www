import { GameResponse, GamesResponse, Status, UserIdResponse } from './schemes';

import { get, post, API_URL } from './api';
import { Game } from './types';

export async function getGames(): Promise<[Game[] | null, string | null]> {
  let data = null;
  let error = null;

  try {
    const res = await get<GamesResponse>(`${API_URL}/GameList`);
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
  let data = null;
  let error = null;

  try {
    const res = await get<UserIdResponse>(`${API_URL}/GameList/me`);
    data = res.id;
  } catch (e: any) {
    if (e.error)
      if (e.error) error = e.error;
      else JSON.stringify(e);
  }

  return [data, error];
}

export async function createGame(): Promise<[Game | null, string | null]> {
  let data = null;
  let error = null;

  try {
    const res = await post<GameResponse>(`${API_URL}/GameList/create`);
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
  let data = null;
  let error = null;

  try {
    const res = await get<GameResponse>(`${API_URL}/GameList/${gameId}`);
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
  let data = null;
  let error = null;

  try {
    const res = await get<GameResponse>(`${API_URL}/GameList/${gameId}/join`);
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
  let data = null;
  let error = null;

  try {
    const res = await get<GameResponse>(`${API_URL}/GameList/${gameId}/leave`);
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
  let data = null;
  let error = null;

  try {
    const res = await post<Status>(`${API_URL}/GameList/${gameId}/end`);
    data = res;
  } catch (e: any) {
    if (e.error) error = e.error;
    else JSON.stringify(e);
  }

  return [data, error];
}
