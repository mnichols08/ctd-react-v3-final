import { memo, useRef } from "react";
import useFormData from "../../hooks/useFormData";
import { CATEGORIES, LOCATIONS } from "../../data/fieldConfig";

const initialFormState = {
  ItemName: "",
  Category: "",
  ExpiresOn: "",
  Location: "",
  QtyOnHand: "",
  QtyUnit: "",
};

// This component is a simplified version of the AddInventoryItemForm, designed for quick addition of items with minimal required fields.
// It focuses on essential information needed to add an item to the inventory, making it ideal for users who want to quickly log items without filling out a lengthy form.
function QuickAddForm({ addInventoryItem }) {
  // Refs for item name input to reset and focus after submission
  const itemNameRef = useRef(null);

  // State to manage form data, initialized with empty values for the required fields
  const { formData, handleChange, resetForm } = useFormData(initialFormState);
  // Handle form submission by creating a new item object with the provided data and default values for other fields
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Extract only the necessary fields for quick addition, and set defaults for the rest
    const { ItemName, Category, ExpiresOn, Location, QtyOnHand, QtyUnit } =
      formData;
    // Basic validation to ensure required fields are provided
    if (!ItemName.trim()) return;
    // Create a new item object with the provided data and default values for other fields
    const newItem = {
      id: crypto.randomUUID(),
      ItemName: ItemName.trim(),
      ItemDescription: null,
      Brand: null,
      PackageSize: null,
      UPC: null,
      Category: Category,
      SubCategory: null,
      Location,
      QtyOnHand: Number(QtyOnHand),
      QtyUnit,
      TargetQty: 0,
      NeedRestock: false,
      ExpiresOn: ExpiresOn || null,
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
    // Call addInventoryItem to add the new item to the inventory
    const success = await addInventoryItem(newItem);
    if (success === false) return;
    // Reset the form and focus the item name input for quick entry of the next item
    resetForm();
    itemNameRef.current?.focus();
  };
  return (
    <form onSubmit={handleSubmit} aria-label="Quick add inventory item">
      <fieldset>
        <legend>Quick Add Item</legend>

        <p>
          <label htmlFor="quick-ItemName">Item Name: </label>
          <input
            value={formData.ItemName}
            onChange={handleChange}
            ref={itemNameRef}
            type="text"
            id="quick-ItemName"
            name="ItemName"
            required
          />
        </p>

        <p>
          <label htmlFor="quick-Category">Category: </label>
          <select
            value={formData.Category}
            onChange={handleChange}
            id="quick-Category"
            name="Category"
            required
          >
            <option value="">Select Category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </p>

        <p>
          <label htmlFor="quick-ExpiresOn">Expires On: </label>
          <input
            value={formData.ExpiresOn}
            onChange={handleChange}
            type="date"
            id="quick-ExpiresOn"
            name="ExpiresOn"
          />
        </p>

        <p>
          <label htmlFor="quick-Location">Location: </label>
          <select
            value={formData.Location}
            onChange={handleChange}
            id="quick-Location"
            name="Location"
            required
          >
            <option value="">Select Location</option>
            {LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </p>

        <p>
          <label htmlFor="quick-QtyOnHand">Quantity on Hand: </label>
          <input
            value={formData.QtyOnHand}
            onChange={handleChange}
            type="number"
            id="quick-QtyOnHand"
            name="QtyOnHand"
            min="0"
            step="any"
            required
          />
        </p>

        <p>
          <label htmlFor="quick-QtyUnit">Unit: </label>
          <input
            value={formData.QtyUnit}
            onChange={handleChange}
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

export default memo(QuickAddForm);
