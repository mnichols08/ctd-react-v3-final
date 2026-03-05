import { useEffect, useMemo, useRef, useState } from "react";

const DEFAULT_FILTERS = {
  categories: [],
  location: null,
  needRestock: null,
  status: null,
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
  const activeFilterCount =
    (filters.categories.length > 0 ? 1 : 0) +
    (filters.location ? 1 : 0) +
    (filters.needRestock !== null ? 1 : 0) +
    (filters.status ? 1 : 0);

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

      <label htmlFor="filter-location">Location:</label>
      <select
        id="filter-location"
        name="filter-location"
        value={filters.location || ""}
        onChange={(e) =>
          onFilter({ ...filters, location: e.target.value || null })
        }
      >
        <option value="">All</option>
        <option value="Fridge">Fridge</option>
        <option value="Freezer">Freezer</option>
        <option value="Pantry">Pantry</option>
      </select>

      <label htmlFor="filter-restock">Needs Restock:</label>
      <select
        id="filter-restock"
        name="filter-restock"
        value={
          filters.needRestock === null ? "" : filters.needRestock ? "yes" : "no"
        }
        onChange={(e) => {
          const val = e.target.value;
          onFilter({
            ...filters,
            needRestock: val === "" ? null : val === "yes",
          });
        }}
      >
        <option value="">All</option>
        <option value="yes">Yes</option>
        <option value="no">No</option>
      </select>

      <label htmlFor="filter-status">Status:</label>
      <select
        id="filter-status"
        name="filter-status"
        value={filters.status || ""}
        onChange={(e) =>
          onFilter({ ...filters, status: e.target.value || null })
        }
      >
        <option value="">All</option>
        <option value="active">Active</option>
        <option value="archived">Archived</option>
      </select>
      {activeFilterCount > 0 && (
        <span>
          {activeFilterCount} filter{activeFilterCount !== 1 ? "s" : ""} active
        </span>
      )}

      <button type="button" onClick={handleClearFilters}>
        Clear All Filters
      </button>

    </form>
  );
}

export default FilterBarForm;
