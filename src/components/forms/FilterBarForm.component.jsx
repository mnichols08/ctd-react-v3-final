import { memo, useEffect, useMemo, useRef, useState } from "react";
import {
  useInventoryData,
  useInventoryActions,
} from "../../context/InventoryContext";
import {
  FilterBarContainer,
  FilterForm,
  FilterLabel,
  FilterInput,
  FilterSelect,
  FilterButton,
  FilterFieldset,
  FilterLegend,
} from "./FilterBarForm.styles";

function FilterBarForm() {
  const { items, sortConfig, searchTerm, filters } = useInventoryData();
  const { setSearch, setSort, setFilters, clearFilters, refetch } =
    useInventoryActions();
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
    // Reset to ascending when changing sort field; direction is controlled by its own dropdown
    setSort(value, "asc");
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
    setLocalSearch("");
    setSearch("");
    setSort("", "asc");
    clearFilters();
  };

  return (
    <FilterBarContainer>
      <FilterForm onSubmit={(e) => e.preventDefault()}>
        <FilterLabel htmlFor="search">
          Search:
          <FilterInput
            value={localSearch}
            onChange={handleSearchChange}
            type="text"
            id="search"
            name="search"
            placeholder="Search inventory..."
          />
        </FilterLabel>
        <FilterLabel htmlFor="sort-field">
          Sort by:
          <FilterSelect
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
          </FilterSelect>
        </FilterLabel>
        <FilterLabel htmlFor="sort-direction">
          Sort Direction:
          <FilterSelect
            id="sort-direction"
            name="sort-direction"
            value={sortDirection}
            onChange={(e) => setSort(sortField, e.target.value)}
          >
            <option value="asc">Asc</option>
            <option value="desc">Desc</option>
          </FilterSelect>
        </FilterLabel>
        <FilterButton
          type="button"
          onClick={handleReset}
          aria-label="Reset filters"
        >
          Reset
        </FilterButton>
        {/* Filter Controls */}
        <FilterFieldset>
          <FilterLegend>Filter by Category:</FilterLegend>
          {availableCategories.map((cat) => (
            <FilterLabel key={cat}>
              <FilterInput
                type="checkbox"
                checked={filters.categories.includes(cat)}
                onChange={() => handleCategoryToggle(cat)}
              />
              {cat}
            </FilterLabel>
          ))}
        </FilterFieldset>
        <FilterLabel htmlFor="filter-expiring-soon">
          <FilterInput
            type="checkbox"
            id="filter-expiring-soon"
            name="filter-expiring-soon"
            checked={filters.expiringSoon}
            onChange={(e) =>
              setFilters({ ...filters, expiringSoon: e.target.checked })
            }
          />
          Expiring Soon
        </FilterLabel>
        <FilterLabel htmlFor="filter-low-stock">
          <FilterInput
            type="checkbox"
            id="filter-low-stock"
            name="filter-low-stock"
            checked={filters.lowStock}
            onChange={(e) =>
              setFilters({ ...filters, lowStock: e.target.checked })
            }
          />
          Low Stock
        </FilterLabel>
        <FilterButton
          type="button"
          onClick={clearFilters}
          aria-label="Clear all filters"
        >
          Clear All Filters
        </FilterButton>
        <FilterButton
          type="button"
          onClick={refetch}
          aria-label="Refresh results"
        >
          Refresh
        </FilterButton>
      </FilterForm>
    </FilterBarContainer>
  );
}

export default memo(FilterBarForm);
