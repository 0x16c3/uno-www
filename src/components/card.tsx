import React, { ReactElement } from 'react';

import { CardType as CardTypeEnum, Color } from '@/lib/enums';
import { Card as CardType } from '@/lib/types';

import { Chip, Container, Grid, Paper } from '@mui/material';
import { Filter2, Filter4, Loop, Block, Palette } from '@mui/icons-material';

import {
  useAnimation,
  useMotionValue,
  motion,
  TargetAndTransition,
} from 'framer-motion';

import { useTheme } from '@mui/material/styles';

import { useIsMobile } from '@/lib/utils/mobile';

function combineStyle(
  style1: React.CSSProperties,
  style2?: React.CSSProperties,
) {
  if (!style2) return style1;
  return Object.assign({}, style1, style2);
}

function combineAnim(
  style1: TargetAndTransition,
  style2?: TargetAndTransition,
) {
  if (!style2) return style1;
  return Object.assign({}, style1, style2);
}

export const numberBetween = (x: number, min: number, max: number) => {
  return x >= min && x <= max;
};

export default function Card({
  index = -1,
  selectedIndex = -1,
  card,
  cards,
  gap = 96,
  selected = false,
  selectAmount = 80,
  hoverAmount = 32,
  onClick,
  style = {},
  animate = {},
  ref,
  deckRef,
  onDrop,
}: {
  index?: number;
  selectedIndex?: number;
  card: CardType;
  cards?: CardType[];
  gap?: number;
  selected: boolean;
  selectAmount?: number;
  hoverAmount?: number;
  onClick?: () => void;
  style?: React.CSSProperties;
  animate?: TargetAndTransition;
  ref?: React.Ref<HTMLDivElement>;
  deckRef?: React.RefObject<HTMLDivElement>;
  onDrop?: (resetState: () => void, overrideColor: Color) => void;
}) {
  const theme = useTheme();
  const isMobile = useIsMobile();

  const [title, setTitle] = React.useState<string>('');
  const [header, setHeader] = React.useState<ReactElement>();
  const [color, setColor] = React.useState<string>('#000000');

  const [originX, setOriginX] = React.useState<number>(0);
  const [originY, setOriginY] = React.useState<number>(0);
  const [width, setWidth] = React.useState<number>(0);
  const [height, setHeight] = React.useState<number>(0);

  const [isHovered, setIsHovered] = React.useState<boolean>(false);
  const [isDragging, setIsDragging] = React.useState<boolean>(false);
  const [isInDropZone, setIsInDropZone] = React.useState<boolean>(false);
  const [isDropped, setIsDropped] = React.useState<boolean>(false);
  const [canBeSelected, setCanBeSelected] = React.useState<boolean>(selected);

  const [offset, setOffset] = React.useState<number>(0);

  const [overrideColor, setOverrideColor] = React.useState<Color>(Color.JOKER);

  const colors = {
    [Color.RED]: '#f44336',
    [Color.YELLOW]: '#ffeb3b',
    [Color.BLUE]: '#2196f3',
    [Color.GREEN]: '#4caf50',
    [Color.JOKER]: '#000000',
  };

  const numbers = [
    'ZERO',
    'ONE',
    'TWO',
    'THREE',
    'FOUR',
    'FIVE',
    'SIX',
    'SEVEN',
    'EIGHT',
    'NINE',
  ];

  const cardRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (card.type == CardTypeEnum.NUMBER) {
      setTitle(numbers[card.value]);
      setHeader(
        <h1
          style={{
            fontSize: '400%',
            margin: 0,
            textAlign: 'center',
          }}>
          {card.value.toString()}
        </h1>,
      );
    } else if (card.type == CardTypeEnum.DRAW2) {
      setTitle('DRAW 2');
      setHeader(<Filter2 />);
    } else if (card.type == CardTypeEnum.REVERSE) {
      setTitle('REVERSE');
      setHeader(<Loop />);
    } else if (card.type == CardTypeEnum.SKIP) {
      setTitle('SKIP');
      setHeader(<Block />);
    } else if (card.type == CardTypeEnum.WILD) {
      setTitle('COLOR');
      setHeader(<Palette />);
    } else if (card.type == CardTypeEnum.WILD4) {
      setTitle('DRAW 4');
      setHeader(<Filter4 />);
    } else {
      console.log('Error processing card:', card);
    }

    setColor(colors[card.color]);

    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setOriginX(rect.x);
      setOriginY(rect.y);
      setWidth(rect.width);
      setHeight(rect.height);
    }
  }, []);

  React.useEffect(() => {
    if (cards) {
      setOffset(index * ((7 / cards.length) * gap));
    }
  }, [cards]);

  const dragOriginX = useMotionValue(0);
  const dragOriginY = useMotionValue(0);

  const ifInBounds = () => {
    if (ref) return false;

    if (deckRef && deckRef.current && cardRef.current) {
      const deckRect = deckRef.current.getBoundingClientRect();
      const cardRect = cardRef.current.getBoundingClientRect();

      const isDraggedXInRange = numberBetween(
        cardRect.x + cardRect.width / 2,
        deckRect.x,
        deckRect.x + deckRect.width,
      );

      const isDraggedYInRange = numberBetween(
        cardRect.y + cardRect.height / 2,
        deckRect.y,
        deckRect.y + deckRect.height,
      );

      dragOriginX.set(deckRect.x - originX);
      dragOriginY.set(deckRect.y - originY);

      return isDraggedXInRange && isDraggedYInRange;
    }
  };

  function onDrag(event: any, info: any) {
    setIsDragging(true);

    if (ifInBounds()) {
      setIsInDropZone(true);
    } else {
      setIsInDropZone(false);
    }
  }

  function onDragStart(event: any, info: any) {
    setIsDragging(true);
    setCanBeSelected(false);
    if (onClick && !isDropped) onClick();

    if (card.type != CardTypeEnum.WILD && card.type != CardTypeEnum.WILD4) {
      return;
    }

    if (!cardRef || !cardRef.current) {
      resetState();
      return;
    }

    const cardRect = cardRef.current.getBoundingClientRect();

    const x = info.point.x - cardRect.x;
    const y = info.point.y - cardRect.y;

    if (x < width / 2) {
      if (y < height / 2) {
        setOverrideColor(Color.RED);
        setColor(colors[Color.RED]);
      } else {
        setOverrideColor(Color.GREEN);
        setColor(colors[Color.GREEN]);
      }
    } else {
      if (y < height / 2) {
        setOverrideColor(Color.YELLOW);
        setColor(colors[Color.YELLOW]);
      } else {
        setOverrideColor(Color.BLUE);
        setColor(colors[Color.BLUE]);
      }
    }
  }

  const isSelected = selected;
  const iSelected = selected || index < 0;

  const variants: { [key: string]: TargetAndTransition } = {
    default: combineAnim(
      {
        left: offset,
        right: -offset,
        x: iSelected ? 0 : index < selectedIndex ? -64 : 64,
        y: isSelected ? -selectAmount : 0,
        opacity: 1,
      },
      animate,
    ),
    hover: {
      left: offset,
      right: -offset,
      x: iSelected ? 0 : index < selectedIndex ? -64 : 64,
      y: isSelected ? -selectAmount : -hoverAmount,
      opacity: 1,
    },
    inDeck: {
      left: offset,
      right: -offset,
      opacity: 0.5,
      scale: 1,
    },
    dropped: {
      x: dragOriginX.get(),
      y: dragOriginY.get(),
      opacity: 1,
      scale: 1,
    },
  };

  function resetState() {
    setIsHovered(false);
    setIsDragging(false);
    setIsInDropZone(false);
    setIsDropped(false);
  }

  const getCurrentState = () => {
    if (isDropped) return 'dropped';
    if (isInDropZone) return 'inDeck';
    if (isHovered) return 'hover';
    return 'default';
  };

  return (
    <Paper
      ref={ref ? ref : cardRef}
      elevation={3}
      sx={combineStyle(
        {
          width: '175px',
          height: '265px',
          padding: '8px',

          userSelect: 'none',
          willChange: 'transform',
        },
        style,
      )}
      component={motion.div}
      animate={getCurrentState()}
      variants={variants}
      drag={!isDropped && onClick != undefined}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onDrag={onDrag}
      onDragStart={onDragStart}
      onDragEnd={() => {
        setIsDragging(false);
        setCanBeSelected(true);
        if (!ifInBounds()) {
          if (card.color == Color.JOKER) {
            setOverrideColor(Color.JOKER);
            setColor(colors[Color.JOKER]);
          }

          setIsInDropZone(false);
        } else {
          setIsDropped(true);
          onDrop != undefined && onDrop(resetState, overrideColor);
        }
      }}
      dragSnapToOrigin={isInDropZone && isDragging && !isDropped ? false : true}
      whileTap={{ scale: 1.12, cursor: 'grabbing' }}
      onTap={() => {
        if (onClick && !isDropped) onClick();
      }}>
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          height: '100%',
          backgroundColor: color,
          padding: '8px',
        }}>
        <Paper
          elevation={0}
          sx={{
            width: '100%',
            height: '100%',
            padding: '8px',
            backgroundColor: theme.palette.background.default,
            position: 'relative',
          }}>
          <Grid
            container
            gap={0}
            direction="column"
            justifyContent="space-between"
            sx={{ height: '100%' }}>
            <Grid item textAlign="left">
              <Container sx={{ padding: '0px !important', width: '100%' }}>
                <Chip
                  label={title}
                  size="small"
                  sx={{
                    color: theme.palette.background.default,
                    backgroundColor: color + 'E9',
                  }}
                />
              </Container>
            </Grid>
            <Grid item textAlign="center">
              <Container sx={{ padding: '0px !important', width: '100%' }}>
                {header}
              </Container>
            </Grid>
            <Grid item textAlign="right">
              <Container sx={{ padding: '0px !important', width: '100%' }}>
                <Chip
                  label={title}
                  size="small"
                  sx={{
                    color: theme.palette.background.default,
                    backgroundColor: color + 'E9',
                  }}
                />
              </Container>
            </Grid>
          </Grid>
          {card.color == Color.JOKER && isHovered && index != undefined && (
            <>
              <motion.div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  backgroundColor: colors[Color.RED],
                  width: '50%',
                  height: '50%',
                  zIndex: 99999,
                  borderRadius: '5px',
                }}
                initial={{ opacity: 0.5 }}
                whileHover={{ opacity: 0.85, scale: 1.25 }}
              />
              <motion.div
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  backgroundColor: colors[Color.YELLOW],
                  width: '50%',
                  height: '50%',
                  zIndex: 99999,
                  borderRadius: '5px',
                }}
                initial={{ opacity: 0.5 }}
                whileHover={{ opacity: 0.85, scale: 1.25 }}
              />
              <motion.div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  backgroundColor: colors[Color.GREEN],
                  width: '50%',
                  height: '50%',
                  zIndex: 99999,
                  borderRadius: '5px',
                }}
                initial={{ opacity: 0.5 }}
                whileHover={{ opacity: 0.85, scale: 1.25 }}
              />
              <motion.div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  backgroundColor: colors[Color.BLUE],
                  width: '50%',
                  height: '50%',
                  zIndex: 99999,
                  borderRadius: '5px',
                }}
                initial={{ opacity: 0.5 }}
                whileHover={{ opacity: 0.85, scale: 1.25 }}
              />
            </>
          )}
        </Paper>
      </Paper>
    </Paper>
  );
}
