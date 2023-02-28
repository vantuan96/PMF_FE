import { useEffect, useRef } from "react"
export const useComponentDidMount = handler => {
  return useEffect(() => {
    return handler();
  });
};
export const useComponentDidUpdate = (handler) => {
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    return handler()
  });
};