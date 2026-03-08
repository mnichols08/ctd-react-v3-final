import { memo, useEffect, useMemo, useRef } from "react";

const DEFAULT_FILTERS = {
  categories: [],
  expiringSoon: false,
  lowStock: false,
  status: "",
};

function FilterBarForm({
  onSearch = () => {},
  onSort = () => {},
  onFilter = () => {},
  onClearFilters = () => {},
  sortField,
  sortDirection,
  filters = DEFAULT_FILTERS,
  inventoryItems = [],
  handleRefresh = () => {},
}) {
  const searchInputRef = useRef(null);
  const debounceTimer = useRef(null);

  useEffect(() => {
    return () => clearTimeout(debounceTimer.current);
  }, []);

  // Derive available categories from inventory items
  const availableCategories = useMemo(
    () =>
      [
        ...new Set(inventoryItems.map((item) => item.Category).filter(Boolean)),
      ].sort(),
    [inventoryItems],
  );

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
    const value = e.target.value;
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      onSearch(value);
    }, 300);
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
    if (searchInputRef.current) {
      searchInputRef.current.value = "";
    }
    clearTimeout(debounceTimer.current);
    onSort("", "asc");
    onClearFilters();
  };

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <label htmlFor="search">Search:</label>
      <input
        ref={searchInputRef}
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
      <button type="button" onClick={handleRefresh}>
        Refresh
      </button>
    </form>
  );
}

export default memo(FilterBarForm);
