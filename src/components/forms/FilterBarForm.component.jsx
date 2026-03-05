import { useEffect, useRef, useState } from "react";

function FilterBarForm({
  onSearch = () => {},
  onSort = () => {},
  sortField,
  sortDirection,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const debounceTimer = useRef(null);

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

  const handleReset = () => {
    setSearchTerm("");
    onSort("", "asc");
    onSearch("");
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
      <label htmlFor="filter">Filter by:</label>
      <select id="filter" name="filter">
        <option value="all">All Items</option>
        <option value="expiringSoon">Expiring Soon</option>
        <option value="lowStock">Low Stock</option>
        <option value="categories">Categories</option>
      </select>
      <button type="button" onClick={handleReset}>
        Reset
      </button>
    </form>
  );
}

export default FilterBarForm;
