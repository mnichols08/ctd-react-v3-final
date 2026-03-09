import { memo, useEffect, useRef } from "react";
import { useInventoryContext } from "../../context/InventoryContext";
import useFormData from "../../hooks/useFormData";
import { parseLocation, formatLocation } from "../../data/fieldConfig";
import InventoryFormFields from "./InventoryFormFields.component";

function EditInventoryItemForm({ item, onClose }) {
  const { updateItem } = useInventoryContext();
  // Initialize form state with existing item data, converting null/undefined to empty strings for controlled inputs
  const { location: parsedLocation, subLocation: parsedSubLocation } =
    parseLocation(item.Location);
  const { formData, handleChange } = useFormData({
    ItemName: item.ItemName || "",
    ItemDescription: item.ItemDescription || "",
    Brand: item.Brand || "",
    PackageSize: item.PackageSize || "",
    UPC: item.UPC || "",
    Category: item.Category || "",
    SubCategory: item.SubCategory || "",
    Location: parsedLocation,
    SubLocation: parsedSubLocation,
    QtyOnHand: item.QtyOnHand != null ? String(item.QtyOnHand) : "",
    QtyUnit: item.QtyUnit || "",
    TargetQty: item.TargetQty != null ? String(item.TargetQty) : "",
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
    ProductUrl: item.ProductUrl || "",
  });

  // Ref for the first input field to focus when the form opens
  const firstFieldRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    const updatedItem = {
      ...item,
      ...formData,
      Location: formatLocation(formData.Location, formData.SubLocation),
      QtyOnHand:
        formData.QtyOnHand !== "" ? parseFloat(formData.QtyOnHand) : null,
      TargetQty:
        formData.TargetQty !== "" ? parseFloat(formData.TargetQty) : null,
      PurchasePrice:
        formData.PurchasePrice !== ""
          ? parseFloat(formData.PurchasePrice)
          : null,
      UnitCost: formData.UnitCost !== "" ? parseFloat(formData.UnitCost) : null,
      ExpiresOn: formData.ExpiresOn || null,
      DatePurchased: formData.DatePurchased || null,
      DateFrozen: formData.DateFrozen || null,
      LastUpdated: new Date().toISOString(),
    };
    delete updatedItem.SubLocation;

    updateItem(updatedItem);
    onClose();
  };

  // Focus the first input when the form opens
  useEffect(() => {
    firstFieldRef.current?.focus();
  }, []);

  return (
    <form onSubmit={handleSubmit} aria-label="Edit Inventory Item">
      <InventoryFormFields
        formData={formData}
        handleChange={handleChange}
        firstFieldRef={firstFieldRef}
        idSuffix={item.id}
      />
      <button type="submit">Save</button>
      <button type="button" onClick={onClose}>
        Cancel
      </button>
    </form>
  );
}

export default memo(EditInventoryItemForm);
