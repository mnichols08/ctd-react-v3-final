import { memo, useEffect, useRef } from "react";

function ConfirmDialog({ message, onConfirm, onCancel }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const handleClick = (e) => {
    if (e.target === dialogRef.current) {
      onCancel();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onClick={handleClick}
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
      aria-labelledby="confirm-dialog-title"
    >
      <p id="confirm-dialog-title">{message}</p>
      <div>
        <button autoFocus onClick={onCancel}>
          Cancel
        </button>
        <button onClick={onConfirm}>Confirm</button>
      </div>
    </dialog>
  );
}

export default memo(ConfirmDialog);
