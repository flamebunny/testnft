import { useInputEvent } from "./useInputEvent";
import { useEffect, useState } from "react";

const konamiCode = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "KeyB",
  "KeyA",
];

export const useSecretCode = () => {
  const [count, setCount] = useState(0);
  const [success, setSuccess] = useState(false)
  const key = useInputEvent()
  useEffect(() => {
    if (key == null) return;
    if (key !== konamiCode[count]) {
      setCount(0);
      return
    }

    setCount(state => state + 1)
    console.log(key);
    if (count + 1 === konamiCode.length) {
      setSuccess(true);
    }
  }, [key]);

  return success;
}
