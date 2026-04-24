import { useRef, useState, useEffect } from 'react';
import { useCameraPermissions } from 'expo-camera';

export function useCamera() {
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission]);

  async function capture() {
    if (!cameraRef.current || isCapturing) return null;
    setIsCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.7,
        exif: false,
      });
      return photo.base64;
    } finally {
      setIsCapturing(false);
    }
  }

  return {
    cameraRef,
    permission,
    requestPermission,
    isCapturing,
    capture,
  };
}
