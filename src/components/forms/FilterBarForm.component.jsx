import { memo, useEffect, useMemo, useRef, useState } from "react";
import { getActiveFilterCount } from "../../data/inventoryUtils";

const DEFAULT_FILTERS = {
  categories: [],
  expiringSoon: false,
  lowStock: false,
  needRestock: false,
  status: "",
};

function FilterBarForm({
  onSearch = () => {},
  onSort = () => {},
  onFilter = () => {},
  sortField,
  sortDirection,
  filters = DEFAULT_FILTERS,
  inventoryItems = [],
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const debounceTimer = useRef(null);

  // Derive available categories from inventory items
  const availableCategories = useMemo(
    () =>
      [
        ...new Set(inventoryItems.map((item) => item.Category).filter(Boolean)),
      ].sort(),
    [inventoryItems],
  );

  // Count active filters
  const activeFilterCount = getActiveFilterCount(filters);

  const handleSortChange = (e) => {
    const value = e.target.value;
    // Toggle sort direction if the same field is selected again
    if (value === sortField) {
      onSort(value, sortDirection === "asc" ? "desc" : "asc");
    } else {
      onSort(value, "asc"); // Reset to ascending when changing sort field
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryToggle = (category) => {
    const updated = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];
    onFilter({ ...filters, categories: updated });
  };

  const handleClearFilters = () => {
    onFilter(DEFAULT_FILTERS);
  };

  const handleReset = () => {
    setSearchTerm("");
    onSort("", "asc");
    onSearch("");
    onFilter(DEFAULT_FILTERS);
  };
  // Debounce the onSearch callback by 300ms
  useEffect(() => {
    debounceTimer.current = setTimeout(() => {
      onSearch(searchTerm);
    }, 300);

    return () => clearTimeout(debounceTimer.current);
  }, [searchTerm, onSearch]);

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <label htmlFor="search">Search:</label>
      <input
        value={searchTerm}
        onChange={handleSearchChange}
        type="text"
        id="search"
        name="search"
        placeholder="Search inventory..."
      />
      <label htmlFor="sort-field">Sort by:</label>
      <select
        id="sort-field"
        name="sort-field"
        value={sortField}
        onChange={handleSortChange}
      >
        <option value="">None</option>
        <option value="ItemName">Item Name</option>
        <option value="Category">Category</option>
        <option value="QtyOnHand">Qty on Hand</option>
        <option value="ExpiresOn">Expires On</option>
        <option value="LastUpdated">Last Updated</option>
      </select>
      <label htmlFor="sort-direction">Sort Direction:</label>
      <select
        id="sort-direction"
        name="sort-direction"
        value={sortDirection}
        onChange={(e) => onSort(sortField, e.target.value)}
      >
        <option value="asc">Asc</option>
        <option value="desc">Desc</option>
      </select>
      <button type="button" onClick={handleReset}>
        Reset
      </button>
      {/* Filter Controls */}
      <fieldset>
        <legend>Filter by Category:</legend>
        {availableCategories.map((cat) => (
          <label key={cat}>
            <input
              type="checkbox"
              checked={filters.categories.includes(cat)}
              onChange={() => handleCategoryToggle(cat)}
            />
            {cat}
          </label>
        ))}
      </fieldset>

      <label htmlFor="filter-expiring-soon">
        <input
          type="checkbox"
          id="filter-expiring-soon"
          name="filter-expiring-soon"
          checked={filters.expiringSoon}
          onChange={(e) =>
            onFilter({ ...filters, expiringSoon: e.target.checked })
          }
        />
        Expiring Soon
      </label>

      <label htmlFor="filter-low-stock">
        <input
          type="checkbox"
          id="filter-low-stock"
          name="filter-low-stock"
          checked={filters.lowStock}
          onChange={(e) => onFilter({ ...filters, lowStock: e.target.checked })}
        />
        Low Stock
      </label>
      <button type="button" onClick={handleClearFilters}>
        Clear All Filters
      </button>
    </form>
  );
}

export default memo(FilterBarForm);
