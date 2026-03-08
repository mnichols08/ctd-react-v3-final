import { useCallback, useReducer, useRef } from "react";

const actions = {
  change: "change",
  reset: "reset",
  set: "set",
};

function formDataReducer(state, action) {
  switch (action.type) {
    case actions.change:
      return { ...state, [action.payload.name]: action.payload.value };
    case actions.reset:
      return action.payload;
    case actions.set:
      return action.payload;
    default:
      return state;
  }
}

export default function useFormData(initialState) {
  const [formData, dispatch] = useReducer(formDataReducer, initialState);
  const initialStateRef = useRef(initialState);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    dispatch({
      type: actions.change,
      payload: { name, value: type === "checkbox" ? checked : value },
    });
  }, []);

  const resetForm = useCallback((nextState) => {
    dispatch({
      type: actions.reset,
      payload: nextState ?? initialStateRef.current,
    });
  }, []);

  const setFormData = useCallback((value) => {
    dispatch({ type: actions.set, payload: value });
  }, []);

  return { formData, handleChange, resetForm, setFormData };
}
