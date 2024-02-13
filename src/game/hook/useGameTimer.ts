import { useRef, useState } from "react";

enum GameMode {
  SLOW = 5,
  MEDIUM = 10,
  FAST = 30,
}

type Mode = "SLOW" | "MEDIUM" | "FAST";

const RESET_VALUE = 0;
const useGameTimer = (mode: Mode = "MEDIUM") => {
  const isRecordingActive = useRef(false);
  const requestAnimationFrameRef = useRef<number>();
  const [time, setTime] = useState(RESET_VALUE);
  const startTimeRef = useRef(RESET_VALUE);

  const onTimerUpdate = () => {
    if (startTimeRef.current > RESET_VALUE) {
      const timeDifference = Math.floor(Date.now() - startTimeRef.current);
      setTime(timeDifference);
    }
    const timer = setTimeout(onTimerUpdate, 1000 / GameMode[mode]);
    //2 , 10 , 30
    // requestAnimationFrameRef.current = requestAnimationFrame(onTimerUpdate);

    if (isRecordingActive.current === false) {
      clearTimeout(timer);
      // cancelAnimationFrame(requestAnimationFrameRef.current!);
    }
  };

  const start = () => {
    stop();
    startTimeRef.current = Date.now();
    isRecordingActive.current = true;
    onTimerUpdate();
  };

  const pause = () => {
    isRecordingActive.current = false;
  };

  const resume = () => {
    isRecordingActive.current = true;
    startTimeRef.current = Date.now() - time;
    requestAnimationFrameRef.current = requestAnimationFrame(onTimerUpdate);
  };

  const stop = () => {
    startTimeRef.current = RESET_VALUE;
    setTime(RESET_VALUE);
  };

  return {
    time,
    start,
    pause,
    resume,
    stop,
  };
};

export default useGameTimer;
