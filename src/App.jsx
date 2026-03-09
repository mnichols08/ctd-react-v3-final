import "./App.css";
import Header from "./components/shared/Header/Header.component";
import MainContainer from "./components/ui/MainContainer.component";
import Footer from "./components/shared/Footer.component";
import { useInventoryContext } from "./context/InventoryContext";

function App() {
  const inventory = useInventoryContext();


  return (
    <>
      <Header />
      <MainContainer inventory={inventory} />
      <Footer />
    </>
  );
}

export default App;
