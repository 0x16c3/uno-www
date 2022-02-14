import React from 'react';
import { useRouter } from 'next/router';

import Page from '@/components/page';

import { Button, TextField, Grid } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import { VariantType, useSnackbar } from 'notistack';
import { useTheme } from '@mui/system';
import { useIsMobile } from '@/lib/utils/mobile';

import {
  createGame,
  getCurrentUserId,
  getGames,
  joinGame,
} from '@/lib/gamelist';
import { Game } from '@/lib/types';

export default function Home() {
  const theme = useTheme();
  const isMobile = useIsMobile(theme.breakpoints.values.md);
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();

  const [loading, setLoading] = React.useState(false);
  const [gameCode, setGameCode] = React.useState('');
  const [existingGame, setExistingGame] = React.useState('');

  function pushAlert(message: string, variant: VariantType) {
    enqueueSnackbar(message, { variant });
  }

  function onInputChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    event.target.value = event.target.value.toUpperCase();
    if (event.target.value.length > 5) {
      event.target.value = event.target.value.slice(0, 5);
    }

    setGameCode(event.target.value);
  }

  async function onButtonClick() {
    if (gameCode.length === 5) {
      setLoading(true);
      const [game, error] = await joinGame(gameCode);

      if (game) router.push(`/game/${game.id}`);
      if (typeof error === 'string') {
        pushAlert(error, 'error');
        setLoading(false);
        return;
      }
      if (!game) {
        pushAlert('Unknown error', 'error');
        setLoading(false);
        return;
      }
    } else {
      setLoading(true);

      const [game, error] = await createGame();

      if (game) {
        router.push(`/game/${game.id}`);
      }
      if (typeof error === 'string') {
        pushAlert(error, 'error');
        setLoading(false);
        return;
      }
      if (!game) {
        pushAlert('Unknown error', 'error');
        setLoading(false);
        return;
      }
    }
  }

  React.useEffect(() => {
    async function getExistingGame() {
      const [games, gamesError] = await getGames();
      const [uid, uidError] = await getCurrentUserId();
      var game: Game | null = null;

      if (!uid) {
        pushAlert('Unknown error', 'error');
        return;
      }

      if (games && uid)
        for (const _game of games) {
          if (_game.host.id == uid) game = _game;
        }

      if (game) setExistingGame(game.id);
    }

    getExistingGame();
  }, []);

  React.useEffect(() => {
    if (existingGame) router.push(`/game/${existingGame}`);
  }, [existingGame]);

  return (
    <Page>
      <Grid container spacing={2} alignItems="center" alignContent="center">
        <Grid item md xs={12}>
          <h1 className="title">Play UNO with friends</h1>
          <TextField
            id="outlined-basic"
            label="Game code"
            variant="outlined"
            spellCheck={false}
            error={gameCode.length > 0 && gameCode.length < 5}
            helperText={
              gameCode.length > 0 && gameCode.length < 5
                ? 'Codes have to be 5 characters long'
                : ''
            }
            onChange={(e) => onInputChange(e)}
          />
        </Grid>

        <Grid item md xs={12} textAlign="right">
          <h2 className="title">
            {gameCode.length ? "Join a friend's game" : 'Start a new game'}
          </h2>
          <LoadingButton
            variant="contained"
            size="large"
            disabled={gameCode.length > 0 && gameCode.length < 5}
            onClick={onButtonClick}
            loading={loading}>
            {gameCode.length ? 'Join game' : 'Create game'}
          </LoadingButton>
        </Grid>
      </Grid>
    </Page>
  );
}
