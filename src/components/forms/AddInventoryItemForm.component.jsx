import { memo, useRef } from "react";
import useFormData from "../../hooks/useFormData";
import { formatLocation } from "../../data/fieldConfig";
import InventoryFormFields from "./InventoryFormFields.component";

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
  SubLocation: "",
  QtyOnHand: "",
  QtyUnit: "",
  TargetQty: "",
  NeedRestock: false,
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
      Location: formatLocation(formData.Location, formData.SubLocation),
      LastUpdated: new Date().toISOString(),
    };
    delete newItem.SubLocation;
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
      if (newItem[field] === "") newItem[field] = null;
    });
    const success = await addInventoryItem(newItem);
    if (success === false) return;
    resetForm();
    itemNameRef.current?.focus();
  };
  return (
    <form onSubmit={handleSubmit} aria-label="Add Inventory Item">
      <InventoryFormFields
        formData={formData}
        handleChange={handleChange}
        firstFieldRef={itemNameRef}
        showNeedRestock
      />
      <button type="submit">Add Item</button>
    </form>
  );
}

export default memo(AddInventoryItemForm);
