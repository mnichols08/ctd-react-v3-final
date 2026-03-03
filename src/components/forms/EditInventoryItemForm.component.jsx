import { useEffect, useRef, useState } from "react";

function EditInventoryItemForm({ item, onSave, onCancel }) {
  // Destructure item properties for easier access and initialize form state with existing item data

  // Initialize form state with existing item data, converting null/undefined to empty strings for controlled inputs
  const [formData, setFormData] = useState({
    ItemName: item.ItemName || "",
    ItemDescripton: item.ItemDescripton || "",
    Brand: item.Brand || "",
    PackageSize: item.PackageSize || "",
    UPC: item.UPC || "",
    Category: item.Category || "",
    SubCategory: item.SubCategory || "",
    Location: item.Location || "",
    QtyOnHand: item.QtyOnHand != null ? String(item.QtyOnHand) : "",
    QtyUnit: item.QtyUnit || "",
    TargetQty: item.TargetQty != null ? String(item.TargetQty) : "",
    NeedRestock: item.NeedRestock || false,
    ExpiresOn: item.ExpiresOn ? item.ExpiresOn.split("T")[0] : "",
    DatePurchased: item.DatePurchased ? item.DatePurchased.split("T")[0] : "",
    DateFrozen: item.DateFrozen ? item.DateFrozen.split("T")[0] : "",
    PurchasePrice: item.PurchasePrice != null ? String(item.PurchasePrice) : "",
    Store: item.Store || "",
    UnitCost: item.UnitCost != null ? String(item.UnitCost) : "",
    Notes: item.Notes || "",
    Tags: item.Tags || "",
    Allergens: item.Allergens || "",
    ImageRef: item.ImageRef || "",
    Status: item.Status || "",
    ProductUrl: item.ProductUrl || "",
  });

  // Ref for the first input field to focus when the form opens
  const firstFieldRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const changes = { ...formData };

    // Merge original item with changes, auto-set LastUpdated
    const updatedItem = {
      ...item,
      ...changes,
      LastUpdated: new Date().toISOString(),
    };

    onSave(updatedItem);
  };

  // Handle input changes for controlled components, updating the formData state accordingly
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Focus the first input when the form opens
  useEffect(() => {
    firstFieldRef.current?.focus();
  }, []);
  return (
    <form onSubmit={handleSubmit} aria-label="Edit Inventory Item">
      <fieldset>
        <legend>Basic Details</legend>
        <label htmlFor={`ItemName-${item.id}`}>Item Name:</label>
        <input
          ref={firstFieldRef}
          value={formData.ItemName}
          onChange={handleChange}
          type="text"
          id={`ItemName-${item.id}`} 
          name="ItemName"
          required
        />

        <label htmlFor={`ItemDescripton-${item.id}`}>Item Description:</label>
        <textarea
          value={formData.ItemDescripton}
          onChange={handleChange}
          id={`ItemDescripton-${item.id}`}
          name="ItemDescripton"
        />

        <label htmlFor={`Brand-${item.id}`}>Brand:</label>
        <input
          value={formData.Brand}
          onChange={handleChange}
          type="text"
          id={`Brand-${item.id}`}
          name="Brand"
        />

        <label htmlFor={`PackageSize-${item.id}`}>Package Size:</label>
        <input
          value={formData.PackageSize}
          onChange={handleChange}
          type="text"
          id={`PackageSize-${item.id}`}
          name="PackageSize"
        />

        <label htmlFor={`UPC-${item.id}`}>UPC:</label>
        <input
          value={formData.UPC}
          onChange={handleChange}
          type="text"
          id={`UPC-${item.id}`}
          name="UPC"
        />

        <label htmlFor={`Status-${item.id}`}>Status:</label>
        <input
          value={formData.Status}
          onChange={handleChange}
          type="text"
          id={`Status-${item.id}`}
          name="Status"
        />
      </fieldset>

      <fieldset>
        <legend>Classification & Storage</legend>
        <label htmlFor={`Category-${item.id}`}>Category:</label>
        <input
          value={formData.Category}
          onChange={handleChange}
          type="text"
          id={`Category-${item.id}`}
          name="Category"
        />

        <label htmlFor={`SubCategory-${item.id}`}>Sub Category:</label>
        <input
          value={formData.SubCategory}
          onChange={handleChange}
          type="text"
          id={`SubCategory-${item.id}`}
          name="SubCategory"
        />

        <label htmlFor={`Location-${item.id}`}>Location:</label>
        <select
          defaultValue={formData.Location}
          onChange={handleChange}
          id={`Location-${item.id}`}
          name="Location"
          required
        >
          <option value="" disabled>
            Select Location
          </option>
          <option value="Fridge">Fridge</option>
          <option value="Freezer">Freezer</option>
          <option value="Pantry">Pantry</option>
        </select>

        <label htmlFor={`Tags-${item.id}`}>Tags:</label>
        <input
          value={formData.Tags}
          onChange={handleChange}
          type="text"
          id={`Tags-${item.id}`}
          name="Tags"
        />

        <label htmlFor={`Allergens-${item.id}`}>Allergens:</label>
        <input
          value={formData.Allergens}
          onChange={handleChange}
          type="text"
          id={`Allergens-${item.id}`}
          name="Allergens"
        />
      </fieldset>

      <fieldset>
        <legend>Quantities</legend>
        <label htmlFor={`QtyOnHand-${item.id}`}>Quantity on Hand:</label>
        <input
          value={formData.QtyOnHand}
          onChange={handleChange}
          type="number"
          id={`QtyOnHand-${item.id}`}
          name="QtyOnHand"
          min="0"
          step="any"
          required
        />

        <label htmlFor={`QtyUnit-${item.id}`}>Unit:</label>
        <input
          value={formData.QtyUnit}
          onChange={handleChange}
          type="text"
          id={`QtyUnit-${item.id}`}
          name="QtyUnit"
        />

        <label htmlFor={`TargetQty-${item.id}`}>Target Qty:</label>
        <input
          value={formData.TargetQty}
          onChange={handleChange}
          type="number"
          id={`TargetQty-${item.id}`}
          name="TargetQty"
          min="0"
        />

        <label htmlFor={`NeedRestock-${item.id}`}>Need Restock:</label>
        <input
          type="checkbox"
          id={`NeedRestock-${item.id}`}
          name="NeedRestock"
          checked={formData.NeedRestock}
          onChange={handleChange}
        />
      </fieldset>

      <fieldset>
        <legend>Dates</legend>
        <label htmlFor={`ExpiresOn-${item.id}`}>Expires On:</label>
        <input
          value={formData.ExpiresOn}
          onChange={handleChange}
          type="date"
          id={`ExpiresOn-${item.id}`}
          name="ExpiresOn"
        />

        <label htmlFor={`DatePurchased-${item.id}`}>Date Purchased:</label>
        <input
          value={formData.DatePurchased}
          onChange={handleChange}
          type="date"
          id={`DatePurchased-${item.id}`}
          name="DatePurchased"
        />

        <label htmlFor={`DateFrozen-${item.id}`}>Date Frozen:</label>
        <input
          value={formData.DateFrozen}
          onChange={handleChange}
          type="date"
          id={`DateFrozen-${item.id}`}
          name="DateFrozen"
        />
      </fieldset>

      <fieldset>
        <legend>Pricing & Purchase</legend>
        <label htmlFor={`PurchasePrice-${item.id}`}>Purchase Price:</label>
        <input
          value={formData.PurchasePrice}
          onChange={handleChange}
          type="number"
          id={`PurchasePrice-${item.id}`}
          name="PurchasePrice"
          min="0"
          step="0.01"
        />

        <label htmlFor={`UnitCost-${item.id}`}>Unit Cost:</label>
        <input
          value={formData.UnitCost}
          onChange={handleChange}
          type="number"
          id={`UnitCost-${item.id}`}
          name="UnitCost"
          min="0"
          step="0.01"
        />

        <label htmlFor={`Store-${item.id}`}>Store:</label>
        <input
          value={formData.Store}
          onChange={handleChange}
          type="text"
          id={`Store-${item.id}`}
          name="Store"
        />
      </fieldset>

      <fieldset>
        <legend>References & Notes</legend>
        <label htmlFor={`ProductUrl-${item.id}`}>Product URL:</label>
        <input
          value={formData.ProductUrl}
          onChange={handleChange}
          type="url"
          id={`ProductUrl-${item.id}`}
          name="ProductUrl"
        />

        <label htmlFor={`ImageRef-${item.id}`}>Image Reference:</label>
        <input
          value={formData.ImageRef}
          onChange={handleChange}
          type="text"
          id={`ImageRef-${item.id}`}
          name="ImageRef"
        />

        <label htmlFor={`Notes-${item.id}`}>Notes:</label>
        <textarea
          value={formData.Notes}
          onChange={handleChange}
          id={`Notes-${item.id}`} 

          name="Notes"
        />
      </fieldset>
      <button type="submit">Save</button>
      <button type="button" onClick={onCancel}>Cancel</button>
    </form>
  );
}

export default EditInventoryItemForm;
