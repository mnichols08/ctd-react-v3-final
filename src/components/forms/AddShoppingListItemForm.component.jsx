function AddShoppingListItemForm({ itemId, handleAddToShoppingList }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = {
      itemId,
      quantity: formData.get("quantity"),
    };
    handleAddToShoppingList?.(payload);
  };
  const shoppingId = `shopping-item-${itemId}`;
  return (
    <form onSubmit={handleSubmit}>
      <h3>Add Item to Shopping List</h3>
      <input type="hidden" name="itemId" value={itemId} />
      <label htmlFor={shoppingId}>Quantity:</label>
      <input type="number" id={shoppingId} name="quantity" min="1" required />
      <button type="submit">Add to Shopping List</button>
    </form>
  );
}

export default AddShoppingListItemForm;
