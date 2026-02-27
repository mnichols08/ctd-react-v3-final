import ItemCard from "../cards/ItemCard.component";
function InventorySection() {
  return (
    <main>
      <section id="fridge">
        <h2>Fridge</h2>
        {/* <p>Items in the fridge will be listed here.</p> */}
        <ul>
          <ItemCard
            title="Milk"
            quantity="1 gallon"
            expirationDate="2054-03-01"
          />
        </ul>
      </section>
      <section id="freezer">
        <h2>Freezer</h2>
        {/* <p>Items in the freezer will be listed here.</p> */}
        <ul>
          <ItemCard
            title="Milk"
            quantity="1 gallon"
            expirationDate="2054-03-01"
          />
        </ul>
      </section>
      <section id="freezer">
        <h2>Freezer</h2>
        {/* <p>Items in the freezer will be listed here.</p> */}
        <ul>
          <ItemCard
            title="Chicken Breasts"
            quantity="4 pieces"
            expirationDate="2025-08-15"
            dateFrozen="2025-02-28"
          />
        </ul>
      </section>
      <section id="pantry">
        <h2>Pantry</h2>
        <p>Items in the pantry will be listed here.</p>
        {/* <ul>
          <ItemCard>
            <h3>Example Item</h3>
            <p>Quantity: 1</p>
            <p>Expiration Date: 2025-12-31</p>
            <p>Notes: Keep in a cool, dry place</p>
          </ItemCard>
        </ul> */}
      </section>
      <section id="shopping-list">
        <h2>Shopping List</h2>
        {/* <p>Your shopping list will be displayed here.</p> */}
        <ul>
          <ItemCard
            title="Example Item"
            quantity="2"
            notes="Buy organic if possible"
            category="Fruits"
          />
        </ul>
      </section>
    </main>
  );
}

export default InventorySection;
