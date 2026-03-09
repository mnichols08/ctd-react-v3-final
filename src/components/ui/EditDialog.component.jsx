import { memo, useEffect, useId, useRef } from "react";
import EditInventoryItemForm from "../forms/EditInventoryItemForm.component";

function EditDialog({ item, onClose }) {
  const dialogRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    dialogRef.current?.showModal();
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
        onClose={handleClose}
      />
    </dialog>
  );
}

export default memo(EditDialog);
