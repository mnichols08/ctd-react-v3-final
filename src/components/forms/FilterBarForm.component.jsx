import { useEffect, useRef, useState } from "react";

function FilterBarForm({ onSearch = () => {} }) {
  const [searchTerm, setSearchTerm] = useState("");
  const debounceTimer = useRef(null);

  // Debounce the onSearch callback by 300ms
  useEffect(() => {
    debounceTimer.current = setTimeout(() => {
      onSearch(searchTerm);
    }, 300);

    return () => clearTimeout(debounceTimer.current);
  }, [searchTerm, onSearch]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <form onSubmit={e => e.preventDefault()} >
      <label htmlFor="search">Search:</label>
      <input
        value={searchTerm}
        onChange={handleSearchChange}
        type="text"
        id="search"
        name="search"
        placeholder="Search inventory..."
      />
      <label htmlFor="sort">Sort by:</label>
      <select id="sort" name="sort">
        <option value="name">Name</option>
        <option value="expirationDate">Expiration Date</option>
        <option value="purchaseDate">Purchase Date</option>
        <option value="quantity">Quantity</option>
      </select>
      <label htmlFor="filter">Filter by:</label>
      <select id="filter" name="filter">
        <option value="all">All Items</option>
        <option value="expiringSoon">Expiring Soon</option>
        <option value="lowStock">Low Stock</option>
        <option value="categories">Categories</option>
      </select>
    </form>
  );
}

export default FilterBarForm;
