import { ComponentProps, FC, PropsWithChildren, useState } from "react";
import Title from "./components/Title";
import Playground from "./components/Playground";

type State = "LOBBY" | "GAME_AREA" | "RESULT";

const Game = () => {
  const [state, setState] = useState<State>("LOBBY");

  const handleReStart = () => {
    setState("LOBBY");
  };
  const handleCompleted = () => {
    setState("RESULT");
  };

  const getView = () => {
    switch (state) {
      case "LOBBY":
        return <Lobby onStart={() => setState("GAME_AREA")} />;
      case "GAME_AREA":
        return <Playground onCompleted={handleCompleted} />;
      case "RESULT":
        return <Result onReStart={handleReStart} />;
    }
  };

  return <>{getView()}</>;
};

export default Game;

const Lobby: FC<{ onStart: () => void }> = ({ onStart }) => {
  return (
    <>
      <Title />
      <DifficultyChooser />
      <Button onClick={onStart}>Start</Button>
    </>
  );
};

const Result: FC<{ onReStart: () => void }> = ({ onReStart }) => {
  return (
    <>
      <Title />
      <h4>The End</h4>
      <Button onClick={onReStart}>Back to Lobby</Button>
    </>
  );
};

const DifficultyChooser: FC = () => {
  return (
    <ul>
      <li>Easy</li>
      <li>Medium</li>
      <li>Hard</li>
    </ul>
  );
};

const Button: FC<PropsWithChildren<ComponentProps<"button">>> = ({
  children,
  ...rest
}) => {
  return <button {...rest}>{children}</button>;
};
