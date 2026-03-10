import { Routes, Route } from "react-router-dom";
import "./App.css";
import Header from "./components/shared/Header/Header.component";
import IndexPage from "./pages/IndexPage.component";
import ComingSoonPage from "./pages/ComingSoonPage";
import NotFoundPage from "./pages/NotFoundPage";
import Footer from "./components/shared/Footer.component";

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<IndexPage />} />
        <Route path="/item/:id" element={<ComingSoonPage />} />
        <Route path="/about" element={<ComingSoonPage />} />
        <Route path="/settings" element={<ComingSoonPage />} />
        <Route path="/add-item" element={<ComingSoonPage />} />
        <Route path="/fridge" element={<ComingSoonPage />} />
        <Route path="/freezer" element={<ComingSoonPage />} />
        <Route path="/pantry" element={<ComingSoonPage />} />
        <Route path="/shopping-list" element={<ComingSoonPage />} />
        <Route path="/archive" element={<ComingSoonPage />} />
        <Route path="/reports" element={<ComingSoonPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
