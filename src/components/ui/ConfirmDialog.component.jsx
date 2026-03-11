import { useEffect, useRef, useId, memo } from "react";
import {
  DialogContent,
  DialogMessage,
  DialogButtonGroup,
  DialogButton,
  DialogButtonDanger,
} from "./ConfirmDialog.styles";

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
      <DialogContent>
        <DialogMessage id={titleId}>{message}</DialogMessage>
        <DialogButtonGroup>
          <DialogButton autoFocus onClick={handleClose}>
            Cancel
          </DialogButton>
          <DialogButtonDanger
            onClick={() => {
              dialogRef.current?.close();
              onConfirm();
            }}
          >
            Confirm
          </DialogButtonDanger>
        </DialogButtonGroup>
      </DialogContent>
    </dialog>
  );
}

export default memo(ConfirmDialog);
