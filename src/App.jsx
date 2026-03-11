import { Routes, Route } from "react-router-dom";
import "./App.css";
import GlobalStyles from "./styles/GlobalStyles";
import Header from "./components/shared/Header/Header.component";
import SettingsPage from "./pages/SettingsPage.component";
import IndexPage from "./pages/IndexPage.component";
import AboutPage from "./pages/AboutPage.component";
import ItemDetailPage from "./pages/ItemDetailPage.component";
import ComingSoonPage from "./pages/ComingSoonPage.component";
import NotFoundPage from "./pages/NotFoundPage.component";
import Footer from "./components/shared/Footer.component";

function App() {
  return (
    <>
      <GlobalStyles />
      {/* Skip to main content link for keyboard users */}
      <a href="#main-content">Skip to main content</a>
      <Header />
      <main id="main-content" aria-label="Main content area">
        <Routes>
          <Route path="/" element={<IndexPage />} />
          <Route path="/item/:id" element={<ItemDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/add-item" element={<ComingSoonPage />} />
          <Route path="/fridge" element={<ComingSoonPage />} />
          <Route path="/freezer" element={<ComingSoonPage />} />
          <Route path="/pantry" element={<ComingSoonPage />} />
          <Route path="/shopping-list" element={<ComingSoonPage />} />
          <Route path="/archive" element={<ComingSoonPage />} />
          <Route path="/reports" element={<ComingSoonPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App;
