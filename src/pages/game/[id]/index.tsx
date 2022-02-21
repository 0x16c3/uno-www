import React from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';

import Page from '@/components/page';

import { Alert, Button, Container, Divider, Grid, Paper } from '@mui/material';
import { VariantType, useSnackbar } from 'notistack';
import { Box } from '@mui/system';
import { useTheme } from '@mui/material/styles';

import {
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { ContentCopy } from '@mui/icons-material';

import { motion } from 'framer-motion';

import { endGame, getCurrentUserId, getGame, leaveGame } from '@/lib/gamelist';
import { Game } from '@/lib/types';
import { Color, GameState } from '@/lib/enums';
import { Status } from '@/lib/schemes';
import { useWebSocket } from '@/lib/utils/websocket';
import { advanceGame, startGame } from '@/lib/gamecontroller';
import Card from '@/components/card';
import { WS_URL } from '@/lib/api';

async function btnEndGame(game: Game, pushAlert: any, redirect: any) {
  if (game.state === GameState.IDLE) {
    const [status, error] = await endGame(game.id);

    if (!status || !status.status) {
      pushAlert(status?.message || 'Unknown error', 'error');
      return;
    } else if (status && status.status && status.message)
      pushAlert(status.message, 'success');
    if (redirect) redirect('/');
    else if (error) pushAlert(error, 'error');
  } else {
    pushAlert('You cannot end a game that has already started', 'error');
  }
}

async function btnStartGame(game: Game, pushAlert: any) {
  if (game.state === GameState.IDLE) {
    const [_game, error] = await startGame(game.id);

    if (_game) {
      null;
    } else if (error) pushAlert(error, 'error');
    else pushAlert("Couldn't get game, please refresh.", 'error');
  } else {
    pushAlert('You cannot leave a game that has already started', 'error');
  }
}

async function btnLeaveGame(game: Game, pushAlert: any, redirect: any) {
  if (game.state === GameState.IDLE) {
    const [_game, error] = await leaveGame(game.id);

    if (_game) {
      pushAlert('You have left the game', 'success');
      if (redirect) redirect('/');
    } else if (error) pushAlert(error, 'error');
    else pushAlert("Couldn't get game, please refresh.", 'error');
  } else {
    pushAlert('You cannot leave a game that has already started', 'error');
  }
}

async function btnCopyGame(game: Game, pushAlert: any) {
  navigator.clipboard.writeText(game.id);
  pushAlert('Copied to clipboard', 'success');
}

async function btnDrawCard(game: Game, pushAlert: any) {
  if (game.state === GameState.ACTIVE) {
    const [_game, advanceError] = await advanceGame(game.id, null);

    if (_game) {
      null;
    } else if (advanceError) {
      pushAlert(advanceError, 'error');
    } else {
      pushAlert("Couldn't get game, please try again.", 'error');
    }
  } else {
    pushAlert('You cannot advance a game that has not started', 'error');
  }
}

enum PlayerColors {
  RED = '#f44336',
  ORANGE = '#ff9800',
  YELLOW = '#ffeb3b',
  GREEN = '#4caf50',
  BLUE = '#2196f3',
  INDIGO = '#3f51b5',
  VIOLET = '#9c27b0',
  PINK = '#e91e63',
}

export default function GamePage() {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();

  function pushAlert(message: string, variant: VariantType) {
    enqueueSnackbar(message, { variant });
  }

  const gameId = router.query.id as string;
  const [game, setGame] = React.useState<Game>();
  const [userId, setUserId] = React.useState('');
  const [initError, setInitError] = React.useState('');

  const [selectedCard, setSelectedCard] = React.useState<number>(0);
  const [selfColor, setSelfColor] = React.useState<PlayerColors | null>(null);

  const deckRef = React.useRef<HTMLDivElement>(null);

  const wsInstance = useWebSocket(
    router.query['id'] ? `${WS_URL}/${router.query['id']}` : null,
  );

  async function beforeUnload(e: any) {
    return;

    if (game?.host.id == userId) return;

    const [_game, gameError] = await leaveGame(gameId);

    if (_game) console.log('You have left the game', 'success');
    else if (gameError) console.log(gameError, 'error');
    else console.log("Couldn't leave game, please refresh the page.", 'error');
  }

  React.useEffect(() => {
    async function fetchUserId() {
      const [id, idError] = await getCurrentUserId();

      if (id) setUserId(id);
      else setInitError("Couldn't get user ID, please refresh.");
    }

    fetchUserId();

    window.addEventListener('beforeunload', beforeUnload);
    return () => {
      window.removeEventListener('beforeunload', beforeUnload);
    };
  }, []);

  React.useEffect(() => {
    if (!gameId || !userId) return;

    async function fetchGame() {
      if (!gameId || !userId) return;

      const [game, gameError] = await getGame(gameId);

      if (game) {
        setGame(game);
        const playerIndex = Object.keys(game.players).findIndex(
          (player: string) => player === userId,
        );
        setSelfColor(Object.values(PlayerColors)[playerIndex]);
      } else if (gameError) setInitError(gameError);
      else setInitError("Couldn't get game, please refresh.");
    }

    fetchGame();
  }, [userId, gameId]);

  React.useEffect(() => {
    if (wsInstance) {
      wsInstance.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.hasOwnProperty('status')) {
          const status = data as Status;
          console.log(status);

          if (status.status) {
            pushAlert(status.message || 'Success', 'success');
            router.reload();
          } else {
            pushAlert(status.message || 'Unknown error', 'error');
            router.push('/');
          }
        }
        if (data['game']) {
          const game = data.game as Game;
          setGame(game);
        }
      };
    }
  }, [wsInstance]);

  React.useEffect(() => {
    if (!game) return;

    if (Object.keys(game.players).find((p) => p == userId)) {
      null;
    } else {
      setInitError('You are not in the game.');
    }
  }, [game]);

  if (initError) {
    return (
      <Page title="Error - 0x16c3">
        <Alert variant="filled" severity="error">
          {initError || 'Unknown error'}
        </Alert>
      </Page>
    );
  }

  if (!game) return <Page title="Loading..." />;

  const isHost = game.host.id === userId;

  const leftTurns =
    Math.abs(
      Object.keys(game.players).indexOf(game.turn) -
        Object.keys(game.players).indexOf(userId),
    ) % Object.keys(game.players).length;

  const deckTopCard =
    game.discard.at(-1) || game.discard[game.discard.length - 1];

  if (game.state == GameState.IDLE)
    return (
      <Page>
        <Grid container spacing={2} alignItems="center" alignContent="center">
          <Grid item md={4} xs={12}>
            <h1>Game Idle</h1>
            <code>
              <h5>
                Players: {Object.keys(game.players).length.toString()}/
                {game.players_max}
              </h5>
              <Grid
                container
                spacing={0}
                alignItems="center"
                alignContent="center">
                {Object.values(PlayerColors).map((color, i) => (
                  <Grid item>
                    <Box
                      sx={{
                        backgroundColor:
                          color +
                          (Object.keys(game.players).length > i ? 'ff' : '90'),
                        width: 36,
                        height: color == selfColor ? 32 : 24,
                        borderRadius:
                          i == 0
                            ? `${theme.shape.borderRadius}px 0px 0px ${theme.shape.borderRadius}px`
                            : i == 7
                            ? `0px ${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0px`
                            : 0,
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </code>
          </Grid>
          <Grid item md={3} xs={12}></Grid>
          <Grid item md={5} xs={12} textAlign="right">
            <h2>Waiting for the host to start the game</h2>
            <Grid
              container
              spacing={2}
              direction="row-reverse"
              alignItems="center"
              alignContent="center">
              {isHost ? (
                <Grid item textAlign="right">
                  <Button
                    variant="contained"
                    size="medium"
                    onClick={() => btnStartGame(game, pushAlert)}>
                    Start Game
                  </Button>
                </Grid>
              ) : null}
              <Grid item textAlign="right">
                <Button
                  color="error"
                  variant="contained"
                  size="medium"
                  onClick={
                    isHost
                      ? () => btnEndGame(game, pushAlert, router.push)
                      : () => btnLeaveGame(game, pushAlert, router.push)
                  }>
                  {isHost ? 'End Game' : 'Leave Game'}
                </Button>
              </Grid>
              {isHost && (
                <Grid item textAlign="right">
                  <Paper
                    sx={{ p: 1, alignContent: 'center', alignItems: 'center' }}>
                    <h4 style={{ display: 'inline-block', margin: 0 }}>
                      <code>You are the host</code>
                    </h4>
                  </Paper>
                </Grid>
              )}
            </Grid>
            <br />
            <Divider variant="middle" />
            <br />
            <FormControl
              sx={{ m: 1, width: '25ch' }}
              variant="outlined"
              margin="dense">
              <InputLabel htmlFor="outlined-adornment-password">
                Game ID
              </InputLabel>
              <OutlinedInput
                readOnly
                id="outlined-adornment-password"
                type="text"
                value={game.id}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="copy game id"
                      onClick={() => btnCopyGame(game, pushAlert)}
                      edge="end">
                      <ContentCopy />
                    </IconButton>
                  </InputAdornment>
                }
                label="Password"
              />
            </FormControl>
          </Grid>
        </Grid>
      </Page>
    );

  if (game.state == GameState.ACTIVE)
    return (
      <Page title={'Playing UNO - 0x16c3'}>
        <Grid
          container
          spacing={16}
          direction="column"
          alignItems="center"
          alignContent="center">
          <Grid item sx={{ width: '70%' }}>
            <Grid
              container
              spacing={2}
              alignItems="center"
              alignContent="center"
              justifyContent="space-between">
              <Grid item md xs={12}>
                <h1>Game in progress</h1>
                <Grid
                  container
                  spacing={0}
                  alignItems="center"
                  alignContent="center">
                  {[...Array(Object.keys(game.players).length).keys()].map(
                    (i) => (
                      <Grid item>
                        <Box
                          component={motion.div}
                          sx={{
                            backgroundColor:
                              Object.values(PlayerColors)[i] +
                              (Object.keys(game.players).length > i
                                ? 'ff'
                                : '90'),
                            width: 36,
                            height:
                              game.turn == Object.keys(game.players)[i]
                                ? 32
                                : Object.keys(game.players)[i] == userId
                                ? 28
                                : 24,
                            borderRadius:
                              i == 0
                                ? `${theme.shape.borderRadius}px 0px 0px ${theme.shape.borderRadius}px`
                                : i == Object.keys(game.players).length - 1
                                ? `0px ${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0px`
                                : 0,
                          }}
                        />
                      </Grid>
                    ),
                  )}
                </Grid>
                <br />
                {leftTurns ? (
                  <code>
                    <h5>{`Until your turn: ${leftTurns}`}</h5>
                  </code>
                ) : (
                  <Paper
                    sx={{
                      p: 1,
                      alignContent: 'center',
                      alignItems: 'center',
                      bgcolor: theme.palette.secondary.light,
                    }}>
                    <h5
                      style={{
                        display: 'inline-block',
                        margin: 0,
                        color: theme.palette.secondary.contrastText,
                      }}>
                      <code>Your turn!</code>
                    </h5>
                  </Paper>
                )}

                {leftTurns > 0 ? null : (
                  <>
                    <h5>
                      <Button
                        variant="contained"
                        size="medium"
                        onClick={() => btnDrawCard(game, pushAlert)}
                        sx={{ marginRight: 2 }}>
                        {game.drawed ? 'Skip' : 'Draw Card'}
                      </Button>
                      {game.drawed ? "Still don't" : "Don't"} have a card?
                    </h5>
                  </>
                )}
              </Grid>
              <Grid item md xs={12}>
                <div style={{ float: 'right', display: 'block' }} ref={deckRef}>
                  <Card
                    key={`DECK-${deckTopCard.value}-${deckTopCard.color}-${deckTopCard.type}`}
                    card={deckTopCard}
                    selected={false}
                    selectAmount={0}
                    hoverAmount={0}
                    style={{ marginLeft: 'auto' }}
                  />
                </div>
              </Grid>
            </Grid>
          </Grid>

          <Grid item sx={{ width: '100%' }}>
            <Container
              sx={{
                width: '100%',
                height: '265px',
                transform: 'translate(-25%, 0)',
                position: 'relative',
              }}>
              <Grid
                container
                spacing={1}
                alignItems="center"
                alignContent="center">
                {game.players[userId].map((card, i) => (
                  <Grid
                    item
                    key={`CARD${card.value}${card.color}${card.type}${i}`}>
                    <Card
                      index={i}
                      selectedIndex={selectedCard}
                      card={card}
                      selected={selectedCard == i}
                      onClick={() => setSelectedCard(i)}
                      gap={96}
                      cards={game.players[userId]}
                      style={{
                        position: 'absolute',
                        zIndex: selectedCard == i ? 999 : 16 + i,

                        marginLeft: 'auto',
                        marginRight: 'auto',
                        cursor: 'grab',
                      }}
                      deckRef={deckRef}
                      onDrop={(resetState, overrideColor) => {
                        async function advance() {
                          if (
                            card.color == Color.JOKER &&
                            overrideColor == Color.JOKER
                          ) {
                            resetState();
                            return;
                          }

                          if (!game) {
                            pushAlert('Game not found', 'error');
                            return;
                          }

                          if (card.color == Color.JOKER) {
                            card.color = overrideColor;
                          }

                          const [_game, advanceError] = await advanceGame(
                            router.query.id as string,
                            card,
                          );

                          if (_game) {
                            resetState();
                            setGame(_game);
                          } else if (advanceError) {
                            pushAlert(advanceError, 'error');
                            resetState();
                          } else {
                            pushAlert(
                              "Couldn't get game, please try again.",
                              'error',
                            );
                            resetState();
                          }
                        }
                        advance();
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Container>
          </Grid>
        </Grid>

        {/*<code>{JSON.stringify(game)}</code>*/}
      </Page>
    );

  return (
    <Page title={'Game Ended - 0x16c3'}>
      <h1>The game has ended</h1>
      <Button
        variant="contained"
        size="medium"
        onClick={() => router.push('//')}>
        Return to the main page
      </Button>
    </Page>
  );
}
