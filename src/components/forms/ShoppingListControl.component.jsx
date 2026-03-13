import { memo, useCallback } from "react";
import { useInventoryActions } from "../../context/InventoryContext";
import {
  ControlContainer,
  Heading,
  StepperGroup,
  StepperButton,
  RemoveButton,
  AddButton,
  RemoveFromListButton,
  QtyText,
  SubText,
} from "./ShoppingListControl.styles";

// Unified shopping-list control for an inventory item.
// Shows an "Add to Shopping List" button when the item isn't on the list,
// and a quantity stepper ([ - ] count [ + ]) when it is.
function ShoppingListControl({ item, variant }) {
  const { addToShoppingList, removeFromShoppingList, updateTargetQty } =
    useInventoryActions();
  const {
    id,
    ItemName: itemName,
    QtyOnHand: qtyOnHand,
    TargetQty: targetQty,
    NeedRestock: needRestock,
  } = item;

  // An item is considered "in the shopping list" if it needs restocking and the target quantity is greater than the quantity on hand.
  const isInShoppingList = needRestock && targetQty > qtyOnHand;

  const handleAdd = useCallback(() => {
    addToShoppingList?.(id, 1);
  }, [addToShoppingList, id]);

  const handleDecrement = useCallback(() => {
    updateTargetQty(id, targetQty - 1);
  }, [updateTargetQty, id, targetQty]);

  const handleIncrement = useCallback(() => {
    updateTargetQty(id, targetQty + 1);
  }, [updateTargetQty, id, targetQty]);

  const isShoppingVariant = variant === "shopping";

  const componentHeading = isShoppingVariant ? (
    <SubText>Qty on Hand: {qtyOnHand}</SubText>
  ) : (
    <Heading>Shopping List Controls</Heading>
  );

  // Case 1: Shopping List section — show stepper
  if (isInShoppingList && isShoppingVariant) {
    const willRemove = targetQty - 1 <= qtyOnHand;
    // Keyboard handler for arrow keys
    const handleStepperKeyDown = (e) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
        e.preventDefault();
        handleDecrement();
      } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
        e.preventDefault();
        handleIncrement();
      }
    };
    return (
      <ControlContainer>
        {componentHeading}
        <StepperGroup>
          <span className="visually-hidden">Qty in Cart:</span>
          {willRemove ? (
            <RemoveButton
              onClick={handleDecrement}
              aria-label={`Remove from ${itemName}`}
              tabIndex={0}
              onKeyDown={handleStepperKeyDown}
            >
              🗑️
            </RemoveButton>
          ) : (
            <StepperButton
              onClick={handleDecrement}
              aria-label={`Decrease quantity for ${itemName}`}
              tabIndex={0}
              onKeyDown={handleStepperKeyDown}
            >
              -
            </StepperButton>
          )}
          <QtyText>{Math.ceil(targetQty - qtyOnHand)}</QtyText>
          <StepperButton
            onClick={handleIncrement}
            aria-label={`Increase quantity for ${itemName}`}
            tabIndex={0}
            onKeyDown={handleStepperKeyDown}
          >
            +
          </StepperButton>
        </StepperGroup>
      </ControlContainer>
    );
  }

  // Case 2: Inventory section — item is on shopping list → show "Remove" button
  if (isInShoppingList) {
    return (
      <ControlContainer>
        {componentHeading}
        <RemoveFromListButton
          onClick={() => removeFromShoppingList(id)}
          aria-label={`Remove ${itemName} from shopping list`}
        >
          Remove from Shopping List
        </RemoveFromListButton>
      </ControlContainer>
    );
  }

  // Case 3: Not on shopping list → show "Add" button
  return (
    <ControlContainer>
      {componentHeading}
      <AddButton onClick={handleAdd}>Add to Shopping List</AddButton>
    </ControlContainer>
  );
}

export default memo(ShoppingListControl);
