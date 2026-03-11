import { LOCATIONS } from "../../data/fieldConfig";
import {
  StyledFieldset,
  StyledLegend,
  StyledLabel,
  StyledInput,
  StyledTextarea,
  StyledSelect,
} from "./InventoryFormFields.styles";

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
      <StyledFieldset>
        <StyledLegend>Basic Details</StyledLegend>
        <StyledLabel htmlFor={id("ItemName", idSuffix)}>Item Name</StyledLabel>
        <StyledInput
          ref={firstFieldRef}
          value={formData.ItemName}
          onChange={handleChange}
          type="text"
          id={id("ItemName", idSuffix)}
          name="ItemName"
          required
          aria-required="true"
          aria-describedby={id("ItemName-error", idSuffix)}
        />
        {/* Error message region for ItemName */}
        <span
          id={id("ItemName-error", idSuffix)}
          className="visually-hidden"
          aria-live="assertive"
        />

        <StyledLabel htmlFor={id("ItemDescription", idSuffix)}>
          Item Description
        </StyledLabel>
        <StyledTextarea
          value={formData.ItemDescription}
          onChange={handleChange}
          id={id("ItemDescription", idSuffix)}
          name="ItemDescription"
        />

        <StyledLabel htmlFor={id("Brand", idSuffix)}>Brand</StyledLabel>
        <StyledInput
          value={formData.Brand}
          onChange={handleChange}
          type="text"
          id={id("Brand", idSuffix)}
          name="Brand"
        />

        <StyledLabel htmlFor={id("PackageSize", idSuffix)}>
          Package Size
        </StyledLabel>
        <StyledInput
          value={formData.PackageSize}
          onChange={handleChange}
          type="text"
          id={id("PackageSize", idSuffix)}
          name="PackageSize"
        />

        <StyledLabel htmlFor={id("UPC", idSuffix)}>UPC</StyledLabel>
        <StyledInput
          value={formData.UPC}
          onChange={handleChange}
          type="text"
          id={id("UPC", idSuffix)}
          name="UPC"
        />
      </StyledFieldset>

      <StyledFieldset>
        <StyledLegend>Classification & Storage</StyledLegend>
        <StyledLabel htmlFor={id("Category", idSuffix)}>Category</StyledLabel>
        <StyledInput
          value={formData.Category}
          onChange={handleChange}
          type="text"
          id={id("Category", idSuffix)}
          name="Category"
        />

        <StyledLabel htmlFor={id("SubCategory", idSuffix)}>
          Sub Category
        </StyledLabel>
        <StyledInput
          value={formData.SubCategory}
          onChange={handleChange}
          type="text"
          id={id("SubCategory", idSuffix)}
          name="SubCategory"
        />

        <StyledLabel htmlFor={id("Location", idSuffix)}>Location</StyledLabel>
        <StyledSelect
          value={formData.Location}
          onChange={handleChange}
          id={id("Location", idSuffix)}
          name="Location"
          required
          aria-required="true"
          aria-describedby={id("Location-error", idSuffix)}
        >
          <option value="">Select location</option>
          {LOCATIONS.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </StyledSelect>
        {/* Error message region for Location */}
        <span
          id={id("Location-error", idSuffix)}
          className="visually-hidden"
          aria-live="assertive"
        />

        <StyledLabel htmlFor={id("SubLocation", idSuffix)}>
          Sub-Location
        </StyledLabel>
        <StyledInput
          value={formData.SubLocation}
          onChange={handleChange}
          type="text"
          id={id("SubLocation", idSuffix)}
          name="SubLocation"
          placeholder="e.g. Shelf 3, Door, Drawer 2"
        />

        <StyledLabel htmlFor={id("Tags", idSuffix)}>Tags</StyledLabel>
        <StyledInput
          value={formData.Tags}
          onChange={handleChange}
          type="text"
          id={id("Tags", idSuffix)}
          name="Tags"
        />

        <StyledLabel htmlFor={id("Allergens", idSuffix)}>Allergens</StyledLabel>
        <StyledInput
          value={formData.Allergens}
          onChange={handleChange}
          type="text"
          id={id("Allergens", idSuffix)}
          name="Allergens"
        />
      </StyledFieldset>

      <StyledFieldset>
        <StyledLegend>Quantities</StyledLegend>
        <StyledLabel htmlFor={id("QtyOnHand", idSuffix)}>
          Quantity on Hand
        </StyledLabel>
        <StyledInput
          value={formData.QtyOnHand}
          onChange={handleChange}
          type="number"
          id={id("QtyOnHand", idSuffix)}
          name="QtyOnHand"
          min="0"
          step="any"
          required
          aria-required="true"
          aria-describedby={id("QtyOnHand-error", idSuffix)}
        />
        {/* Error message region for QtyOnHand */}
        <span
          id={id("QtyOnHand-error", idSuffix)}
          className="visually-hidden"
          aria-live="assertive"
        />

        <StyledLabel htmlFor={id("QtyUnit", idSuffix)}>Unit</StyledLabel>
        <StyledInput
          value={formData.QtyUnit}
          onChange={handleChange}
          type="text"
          id={id("QtyUnit", idSuffix)}
          name="QtyUnit"
        />

        <StyledLabel htmlFor={id("TargetQty", idSuffix)}>
          Target Qty
        </StyledLabel>
        <StyledInput
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
            <StyledLabel htmlFor={id("NeedRestock", idSuffix)}>
              Need Restock
            </StyledLabel>
            <StyledInput
              checked={formData.NeedRestock}
              onChange={handleChange}
              type="checkbox"
              id={id("NeedRestock", idSuffix)}
              name="NeedRestock"
              aria-required="true"
              aria-describedby={id("NeedRestock-error", idSuffix)}
              style={{ minWidth: 24, minHeight: 24, width: 24, height: 24 }}
            />
            {/* Error message region for NeedRestock */}
            <span
              id={id("NeedRestock-error", idSuffix)}
              className="visually-hidden"
              aria-live="assertive"
            />
          </>
        )}
      </StyledFieldset>

      <StyledFieldset>
        <StyledLegend>Dates</StyledLegend>
        <StyledLabel htmlFor={id("ExpiresOn", idSuffix)}>
          Expires On
        </StyledLabel>
        <StyledInput
          value={formData.ExpiresOn}
          onChange={handleChange}
          type="date"
          id={id("ExpiresOn", idSuffix)}
          name="ExpiresOn"
        />

        <StyledLabel htmlFor={id("DatePurchased", idSuffix)}>
          Date Purchased
        </StyledLabel>
        <StyledInput
          value={formData.DatePurchased}
          onChange={handleChange}
          type="date"
          id={id("DatePurchased", idSuffix)}
          name="DatePurchased"
        />

        <StyledLabel htmlFor={id("DateFrozen", idSuffix)}>
          Date Frozen
        </StyledLabel>
        <StyledInput
          value={formData.DateFrozen}
          onChange={handleChange}
          type="date"
          id={id("DateFrozen", idSuffix)}
          name="DateFrozen"
        />
      </StyledFieldset>

      <StyledFieldset>
        <StyledLegend>Pricing & Purchase</StyledLegend>
        <StyledLabel htmlFor={id("PurchasePrice", idSuffix)}>
          Purchase Price
        </StyledLabel>
        <StyledInput
          value={formData.PurchasePrice}
          onChange={handleChange}
          type="number"
          id={id("PurchasePrice", idSuffix)}
          name="PurchasePrice"
          min="0"
          step="0.01"
        />

        <StyledLabel htmlFor={id("UnitCost", idSuffix)}>Unit Cost</StyledLabel>
        <StyledInput
          value={formData.UnitCost}
          onChange={handleChange}
          type="number"
          id={id("UnitCost", idSuffix)}
          name="UnitCost"
          min="0"
          step="0.01"
        />

        <StyledLabel htmlFor={id("Store", idSuffix)}>Store</StyledLabel>
        <StyledInput
          value={formData.Store}
          onChange={handleChange}
          type="text"
          id={id("Store", idSuffix)}
          name="Store"
        />
      </StyledFieldset>

      <StyledFieldset>
        <StyledLegend>References & Notes</StyledLegend>
        <StyledLabel htmlFor={id("ProductUrl", idSuffix)}>
          Product URL
        </StyledLabel>
        <StyledInput
          value={formData.ProductUrl}
          onChange={handleChange}
          type="url"
          id={id("ProductUrl", idSuffix)}
          name="ProductUrl"
        />

        <StyledLabel htmlFor={id("ImageRef", idSuffix)}>
          Image Reference
        </StyledLabel>
        <StyledInput
          value={formData.ImageRef}
          onChange={handleChange}
          type="text"
          id={id("ImageRef", idSuffix)}
          name="ImageRef"
        />

        <StyledLabel htmlFor={id("Notes", idSuffix)}>Notes</StyledLabel>
        <StyledTextarea
          value={formData.Notes}
          onChange={handleChange}
          id={id("Notes", idSuffix)}
          name="Notes"
        />
      </StyledFieldset>
    </>
  );
}
