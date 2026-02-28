import { useRef } from "react";

function AddShoppingListItemForm({ itemId, handleAddToShoppingList }) {
  const formRef = useRef(null);
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = {
      itemId,
      quantity: formData.get("quantity"),
    };
    if (typeof handleAddToShoppingList !== "function") {
      return;
    }
    try {
      handleAddToShoppingList(payload);
      formRef.current?.reset();
    } catch (error) {
      console.error("Error adding item to shopping list:", error);
    }
  };
  const shoppingId = `shopping-item-${itemId}`;
  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <h3>Add Item to Shopping List</h3>
      <input type="hidden" name="itemId" value={itemId} />
      <label htmlFor={shoppingId}>Quantity:</label>
      <input type="number" id={shoppingId} name="quantity" min="1" required />
      <button type="submit">Add to Shopping List</button>
    </form>
  );
}

export default AddShoppingListItemForm;
