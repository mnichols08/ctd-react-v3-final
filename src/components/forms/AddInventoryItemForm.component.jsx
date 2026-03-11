import { memo, useRef } from "react";
import { useInventoryActions } from "../../context/InventoryContext";
import useFormData from "../../hooks/useFormData";
import { prepareItemForSave } from "../../data/inventoryUtils";
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

function AddInventoryItemForm() {
  const { addItem } = useInventoryActions();
  // Form state to manage controlled inputs
  const { formData, handleChange, resetForm } = useFormData(initialFormState);
  const itemNameRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newItem = {
      id: crypto.randomUUID(),
      ...prepareItemForSave(formData),
    };
    const success = await addItem(newItem);
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
