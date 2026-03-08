import { memo, useRef } from "react";
import useFormData from "../../hooks/useFormData";
import { LOCATIONS } from "../../data/fieldConfig";

// Initial form state with all fields set to empty or default values
const initialFormState = {
  ItemName: "",
  ItemDescription: "",
  Brand: "",
  PackageSize: "",
  UPC: "",
  Category: "",
  SubCategory: "",
  Location: "",
  QtyOnHand: "",
  QtyUnit: "",
  TargetQty: "",
  ExpiresOn: "",
  DatePurchased: "",
  DateFrozen: "",
  PurchasePrice: "",
  Store: "",
  UnitCost: "",
  Notes: "",
  Tags: "",
  Allergens: "",
  ImageRef: "",
  Status: "",
  ProductUrl: "",
};

function AddInventoryItemForm({ addInventoryItem }) {
  // Form state to manage controlled inputs
  const { formData, handleChange, resetForm } = useFormData(initialFormState);
  const itemNameRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newItem = {
      id: crypto.randomUUID(),
      ...formData,
      NeedRestock: false,
      LastUpdated: new Date().toISOString(),
    };
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
    // Coerce empty date strings to null (Airtable rejects "")
    ["ExpiresOn", "DatePurchased", "DateFrozen"].forEach((field) => {
      if (!newItem[field]) newItem[field] = null;
    });
    const success = await addInventoryItem(newItem);
    if (success === false) return;
    resetForm();
    itemNameRef.current?.focus();
  };
  return (
    <form onSubmit={handleSubmit} aria-label="Add Inventory Item">
      <fieldset>
        <legend>Basic Details</legend>
        <label htmlFor="ItemName">Item Name:</label>
        <input
          ref={itemNameRef}
          value={formData.ItemName}
          onChange={handleChange}
          type="text"
          id="ItemName"
          name="ItemName"
          required
        />

        <label htmlFor="ItemDescription">Item Description:</label>
        <textarea
          value={formData.ItemDescription}
          onChange={handleChange}
          id="ItemDescription"
          name="ItemDescription"
        />

        <label htmlFor="Brand">Brand:</label>
        <input
          value={formData.Brand}
          onChange={handleChange}
          type="text"
          id="Brand"
          name="Brand"
        />

        <label htmlFor="PackageSize">Package Size:</label>
        <input
          value={formData.PackageSize}
          onChange={handleChange}
          type="text"
          id="PackageSize"
          name="PackageSize"
        />

        <label htmlFor="UPC">UPC:</label>
        <input
          value={formData.UPC}
          onChange={handleChange}
          type="text"
          id="UPC"
          name="UPC"
        />

        <label htmlFor="Status">Status:</label>
        <input
          value={formData.Status}
          onChange={handleChange}
          type="text"
          id="Status"
          name="Status"
        />
      </fieldset>

      <fieldset>
        <legend>Classification & Storage</legend>
        <label htmlFor="Category">Category:</label>
        <input
          value={formData.Category}
          onChange={handleChange}
          type="text"
          id="Category"
          name="Category"
        />

        <label htmlFor="SubCategory">Sub Category:</label>
        <input
          value={formData.SubCategory}
          onChange={handleChange}
          type="text"
          id="SubCategory"
          name="SubCategory"
        />

        <label htmlFor="Location">Location:</label>
        <select
          value={formData.Location}
          onChange={handleChange}
          id="Location"
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

        <label htmlFor="Tags">Tags:</label>
        <input
          value={formData.Tags}
          onChange={handleChange}
          type="text"
          id="Tags"
          name="Tags"
        />

        <label htmlFor="Allergens">Allergens:</label>
        <input
          value={formData.Allergens}
          onChange={handleChange}
          type="text"
          id="Allergens"
          name="Allergens"
        />
      </fieldset>

      <fieldset>
        <legend>Quantities</legend>
        <label htmlFor="QtyOnHand">Quantity on Hand:</label>
        <input
          value={formData.QtyOnHand}
          onChange={handleChange}
          type="number"
          id="QtyOnHand"
          name="QtyOnHand"
          min="0"
          step="any"
          required
        />

        <label htmlFor="QtyUnit">Unit:</label>
        <input
          value={formData.QtyUnit}
          onChange={handleChange}
          type="text"
          id="QtyUnit"
          name="QtyUnit"
        />

        <label htmlFor="TargetQty">Target Qty:</label>
        <input
          value={formData.TargetQty}
          onChange={handleChange}
          type="number"
          id="TargetQty"
          name="TargetQty"
          min="0"
        />
      </fieldset>

      <fieldset>
        <legend>Dates</legend>
        <label htmlFor="ExpiresOn">Expires On:</label>
        <input
          value={formData.ExpiresOn}
          onChange={handleChange}
          type="date"
          id="ExpiresOn"
          name="ExpiresOn"
        />

        <label htmlFor="DatePurchased">Date Purchased:</label>
        <input
          value={formData.DatePurchased}
          onChange={handleChange}
          type="date"
          id="DatePurchased"
          name="DatePurchased"
        />

        <label htmlFor="DateFrozen">Date Frozen:</label>
        <input
          value={formData.DateFrozen}
          onChange={handleChange}
          type="date"
          id="DateFrozen"
          name="DateFrozen"
        />
      </fieldset>

      <fieldset>
        <legend>Pricing & Purchase</legend>
        <label htmlFor="PurchasePrice">Purchase Price:</label>
        <input
          value={formData.PurchasePrice}
          onChange={handleChange}
          type="number"
          id="PurchasePrice"
          name="PurchasePrice"
          min="0"
          step="0.01"
        />

        <label htmlFor="UnitCost">Unit Cost:</label>
        <input
          value={formData.UnitCost}
          onChange={handleChange}
          type="number"
          id="UnitCost"
          name="UnitCost"
          min="0"
          step="0.01"
        />

        <label htmlFor="Store">Store:</label>
        <input
          value={formData.Store}
          onChange={handleChange}
          type="text"
          id="Store"
          name="Store"
        />
      </fieldset>

      <fieldset>
        <legend>References & Notes</legend>
        <label htmlFor="ProductUrl">Product URL:</label>
        <input
          value={formData.ProductUrl}
          onChange={handleChange}
          type="url"
          id="ProductUrl"
          name="ProductUrl"
        />

        <label htmlFor="ImageRef">Image Reference:</label>
        <input
          value={formData.ImageRef}
          onChange={handleChange}
          type="text"
          id="ImageRef"
          name="ImageRef"
        />

        <label htmlFor="Notes">Notes:</label>
        <textarea
          value={formData.Notes}
          onChange={handleChange}
          id="Notes"
          name="Notes"
        />
      </fieldset>
      <button type="submit">Add Item</button>
    </form>
  );
}

export default memo(AddInventoryItemForm);
