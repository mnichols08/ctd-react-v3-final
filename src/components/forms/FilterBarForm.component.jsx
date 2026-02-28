function FilterBarForm() {
  const handleSubmit = (e) => e.preventDefault();
  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="search">Search:</label>
      <input
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
      <button type="submit">Apply Filter</button>
    </form>
  );
}

export default FilterBarForm;
