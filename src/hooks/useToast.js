import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export const useToast = () => {
  const [toastConfig, setToastConfig] = useState({
    message: '',
    type: 'success',
    duration: 3000
  });

  useEffect(() => {
    if (toastConfig.message) {
      const options = {
        position: "top-center",
        autoClose: toastConfig.duration,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      };

      switch (toastConfig.type) {
        case 'success':
          toast.success(toastConfig.message, options);
          break;
        case 'error':
          toast.error(toastConfig.message, options);
          break;
        case 'warning':
          toast.warning(toastConfig.message, options);
          break;
        case 'info':
          toast.info(toastConfig.message, options);
          break;
        default:
          toast(toastConfig.message, options);
      }

      // Reset toast config after showing
      setToastConfig({ message: '', type: 'success', duration: 3000 });
    }
  }, [toastConfig]);

  const showToast = (message, type = 'success', duration = 3000) => {
    setToastConfig({ message, type, duration });
  };

  return { showToast };
}; 