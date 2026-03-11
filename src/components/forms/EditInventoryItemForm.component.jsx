import { memo, useEffect, useRef } from "react";
import { useInventoryActions } from "../../context/InventoryContext";
import useFormData from "../../hooks/useFormData";
import { parseLocation } from "../../data/fieldConfig";
import { prepareItemForSave } from "../../data/inventoryUtils";
import InventoryFormFields from "./InventoryFormFields.component";
import {
  EditFormContainer,
  EditButton,
  CancelButton,
  ButtonGroup,
} from "./EditInventoryItemForm.styles";

function EditInventoryItemForm({ item, onClose }) {
  const { updateItem } = useInventoryActions();
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedItem = {
      ...item,
      ...prepareItemForSave(formData),
    };

    const success = await updateItem(updatedItem);
    if (success !== false) {
      onClose();
    }
  };

  // Focus the first input when the form opens
  useEffect(() => {
    firstFieldRef.current?.focus();
  }, []);

  return (
    <>
      <EditFormContainer
        onSubmit={handleSubmit}
        aria-label="Edit Inventory Item"
      >
        <InventoryFormFields
          formData={formData}
          handleChange={handleChange}
          firstFieldRef={firstFieldRef}
          idSuffix={item.id}
        />
        <ButtonGroup>
          <EditButton type="submit">Save</EditButton>
          <CancelButton type="button" onClick={onClose}>
            Cancel
          </CancelButton>
        </ButtonGroup>
      </EditFormContainer>
    </>
  );
}

export default memo(EditInventoryItemForm);
