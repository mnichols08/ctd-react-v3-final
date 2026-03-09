import { memo, useEffect, useMemo, useRef, useState } from "react";
import { useInventoryContext } from "../../context/InventoryContext";

function FilterBarForm() {
  const inventory = useInventoryContext();
  const {
    items,
    setSearch,
    setSort,
    setFilters,
    clearFilters,
    sortConfig,
    searchTerm,
    filters,
    refetch,
  } = inventory;
  const { field: sortField, direction: sortDirection } = sortConfig;
  const [localSearch, setLocalSearch] = useState(searchTerm);
  const debounceTimer = useRef(null);
  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => clearTimeout(debounceTimer.current);
  }, []);

  // Sync local input when external searchTerm changes (e.g. reset)
  useEffect(() => {
    setLocalSearch(searchTerm);
  }, [searchTerm]);

  // Derive available categories from inventory items
  const availableCategories = useMemo(
    () =>
      [...new Set(items.map((item) => item.Category).filter(Boolean))].sort(),
    [items],
  );

  const handleSortChange = (e) => {
    const value = e.target.value;
    // Toggle sort direction if the same field is selected again
    if (value === sortField) {
      setSort(value, sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSort(value, "asc"); // Reset to ascending when changing sort field
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearch(value);
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setSearch(value);
    }, 300);
  };

  const handleCategoryToggle = (category) => {
    const updated = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];
    setFilters({ ...filters, categories: updated });
  };

  const handleReset = () => {
    clearTimeout(debounceTimer.current);
    setSort("", "asc");
    clearFilters();
  };

  return (
    <>
      <form onSubmit={(e) => e.preventDefault()}>
        <label htmlFor="search">Search:</label>
        <input
          value={localSearch}
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
          onChange={(e) => setSort(sortField, e.target.value)}
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
              setFilters({ ...filters, expiringSoon: e.target.checked })
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
            onChange={(e) =>
              setFilters({ ...filters, lowStock: e.target.checked })
            }
          />
          Low Stock
        </label>
        <button type="button" onClick={clearFilters}>
          Clear All Filters
        </button>
        <button type="button" onClick={refetch}>
          Refresh
        </button>
      </form>
    </>
  );
}

export default memo(FilterBarForm);
