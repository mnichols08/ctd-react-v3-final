export const ALL_FIELDS = [
  { key: "ItemName", label: "Item Name", alwaysVisible: true },
  { key: "ItemDescription", label: "Description" },
  { key: "Brand", label: "Brand" },
  { key: "PackageSize", label: "Package Size" },
  { key: "UPC", label: "UPC" },
  { key: "Category", label: "Category" },
  { key: "SubCategory", label: "Sub-Category" },
  { key: "Location", label: "Location" },
  { key: "QtyOnHand", label: "Qty on Hand" },
  { key: "QtyUnit", label: "Qty Unit" },
  { key: "TargetQty", label: "Target Qty" },
  { key: "NeedRestock", label: "Needs Restock" },
  { key: "ExpiresOn", label: "Expires On" },
  { key: "DatePurchased", label: "Date Purchased" },
  { key: "DateFrozen", label: "Date Frozen" },
  { key: "PurchasePrice", label: "Purchase Price" },
  { key: "Store", label: "Store" },
  { key: "UnitCost", label: "Unit Cost" },
  { key: "Notes", label: "Notes" },
  { key: "Tags", label: "Tags" },
  { key: "Allergens", label: "Allergens" },
  { key: "ImageRef", label: "Image Ref" },
  { key: "Status", label: "Status" },
  { key: "ProductUrl", label: "Product URL" },
  { key: "LastUpdated", label: "Last Updated" },
];

export const SEARCHABLE_FIELDS = [
  "ItemName",
  "Brand",
  "Category",
  "Tags",
  "Notes",
];

export const DEFAULT_VISIBLE_FIELDS = [
  "ItemName",
  "Brand",
  "Category",
  "QtyOnHand",
  "QtyUnit",
  "ExpiresOn",
  "Location",
];

export const CATEGORIES = [
  "Cooking Essentials",
  "Condiments",
  "Dairy",
  "Drinks",
  "Dry",
  "Fresh",
  "Frozen",
  "Meat",
  "Produce",
  "Snacks",
  "Other",
];

export const LOCATIONS = ["Fridge", "Freezer", "Pantry"];
