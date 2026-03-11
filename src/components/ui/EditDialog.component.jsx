import { memo, useEffect, useId, useRef } from "react";
import EditInventoryItemForm from "../forms/EditInventoryItemForm.component";

const styles = {
  h2: { margin: ".5rem", fontSize: "1.5em" },
};
function EditDialog({ item, onClose, triggerRef }) {
  const dialogRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    dialogRef.current?.showModal();
    // Focus first input in form
    const firstInput = dialogRef.current?.querySelector(
      "input, textarea, select, button",
    );
    firstInput?.focus();
    return () => {
      // Return focus to trigger
      if (triggerRef && triggerRef.current) {
        triggerRef.current.focus();
      }
    };
  }, []);

  const handleClose = () => {
    dialogRef.current?.close();
    onClose();
  };

  const handleClick = (e) => {
    if (e.target === dialogRef.current) {
      handleClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      handleClose();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onCancel={(e) => {
        e.preventDefault();
        handleClose();
      }}
      aria-labelledby={titleId}
    >
      <h2 id={titleId} style={styles.h2}>
        Edit: {item.ItemName}
      </h2>
      <EditInventoryItemForm item={item} onClose={handleClose} />
    </dialog>
  );
}

export default memo(EditDialog);
