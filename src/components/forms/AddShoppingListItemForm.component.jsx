function AddShoppingListItemForm({ itemId }) {
  return (
    <form>
      <h3>Add Item to Shopping List</h3>
      <input type="hidden" name="itemId" value={itemId} />
      <label htmlFor="quantity">Quantity:</label>
      <input type="number" id="quantity" name="quantity" min="1" required />
      <button type="submit">Add to Shopping List</button>
    </form>
  );
}

export default AddShoppingListItemForm;
