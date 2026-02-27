import "./App.css";

function App() {
  return (
    <>
      <header>
        <h1>Kitchen Inventory</h1>
        <p>Manage your kitchen items efficiently.</p>
        <nav>
          <menu>
            <li>
              <a href="#fridge">Fridge</a>
            </li>
            <li>
              <a href="#freezer">Freezer</a>
            </li>
            <li>
              <a href="#pantry">Pantry</a>
            </li>
            <li>
              <a href="#shopping-list">Shopping List</a>
            </li>
          </menu>
        </nav>
      </header>
      <main>
        <section id="fridge">
          <h2>Fridge</h2>
          {/* <p>Items in the fridge will be listed here.</p> */}
          <ul>
            <li>
              <article>
                <h3>Milk</h3>
                <p>Quantity: 1 gallon</p>
                <p>Expiration Date: 2054-03-01</p>
              </article>
            </li>
          </ul>
        </section>
        <section id="freezer">
          <h2>Freezer</h2>
          {/* <p>Items in the freezer will be listed here.</p> */}
          <ul>
            <li>
              <article>
                <h3>Chicken Breasts</h3>
                <p>Quantity: 4 pieces</p>
                <p>Expiration Date: 2025-08-15</p>
                <p>Date Frozen: 2025-02-28</p>
              </article>
            </li>
          </ul>
        </section>
        <section id="pantry">
          <h2>Pantry</h2>
          <p>Items in the pantry will be listed here.</p>
          {/* <ul>
            <li>
              <article>
                <h3>Example Item</h3>
                <p>Quantity: 1</p>
                <p>Expiration Date: 2025-12-31</p>
                <p>Notes: Keep in a cool, dry place</p>
              </article>
            </li>
          </ul> */}
        </section>
        <section id="shopping-list">
          <h2>Shopping List</h2>
          {/* <p>Your shopping list will be displayed here.</p> */}
          <ul>
            <li>
              <article>
                <h3>Example Item</h3>
                <p>Quantity: 2</p>
                <p>Notes: Buy organic if possible</p>
                <p>Category: Fruits</p>
              </article>
            </li>
          </ul>
        </section>
      </main>
      <footer>
        <hr />
        <p>&copy; 2026 Kitchen Inventory App</p>
        <p>
          &lt; /&gt; with &lt;3 by{" "}
          <a
            href="https://github.com/mnichols08"
            target="_blank"
            rel="noopener noreferrer"
          >
            mnichols08
          </a>{" "}
          |{" "}
          <a
            href="https://github.com/mnichols08/ctd-react-v3-final"
            target="_blank"
            rel="noopener noreferrer"
          >
            Source Code
          </a>
        </p>
      </footer>
    </>
  );
}

export default App;
