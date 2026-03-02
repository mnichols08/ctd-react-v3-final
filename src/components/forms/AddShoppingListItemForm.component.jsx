import { useState } from "react";

function AddShoppingListItemForm({ itemId, handleAddToShoppingList }) {
  // Manage quantity as local state to allow resetting after submit
  const [quantity, setQuantity] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      itemId,
      quantity
    };
    // Guard against missing callback prop to prevent runtime errors
    if (typeof handleAddToShoppingList !== "function") {
      return;
    }
    try {
      handleAddToShoppingList(payload);
      setQuantity("");  // Reset quantity after successful submission
    } catch (error) {
      console.error("Error adding item to shopping list:", error);
    }
  };
  // Use a unique ID for the quantity input to associate it with the label
  const shoppingId = `shopping-item-${itemId}`;
  return (
    <form onSubmit={handleSubmit}>
      <h3>Add Item to Shopping List</h3>
      <input type="hidden" name="itemId" value={itemId} />
      <label htmlFor={shoppingId}>Quantity:</label>
      <input
        type="number"
        id={shoppingId}
        name="quantity"
        min="1"
        required
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
      />
      <button type="submit">Add to Shopping List</button>
    </form>
  );
}

export default AddShoppingListItemForm;
