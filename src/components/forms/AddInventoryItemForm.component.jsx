import { useRef } from "react";

function AddInventoryItemForm({ addInventoryItem }) {
  const formRef = useRef(null);
  const itemNameRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newItem = Object.fromEntries(formData.entries());
    // Coerce numeric fields from strings to numbers (or null for empty fields)
    const numericFields = [
      "QtyOnHand",
      "TargetQty",
      "PurchasePrice",
      "UnitCost",
    ];
    numericFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(newItem, field)) {
        const value = newItem[field];
        newItem[field] = value === "" ? null : Number(value);
      }
    });
    newItem.LastUpdated = new Date().toISOString();
    newItem.id = new Date().getTime(); // Use timestamp as unique ID for simplicity
    addInventoryItem(newItem);
    formRef.current?.reset();
    itemNameRef.current?.focus();
  };
  return (
    <form ref={formRef} onSubmit={handleSubmit} aria-label="Add Inventory Item">
      <fieldset>
        <legend>Basic Details</legend>
        <label htmlFor="ItemName">Item Name:</label>
        <input
          ref={itemNameRef}
          type="text"
          id="ItemName"
          name="ItemName"
          required
        />

        <label htmlFor="ItemDescripton">Item Description:</label>
        <textarea id="ItemDescripton" name="ItemDescripton" />

        <label htmlFor="Brand">Brand:</label>
        <input type="text" id="Brand" name="Brand" />

        <label htmlFor="PackageSize">Package Size:</label>
        <input type="text" id="PackageSize" name="PackageSize" />

        <label htmlFor="UPC">UPC:</label>
        <input type="text" id="UPC" name="UPC" />

        <label htmlFor="Status">Status:</label>
        <input type="text" id="Status" name="Status" />
      </fieldset>

      <fieldset>
        <legend>Classification & Storage</legend>
        <label htmlFor="Category">Category:</label>
        <input type="text" id="Category" name="Category" />

        <label htmlFor="SubCategory">Sub Category:</label>
        <input type="text" id="SubCategory" name="SubCategory" />

        <label htmlFor="Location">Location:</label>
        <select id="Location" name="Location" required>
          <option value="">Select Location</option>
          <option value="Fridge">Fridge</option>
          <option value="Freezer">Freezer</option>
          <option value="Pantry">Pantry</option>
        </select>

        <label htmlFor="Tags">Tags:</label>
        <input type="text" id="Tags" name="Tags" />

        <label htmlFor="Allergens">Allergens:</label>
        <input type="text" id="Allergens" name="Allergens" />
      </fieldset>

      <fieldset>
        <legend>Quantities</legend>
        <label htmlFor="QtyOnHand">Qty On Hand:</label>
        <input type="number" id="QtyOnHand" name="QtyOnHand" min="0" required />

        <label htmlFor="QtyUnit">Qty Unit:</label>
        <input type="text" id="QtyUnit" name="QtyUnit" />

        <label htmlFor="TargetQty">Target Qty:</label>
        <input type="number" id="TargetQty" name="TargetQty" min="0" />

        <label htmlFor="NeedRestock">Need Restock:</label>
        <input type="checkbox" id="NeedRestock" name="NeedRestock" />
      </fieldset>

      <fieldset>
        <legend>Dates</legend>
        <label htmlFor="ExpiresOn">Expires On:</label>
        <input type="date" id="ExpiresOn" name="ExpiresOn" />

        <label htmlFor="DatePurchased">Date Purchased:</label>
        <input type="date" id="DatePurchased" name="DatePurchased" />

        <label htmlFor="DateFrozen">Date Frozen:</label>
        <input type="date" id="DateFrozen" name="DateFrozen" />
      </fieldset>

      <fieldset>
        <legend>Pricing & Purchase</legend>
        <label htmlFor="PurchasePrice">Purchase Price:</label>
        <input
          type="number"
          id="PurchasePrice"
          name="PurchasePrice"
          min="0"
          step="0.01"
        />

        <label htmlFor="UnitCost">Unit Cost:</label>
        <input
          type="number"
          id="UnitCost"
          name="UnitCost"
          min="0"
          step="0.01"
        />

        <label htmlFor="Store">Store:</label>
        <input type="text" id="Store" name="Store" />
      </fieldset>

      <fieldset>
        <legend>References & Notes</legend>
        <label htmlFor="ProductUrl">Product URL:</label>
        <input type="url" id="ProductUrl" name="ProductUrl" />

        <label htmlFor="ImageRef">Image Reference:</label>
        <input type="text" id="ImageRef" name="ImageRef" />

        <label htmlFor="Notes">Notes:</label>
        <textarea id="Notes" name="Notes" />
      </fieldset>
      <button type="submit">Add Item</button>
    </form>
  );
}

export default AddInventoryItemForm;
