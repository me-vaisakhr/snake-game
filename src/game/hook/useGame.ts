import { useEffect, useRef, useState } from "react";
import useGameTimer from "./useGameTimer";

const WIDTH = 30;
const HEIGHT = 30;

enum PLAYGROUND_VALUES {
  EMPTY = 0,
  SNAKE_BODY = 1,
  SNAKE_HEAD = 2,
  FOOD = 3,
}

type Direction = "UPWARD" | "DOWNWARD" | "STRAIGHT" | "BACKWARD";

interface GameInterface {
  onEnd: () => void;
}

const useGame = ({ onEnd }: GameInterface) => {
  const [gameTime, setGameTime] = useState(0);
  const [isGamePause, setGamePause] = useState(false);
  const [playground, setPlaygroundGrid] = useState<number[][]>([]);
  const { time, start, pause, resume, stop } = useGameTimer();
  const snakePositionRef = useRef<Array<[number, number]>>([]);
  const foodRef = useRef<[number, number]>();
  const snakeHeadDirectionRef = useRef<Direction>("STRAIGHT");

  const generatePlayground = () => {
    const grid = Array.from(Array(WIDTH), () => new Array(HEIGHT).fill(0));
    return grid;
  };

  const placeSnake = (ground: number[][]) => {
    const tmp = [...ground];
    tmp[WIDTH / 2 - 1][HEIGHT / 2 - 1] = PLAYGROUND_VALUES.SNAKE_HEAD;
    snakePositionRef.current = [[WIDTH / 2, HEIGHT / 2]];
    return tmp;
  };

  const getUpdatedSnakePositionInTheGround = (
    currentPositions: Array<[number, number]>,
    updatedHeadX: number,
    updatedHeadyY: number
  ) => {
    const positions = currentPositions;
    for (let i = 1, previous = positions[0]; i < positions.length; i++) {
      const temp = positions[i];
      positions[i] = previous;
      previous = temp;
    }
    positions[0] = [updatedHeadX, updatedHeadyY];
    return positions;
  };

  const stringifyPositions = (positions: Array<[number, number]>) => {
    return positions.map((position) => position.join("_"));
  };

  const updateGround = (
    snakeNewPositions: Array<[number, number]>,
    fruitPosition: [number, number]
  ) => {
    if (isGameOver(snakeNewPositions)) return null;
    const newGround = generatePlayground();
    const [foodX, foodY] = fruitPosition;
    const stringifiedPositions = stringifyPositions(snakeNewPositions);
    for (let i = 0; i < newGround.length; i++) {
      for (let j = 0; j < newGround.length; j++) {
        if (stringifiedPositions.includes(`${i}_${j}`)) {
          if (stringifiedPositions.indexOf(`${i}_${j}`) === 0)
            newGround[i][j] = PLAYGROUND_VALUES.SNAKE_HEAD;
          else newGround[i][j] = PLAYGROUND_VALUES.SNAKE_BODY;
        }
        if (`${i}_${j}` === `${foodX}_${foodY}`) {
          newGround[i][j] = PLAYGROUND_VALUES.FOOD;
        }
      }
    }
    return newGround;
  };

  const isGameOver = (currentSnakePositions: Array<[number, number]>) => {
    const head = currentSnakePositions[0].join("_");
    const body = currentSnakePositions
      .filter((_, index) => index !== 0)
      .map((position) => position.join("_"));
    // console.info({ head, body, check: body.includes(head) });
    return body.includes(head);
  };

  const isSnakeAteFood = (
    currentSnakePositions: Array<[number, number]>,
    fruitPosition: [number, number]
  ) => {
    const head = currentSnakePositions[0].join("_");
    const currentFruitPosition = fruitPosition.join("_");
    return head === currentFruitPosition;
  };

  const generateFood = (currentGround: number[][]) => {
    const emptyGroundAreas: Array<string> = [];
    for (let i = 0; i < currentGround.length; i++)
      for (let j = 0; j < currentGround.length; j++) {
        if (currentGround[i][j] === PLAYGROUND_VALUES.EMPTY)
          emptyGroundAreas.push(`${i}_${j}`);
      }

    const randomPosition = Math.floor(Math.random() * emptyGroundAreas.length);

    return emptyGroundAreas[randomPosition]
      .split("_")
      .map((position) => parseInt(position)) as [number, number];
  };

  const increaseSnakeBody = (currentSnakeBody: Array<[number, number]>) => {
    const direction = snakeHeadDirectionRef.current;

    let [newBodyX, newBodyY] = currentSnakeBody[currentSnakeBody.length - 1];

    switch (direction) {
      case "STRAIGHT":
        newBodyX = newBodyX - 1 < 0 ? WIDTH - 1 : (newBodyX - 1) % WIDTH;
        break;
      case "BACKWARD":
        newBodyX = newBodyX + (1 % WIDTH);
        break;
      case "DOWNWARD":
        newBodyY = newBodyY + (1 % HEIGHT);
        break;
      case "UPWARD":
        newBodyY = newBodyY - 1 < 0 ? HEIGHT - 1 : (newBodyY - 1) % HEIGHT;
        break;
    }
    return currentSnakeBody.push([newBodyX, newBodyY]);
  };

  const moveSnake = () => {
    if (!playground.length) return;
    if (!foodRef.current) {
      foodRef.current = generateFood(playground);
    }
    let [headX, headY] = snakePositionRef.current[0];
    const currentDirection = snakeHeadDirectionRef.current;

    switch (currentDirection) {
      case "UPWARD":
        headY = headY - 1 < 0 ? HEIGHT - 1 : (headY - 1) % HEIGHT;
        break;
      case "DOWNWARD":
        headY = (headY + 1) % HEIGHT;
        break;
      case "STRAIGHT":
        headX = (headX + 1) % WIDTH;
        break;
      case "BACKWARD":
        headX = headX - 1 < 0 ? WIDTH - 1 : (headX - 1) % WIDTH;
        break;
    }

    const snakeNewPositions = getUpdatedSnakePositionInTheGround(
      snakePositionRef.current,
      headX,
      headY
    );

    if (isGameOver(snakeNewPositions)) {
      stop();
      setTimeout(() => {
        onEnd();
      }, 2000);
      console.info("GAME OVER");
    } else {
      const updatedPlayground = updateGround(
        snakeNewPositions,
        foodRef.current
      );
      if (!updatedPlayground) return;
      if (isSnakeAteFood(snakeNewPositions, foodRef.current)) {
        increaseSnakeBody(snakeNewPositions);
        const newFoodPosition = generateFood(updatedPlayground) as [
          number,
          number
        ];
        updateGround(snakeNewPositions, newFoodPosition);
        foodRef.current = newFoodPosition;
      }
      snakePositionRef.current = snakeNewPositions;
      setPlaygroundGrid(updatedPlayground);
    }
  };

  useEffect(() => {
    moveSnake();
    setGameTime(time);
  }, [time]);

  useEffect(() => {
    window.addEventListener("keypress", (evt) => onKeyPress(evt.code));
    return () => {
      window.removeEventListener("keypress", (evt) => onKeyPress(evt.code));
      stop();
    };
  }, []);

  const onKeyPress = (key: string) => {
    switch (key) {
      case "Numpad8":
        snakeHeadDirectionRef.current = "UPWARD";
        break;
      case "Numpad5":
        snakeHeadDirectionRef.current = "DOWNWARD";
        break;
      case "Numpad6":
        snakeHeadDirectionRef.current = "STRAIGHT";
        break;
      case "Numpad4":
        snakeHeadDirectionRef.current = "BACKWARD";
        break;
    }
  };

  const startGame = () => {
    setPlaygroundGrid(placeSnake(generatePlayground()));
    start();
  };

  const pauseGame = () => {
    pause();
    setGamePause(true);
  };

  const resumeGame = () => {
    resume();
    setGamePause(false);
  };

  const exitGame = () => {
    stop();
  };

  return {
    gameTime,
    playground,
    isGamePause,
    startGame,
    pauseGame,
    resumeGame,
    exitGame,
  };
};

export default useGame;
