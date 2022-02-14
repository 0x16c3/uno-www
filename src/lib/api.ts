import axios from 'axios';

axios.defaults.withCredentials = true;

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';

export type Exception = {
  error: any;
};

export async function get<T>(url: string): Promise<T> {
  try {
    const res = await axios.get<T>(url);
    return await await res.data;
  } catch (e: any) {
    if (e.response) {
      if ('detail' in e.response.data) {
        throw { error: e.response.data.detail } as Exception;
      }
      throw { error: e.response.data } as Exception;
    }
    throw { error: e } as Exception;
  }
}

export async function post<T>(url: string, data?: any): Promise<T> {
  try {
    const res = await axios.post<T>(url, data);
    return await await res.data;
  } catch (e: any) {
    if (e.response) {
      if ('detail' in e.response.data) {
        throw { error: e.response.data.detail } as Exception;
      }
      throw { error: e.response.data } as Exception;
    }
    throw { error: e } as Exception;
  }
}
