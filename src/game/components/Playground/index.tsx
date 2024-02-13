import { FC, useEffect } from "react";
import useGame from "../../hook/useGame";

const Playground: FC<{ onCompleted: () => void }> = ({onCompleted}) => {
  const {
    playground,
    isGamePause: isPause,
    startGame,
    pauseGame,
    resumeGame,
  } = useGame({ onEnd: onCompleted });
  useEffect(() => {
    startGame();
  }, []);

  const handleGameState = () => {
    isPause ? resumeGame() : pauseGame();
  };
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <button onClick={handleGameState}>{isPause ? "Resume" : "Pause"}</button>
      <div
        style={{
          display: "flex",
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {playground.map((row, index) => {
          return (
            <div
              key={`row-${index}`}
              style={{ backgroundColor: "greenyellow" }}
            >
              {row.map((grid, index) => {
                return (
                  <div
                    key={`grid-${index}`}
                    style={{
                      padding: 10,
                      backgroundColor:
                        grid === 3
                          ? "coral"
                          : grid === 2
                          ? "purple"
                          : grid === 1
                          ? "green"
                          : "inherit",
                    }}
                  >
                    {``}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Playground;
