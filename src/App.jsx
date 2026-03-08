import { useCallback, useState } from "react";
import "./App.css";
import Header from "./components/shared/Header/Header.component";
import MainContainer from "./components/ui/MainContainer.component";
import Footer from "./components/shared/Footer.component";
import { DEFAULT_VISIBLE_FIELDS } from "./data/fieldConfig";

function App() {
  // Visible-fields preference — shared across all cards, controlled from the header nav
  const [visibleFields, setVisibleFields] = useState(
    () => new Set(DEFAULT_VISIBLE_FIELDS),
  );

  const toggleField = useCallback((key) => {
    setVisibleFields((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const resetFields = useCallback(() => {
    setVisibleFields(new Set(DEFAULT_VISIBLE_FIELDS));
  }, []);

  // State to track whether archived items exist in the inventory, passed down to Header for conditional nav link rendering
  const [archivedItemsExist, setArchivedItemsExist] = useState(false);
  return (
    <>
      <Header
        visibleFields={visibleFields}
        onToggleField={toggleField}
        onResetFields={resetFields}
        archivedItemsExist={archivedItemsExist}
      />
      <MainContainer
        visibleFields={visibleFields}
        setArchivedItemsExist={setArchivedItemsExist}
      />
      <Footer />
    </>
  );
}

export default App;
