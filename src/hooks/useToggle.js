import { useCallback, useReducer } from "react";

function toggleReducer(state, action) {
  switch (action) {
    case "toggle":
      return !state;
    case "setTrue":
      return true;
    case "setFalse":
      return false;
    default:
      return state;
  }
}

export default function useToggle(initialValue = false) {
  const [value, dispatch] = useReducer(toggleReducer, initialValue);
  const toggle = useCallback(() => dispatch("toggle"), []);
  const setTrue = useCallback(() => dispatch("setTrue"), []);
  const setFalse = useCallback(() => dispatch("setFalse"), []);
  return [value, toggle, setTrue, setFalse];
}
