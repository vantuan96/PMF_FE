import React from "react";

const ConfirmBox = ({
  yes,
  no,
  visible,
  onCancel,
  onConfirm,
  className,
  children
}) => {
  const confirm = () => {
    onCancel();
    onConfirm();
  };
  return (
    <>
      {visible && (
        <div id="react-confirm-alert">
          <div className="react-confirm-alert-overlay undefined">
            <div className="react-confirm-alert">
                <div className="react-confirm-alert-body">
                  <h1>Lỗi</h1>
                  {children}
                  <div className="react-confirm-alert-button-group">
                  <button onClick={() => onCancel()} type="button">
                    {no}
                  </button>
                  <button onClick={confirm} type="button">
                    {yes}
                  </button>
                  </div>
                </div>
            </div>
          </div>
      </div>
      )}
    </>
  );
};

export default ConfirmBox;
