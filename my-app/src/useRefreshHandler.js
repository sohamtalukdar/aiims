import { useEffect } from "react";

const useRefreshHandler = ({
  showInitialPopup,
  setShowRefreshWarning,
}) => {
  useEffect(() => {
    const clearDataOnRefresh = () => {
      sessionStorage.clear();
    };

    window.addEventListener("beforeunload", clearDataOnRefresh);

    return () => {
      window.removeEventListener("beforeunload", clearDataOnRefresh);
    };
  }, []);

  useEffect(() => {
    const blockRefresh = (e) => {
      if (!showInitialPopup) {
        e.preventDefault();
        e.stopPropagation();
        e.returnValue = "";
      }
    };

    const blockKeyboardRefresh = (e) => {
      if (!showInitialPopup) {
        if (
          (e.metaKey && e.key === "r") || // Cmd + R (macOS)
          (e.ctrlKey && e.key === "r") || // Ctrl + R (Windows/Linux)
          e.key === "F5" // F5 (all platforms)
        ) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    };

    const blockContextMenu = (e) => {
      if (!showInitialPopup) {
        e.preventDefault();
      }
    };

    window.addEventListener("beforeunload", blockRefresh);
    window.addEventListener("keydown", blockKeyboardRefresh);
    window.addEventListener("contextmenu", blockContextMenu);

    return () => {
      window.removeEventListener("beforeunload", blockRefresh);
      window.removeEventListener("keydown", blockKeyboardRefresh);
      window.removeEventListener("contextmenu", blockContextMenu);
    };
  }, [showInitialPopup]);

  const handleRefreshConfirm = () => {
    setShowRefreshWarning(false);
    window.location.reload(); // Perform manual refresh
  };

  const handleRefreshCancel = () => {
    setShowRefreshWarning(false);
  };

  return { handleRefreshConfirm, handleRefreshCancel };
};

export default useRefreshHandler;
