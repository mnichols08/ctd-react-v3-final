import { useEffect } from "react";
import generatePageTitle from "../utils/generatePageTitle";

const useTitle = (title) => {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = generatePageTitle(title);
    return () => {
      document.title = prevTitle;
    };
  });
};

export default useTitle;
