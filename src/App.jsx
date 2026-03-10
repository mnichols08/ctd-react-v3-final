import { Routes, Route } from "react-router-dom";
import "./App.css";
import Header from "./components/shared/Header/Header.component";
import MainContainer from "./components/ui/MainContainer.component";
import Footer from "./components/shared/Footer.component";

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<MainContainer />} />
        <Route path="/item/:id" element={<h2>Item Details</h2>} />
        <Route path="/about" element={<h2>About Page</h2>} />
        <Route path="*" element={<h2>404 Not Found</h2>} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
