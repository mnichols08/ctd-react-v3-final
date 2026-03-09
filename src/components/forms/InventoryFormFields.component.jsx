import { LOCATIONS } from "../../data/fieldConfig";

function id(name, suffix) {
  return suffix ? `${name}-${suffix}` : name;
}

export default function InventoryFormFields({
  formData,
  handleChange,
  firstFieldRef,
  idSuffix = "",
  showNeedRestock = false,
}) {
  return (
    <>
      <fieldset>
        <legend>Basic Details</legend>
        <label htmlFor={id("ItemName", idSuffix)}>Item Name:</label>
        <input
          ref={firstFieldRef}
          value={formData.ItemName}
          onChange={handleChange}
          type="text"
          id={id("ItemName", idSuffix)}
          name="ItemName"
          required
        />

        <label htmlFor={id("ItemDescription", idSuffix)}>
          Item Description:
        </label>
        <textarea
          value={formData.ItemDescription}
          onChange={handleChange}
          id={id("ItemDescription", idSuffix)}
          name="ItemDescription"
        />

        <label htmlFor={id("Brand", idSuffix)}>Brand:</label>
        <input
          value={formData.Brand}
          onChange={handleChange}
          type="text"
          id={id("Brand", idSuffix)}
          name="Brand"
        />

        <label htmlFor={id("PackageSize", idSuffix)}>Package Size:</label>
        <input
          value={formData.PackageSize}
          onChange={handleChange}
          type="text"
          id={id("PackageSize", idSuffix)}
          name="PackageSize"
        />

        <label htmlFor={id("UPC", idSuffix)}>UPC:</label>
        <input
          value={formData.UPC}
          onChange={handleChange}
          type="text"
          id={id("UPC", idSuffix)}
          name="UPC"
        />

      </fieldset>

      <fieldset>
        <legend>Classification & Storage</legend>
        <label htmlFor={id("Category", idSuffix)}>Category:</label>
        <input
          value={formData.Category}
          onChange={handleChange}
          type="text"
          id={id("Category", idSuffix)}
          name="Category"
        />

        <label htmlFor={id("SubCategory", idSuffix)}>Sub Category:</label>
        <input
          value={formData.SubCategory}
          onChange={handleChange}
          type="text"
          id={id("SubCategory", idSuffix)}
          name="SubCategory"
        />

        <label htmlFor={id("Location", idSuffix)}>Location:</label>
        <select
          value={formData.Location}
          onChange={handleChange}
          id={id("Location", idSuffix)}
          name="Location"
          required
        >
          <option value="">Select location</option>
          {LOCATIONS.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>

        <label htmlFor={id("Tags", idSuffix)}>Tags:</label>
        <input
          value={formData.Tags}
          onChange={handleChange}
          type="text"
          id={id("Tags", idSuffix)}
          name="Tags"
        />

        <label htmlFor={id("Allergens", idSuffix)}>Allergens:</label>
        <input
          value={formData.Allergens}
          onChange={handleChange}
          type="text"
          id={id("Allergens", idSuffix)}
          name="Allergens"
        />
      </fieldset>

      <fieldset>
        <legend>Quantities</legend>
        <label htmlFor={id("QtyOnHand", idSuffix)}>Quantity on Hand:</label>
        <input
          value={formData.QtyOnHand}
          onChange={handleChange}
          type="number"
          id={id("QtyOnHand", idSuffix)}
          name="QtyOnHand"
          min="0"
          step="any"
          required
        />

        <label htmlFor={id("QtyUnit", idSuffix)}>Unit:</label>
        <input
          value={formData.QtyUnit}
          onChange={handleChange}
          type="text"
          id={id("QtyUnit", idSuffix)}
          name="QtyUnit"
        />

        <label htmlFor={id("TargetQty", idSuffix)}>Target Qty:</label>
        <input
          value={formData.TargetQty}
          onChange={handleChange}
          type="number"
          id={id("TargetQty", idSuffix)}
          name="TargetQty"
          min="0"
          step="any"
        />

        {showNeedRestock && (
          <>
            <label htmlFor={id("NeedRestock", idSuffix)}>Need Restock:</label>
            <input
              checked={formData.NeedRestock}
              onChange={handleChange}
              type="checkbox"
              id={id("NeedRestock", idSuffix)}
              name="NeedRestock"
            />
          </>
        )}
      </fieldset>

      <fieldset>
        <legend>Dates</legend>
        <label htmlFor={id("ExpiresOn", idSuffix)}>Expires On:</label>
        <input
          value={formData.ExpiresOn}
          onChange={handleChange}
          type="date"
          id={id("ExpiresOn", idSuffix)}
          name="ExpiresOn"
        />

        <label htmlFor={id("DatePurchased", idSuffix)}>Date Purchased:</label>
        <input
          value={formData.DatePurchased}
          onChange={handleChange}
          type="date"
          id={id("DatePurchased", idSuffix)}
          name="DatePurchased"
        />

        <label htmlFor={id("DateFrozen", idSuffix)}>Date Frozen:</label>
        <input
          value={formData.DateFrozen}
          onChange={handleChange}
          type="date"
          id={id("DateFrozen", idSuffix)}
          name="DateFrozen"
        />
      </fieldset>

      <fieldset>
        <legend>Pricing & Purchase</legend>
        <label htmlFor={id("PurchasePrice", idSuffix)}>Purchase Price:</label>
        <input
          value={formData.PurchasePrice}
          onChange={handleChange}
          type="number"
          id={id("PurchasePrice", idSuffix)}
          name="PurchasePrice"
          min="0"
          step="0.01"
        />

        <label htmlFor={id("UnitCost", idSuffix)}>Unit Cost:</label>
        <input
          value={formData.UnitCost}
          onChange={handleChange}
          type="number"
          id={id("UnitCost", idSuffix)}
          name="UnitCost"
          min="0"
          step="0.01"
        />

        <label htmlFor={id("Store", idSuffix)}>Store:</label>
        <input
          value={formData.Store}
          onChange={handleChange}
          type="text"
          id={id("Store", idSuffix)}
          name="Store"
        />
      </fieldset>

      <fieldset>
        <legend>References & Notes</legend>
        <label htmlFor={id("ProductUrl", idSuffix)}>Product URL:</label>
        <input
          value={formData.ProductUrl}
          onChange={handleChange}
          type="url"
          id={id("ProductUrl", idSuffix)}
          name="ProductUrl"
        />

        <label htmlFor={id("ImageRef", idSuffix)}>Image Reference:</label>
        <input
          value={formData.ImageRef}
          onChange={handleChange}
          type="text"
          id={id("ImageRef", idSuffix)}
          name="ImageRef"
        />

        <label htmlFor={id("Notes", idSuffix)}>Notes:</label>
        <textarea
          value={formData.Notes}
          onChange={handleChange}
          id={id("Notes", idSuffix)}
          name="Notes"
        />
      </fieldset>
    </>
  );
}
