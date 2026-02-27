import QuickStatsBar from "../ui/QuickStatsBar.component";
import AddInventoryItemForm from "../forms/AddInventoryItemForm.component";
import ItemCard from "../cards/ItemCard.component";
import FilterBar from "../ui/FilterBar.component";

function InventorySection() {
  return (
    <main>
      <section id="stats">
        <h2>Quick Stats</h2>
        <QuickStatsBar />
      </section>
      <section id="add-item">
        <AddInventoryItemForm />
      </section>
      <hr />
      <section id="fridge">
        <h2>Fridge</h2>
        <ul>
          <ItemCard
            title="Milk"
            quantity="1 gallon"
            expirationDate="2025-03-01"
            id={1}
          />
        </ul>
      </section>
      <section id="freezer">
        <h2>Freezer</h2>
        <ul>
          <ItemCard
            title="Milk"
            quantity="1 gallon"
            expirationDate="2054-03-01"
            id={2}
          />
        </ul>
      </section>
      <section id="freezer">
        <h2>Freezer</h2>
        <ul>
          <ItemCard
            title="Chicken Breasts"
            quantity="4 pieces"
            expirationDate="2025-08-15"
            dateFrozen="2025-02-28"
            id={3}
          />
        </ul>
      </section>
      <section id="pantry">
        <h2>Pantry</h2>
        <p>Items in the pantry will be listed here.</p>
      </section>
      <section id="filter">
        <h2>Filter & Sort</h2>
        <FilterBar />
      </section>
      <hr />
      <section id="shopping-list">
        <h2>Shopping List</h2>
        <ul>
          <ItemCard title="Milk" quantity={5} id={`shopping-${1}`} />
        </ul>
      </section>
    </main>
  );
}

export default InventorySection;
