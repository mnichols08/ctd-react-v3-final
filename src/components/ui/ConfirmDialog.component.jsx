import { memo, useEffect, useId, useRef } from "react";

function ConfirmDialog({ message, onConfirm, onCancel, triggerRef }) {
  const dialogRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    dialogRef.current?.showModal();
    // Focus first button in dialog
    const firstButton = dialogRef.current?.querySelector("button");
    firstButton?.focus();
    return () => {
      // Return focus to trigger
      if (triggerRef && triggerRef.current) {
        triggerRef.current.focus();
      }
    };
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
