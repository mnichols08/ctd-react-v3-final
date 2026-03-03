import { useState } from "react";
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

  const toggleField = (key) => {
    setVisibleFields((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const resetFields = () => {
    setVisibleFields(new Set(DEFAULT_VISIBLE_FIELDS));
  };

  return (
    <>
      <Header
        visibleFields={visibleFields}
        onToggleField={toggleField}
        onResetFields={resetFields}
      />
      <MainContainer visibleFields={visibleFields} />
      <Footer />
    </>
  );
}

export default App;
