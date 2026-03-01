import { useRef, useEffect } from "react";

function EditInventoryItemForm({ item, onSave, onCancel }) {
  const firstFieldRef = useRef(null);

  // Focus the first input when the form opens
  useEffect(() => {
    firstFieldRef.current?.focus();
  }, []);

  // Helper: convert null/undefined to empty string for controlled-like defaultValue
  const safe = (value) => (value == null ? "" : value);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const changes = Object.fromEntries(formData.entries());

    // Coerce numeric fields from strings to numbers (or null for empty)
    const numericFields = ["QtyOnHand", "TargetQty", "PurchasePrice"];
    numericFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(changes, field)) {
        const value = changes[field];
        changes[field] = value === "" ? null : Number(value);
      }
    });

    // Convert empty strings back to null for optional text fields
    Object.keys(changes).forEach((key) => {
      if (changes[key] === "" && !["ItemName"].includes(key)) {
        changes[key] = null;
      }
    });

    // Merge original item with changes, auto-set LastUpdated
    const updatedItem = {
      ...item,
      ...changes,
      LastUpdated: new Date().toISOString(),
    };

    onSave(updatedItem);
  };

  return (
    <form onSubmit={handleSubmit} aria-label="Edit Inventory Item">
      <h3>Edit Item</h3>

      <fieldset>
        <legend>Basic Details</legend>

        <label htmlFor={`edit-ItemName-${item.id}`}>Item Name:</label>
        <input
          ref={firstFieldRef}
          type="text"
          id={`edit-ItemName-${item.id}`}
          name="ItemName"
          defaultValue={safe(item.ItemName)}
          required
        />

        <label htmlFor={`edit-ItemDescripton-${item.id}`}>
          Item Description:
        </label>
        <textarea
          id={`edit-ItemDescripton-${item.id}`}
          name="ItemDescripton"
          defaultValue={safe(item.ItemDescripton)}
        />

        <label htmlFor={`edit-Brand-${item.id}`}>Brand:</label>
        <input
          type="text"
          id={`edit-Brand-${item.id}`}
          name="Brand"
          defaultValue={safe(item.Brand)}
        />

        <label htmlFor={`edit-PackageSize-${item.id}`}>Package Size:</label>
        <input
          type="text"
          id={`edit-PackageSize-${item.id}`}
          name="PackageSize"
          defaultValue={safe(item.PackageSize)}
        />

        <label htmlFor={`edit-UPC-${item.id}`}>UPC:</label>
        <input
          type="text"
          id={`edit-UPC-${item.id}`}
          name="UPC"
          defaultValue={safe(item.UPC)}
        />
      </fieldset>

      <fieldset>
        <legend>Classification & Storage</legend>

        <label htmlFor={`edit-Category-${item.id}`}>Category:</label>
        <input
          type="text"
          id={`edit-Category-${item.id}`}
          name="Category"
          defaultValue={safe(item.Category)}
        />

        <label htmlFor={`edit-SubCategory-${item.id}`}>Sub Category:</label>
        <input
          type="text"
          id={`edit-SubCategory-${item.id}`}
          name="SubCategory"
          defaultValue={safe(item.SubCategory)}
        />

        <label htmlFor={`edit-Location-${item.id}`}>Location:</label>
        <input
          type="text"
          id={`edit-Location-${item.id}`}
          name="Location"
          defaultValue={safe(item.Location)}
          required
        />

        <label htmlFor={`edit-Tags-${item.id}`}>Tags:</label>
        <input
          type="text"
          id={`edit-Tags-${item.id}`}
          name="Tags"
          defaultValue={safe(item.Tags)}
        />

        <label htmlFor={`edit-Allergens-${item.id}`}>Allergens:</label>
        <input
          type="text"
          id={`edit-Allergens-${item.id}`}
          name="Allergens"
          defaultValue={safe(item.Allergens)}
        />
      </fieldset>

      <fieldset>
        <legend>Quantities</legend>

        <label htmlFor={`edit-QtyOnHand-${item.id}`}>Quantity on Hand:</label>
        <input
          type="number"
          id={`edit-QtyOnHand-${item.id}`}
          name="QtyOnHand"
          defaultValue={safe(item.QtyOnHand)}
          min="0"
          step="any"
          required
        />

        <label htmlFor={`edit-QtyUnit-${item.id}`}>Unit:</label>
        <input
          type="text"
          id={`edit-QtyUnit-${item.id}`}
          name="QtyUnit"
          defaultValue={safe(item.QtyUnit)}
        />

        <label htmlFor={`edit-TargetQty-${item.id}`}>Target Qty:</label>
        <input
          type="number"
          id={`edit-TargetQty-${item.id}`}
          name="TargetQty"
          defaultValue={safe(item.TargetQty)}
          min="0"
          step="any"
        />
      </fieldset>

      <fieldset>
        <legend>Dates</legend>

        <label htmlFor={`edit-ExpiresOn-${item.id}`}>Expires On:</label>
        <input
          type="date"
          id={`edit-ExpiresOn-${item.id}`}
          name="ExpiresOn"
          defaultValue={safe(item.ExpiresOn)}
        />

        <label htmlFor={`edit-DatePurchased-${item.id}`}>Date Purchased:</label>
        <input
          type="date"
          id={`edit-DatePurchased-${item.id}`}
          name="DatePurchased"
          defaultValue={safe(item.DatePurchased)}
        />
      </fieldset>

      <fieldset>
        <legend>Pricing & Purchase</legend>

        <label htmlFor={`edit-PurchasePrice-${item.id}`}>Purchase Price:</label>
        <input
          type="number"
          id={`edit-PurchasePrice-${item.id}`}
          name="PurchasePrice"
          defaultValue={safe(item.PurchasePrice)}
          min="0"
          step="0.01"
        />

        <label htmlFor={`edit-Store-${item.id}`}>Store:</label>
        <input
          type="text"
          id={`edit-Store-${item.id}`}
          name="Store"
          defaultValue={safe(item.Store)}
        />
      </fieldset>

      <fieldset>
        <legend>Notes</legend>

        <label htmlFor={`edit-Notes-${item.id}`}>Notes:</label>
        <textarea
          id={`edit-Notes-${item.id}`}
          name="Notes"
          defaultValue={safe(item.Notes)}
        />
      </fieldset>

      <button type="submit">Save</button>
      <button type="button" onClick={onCancel}>
        Cancel
      </button>
    </form>
  );
}

export default EditInventoryItemForm;
