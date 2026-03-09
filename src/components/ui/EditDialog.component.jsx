import { memo, useEffect, useId, useRef } from "react";
import EditInventoryItemForm from "../forms/EditInventoryItemForm.component";

function EditDialog({ item, onSave, onCancel }) {
  const dialogRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const handleClose = () => {
    dialogRef.current?.close();
    onCancel();
  };

  const handleClick = (e) => {
    if (e.target === dialogRef.current) {
      handleClose();
    }
  };

  const handleSave = (updatedItem) => {
    dialogRef.current?.close();
    onSave(updatedItem);
  };

  return (
    <dialog
      ref={dialogRef}
      onClick={handleClick}
      onCancel={(e) => {
        e.preventDefault();
        handleClose();
      }}
      aria-labelledby={titleId}
    >
      <h2 id={titleId}>Edit: {item.ItemName}</h2>
      <EditInventoryItemForm
        item={item}
        onSave={handleSave}
        onCancel={handleClose}
      />
    </dialog>
  );
}

export default memo(EditDialog);
