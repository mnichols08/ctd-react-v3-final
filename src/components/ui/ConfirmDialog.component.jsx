import { memo, useEffect, useId, useRef } from "react";

function ConfirmDialog({ message, onConfirm, onCancel }) {
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
      <p id={titleId}>{message}</p>
      <div>
        <button autoFocus onClick={handleClose}>
          Cancel
        </button>
        <button
          onClick={() => {
            dialogRef.current?.close();
            onConfirm();
          }}
        >
          Confirm
        </button>
      </div>
    </dialog>
  );
}

export default memo(ConfirmDialog);
