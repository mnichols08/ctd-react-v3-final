import { useRef } from "react";

// This component is a simplified version of the AddInventoryItemForm, designed for quick addition of items with minimal required fields.
// It focuses on essential information needed to add an item to the inventory, making it ideal for users who want to quickly log items without filling out a lengthy form.
function QuickAddForm({ addInventoryItem }) {
  // Refs for form and item name input to reset and focus after submission
  const formRef = useRef(null);
  const itemNameRef = useRef(null);
  // Handle form submission by creating a new item object with the provided data and default values for other fields
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    // Extract only the necessary fields for quick addition, and set defaults for the rest
    const { ItemName, Category, Location, QtyOnHand, QtyUnit } =
      Object.fromEntries(formData.entries());
    // Basic validation to ensure required fields are provided
    if (!ItemName.trim()) return;
    const newItem = {
      id: Date.now(),
      ItemName: ItemName.trim(),
      ItemDescripton: null,
      Brand: null,
      PackageSize: null,
      UPC: null,
      Category,
      SubCategory: null,
      Location,
      QtyOnHand: Number(QtyOnHand),
      QtyUnit,
      TargetQty: 0,
      NeedRestock: false,
      ExpiresOn: null,
      DatePurchased: null,
      DateFrozen: null,
      PurchasePrice: null,
      Store: null,
      UnitCost: null,
      Notes: null,
      Tags: null,
      Allergens: null,
      ImageRef: null,
      Status: null,
      ProductUrl: null,
      LastUpdated: new Date().toISOString(),
    };
    // Call the addInventoryItem function passed as a prop to add the new item to the inventory
    addInventoryItem(newItem);
    formRef.current?.reset();
    itemNameRef.current?.focus();
  };
  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      aria-label="Quick add inventory item"
    >
      <fieldset>
        <legend>Quick Add Item</legend>

        <p>
          <label htmlFor="quick-ItemName">Item Name:</label>
          <input
            ref={itemNameRef}
            type="text"
            id="quick-ItemName"
            name="ItemName"
            required
          />
        </p>

        <p>
          <label htmlFor="quick-Category">Category:</label>
          <select id="quick-Category" name="Category" required>
            <option value="">Select Category</option>
            <option value="Drinks">Drinks</option>
            <option value="Dairy">Dairy</option>
            <option value="Dry">Dry</option>
            <option value="Produce">Produce</option>
            <option value="Meat">Meat</option>
            <option value="Frozen">Frozen</option>
            <option value="Condiments">Condiments</option>
            <option value="Snacks">Snacks</option>
            <option value="Other">Other</option>
          </select>
        </p>

        <p>
          <label htmlFor="quick-Location">Location:</label>
          <select id="quick-Location" name="Location" required>
            <option value="">Select Location</option>
            <option value="Fridge">Fridge</option>
            <option value="Freezer">Freezer</option>
            <option value="Pantry">Pantry</option>
          </select>
        </p>

        <p>
          <label htmlFor="quick-QtyOnHand">Qty On Hand:</label>
          <input
            type="number"
            id="quick-QtyOnHand"
            name="QtyOnHand"
            min="0"
            required
          />
        </p>

        <p>
          <label htmlFor="quick-QtyUnit">Qty Unit:</label>
          <input
            type="text"
            id="quick-QtyUnit"
            name="QtyUnit"
            placeholder="e.g. box, bottle, jar"
          />
        </p>
      </fieldset>

      <button type="submit">Add Item</button>
    </form>
  );
}

export default QuickAddForm;
