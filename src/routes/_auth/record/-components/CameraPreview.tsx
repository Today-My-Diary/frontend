import { useEffect, useRef } from "react";

interface CameraPreviewProps {
  stream: MediaStream | null;
  ref: React.Ref<HTMLVideoElement>;
}

export function CameraPreview({ stream, ref }: CameraPreviewProps) {
  const internalRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const videoElement = internalRef.current;
    if (videoElement && stream) {
      videoElement.srcObject = stream;
    }

    return () => {
      if (videoElement) {
        videoElement.srcObject = null;
      }
    };
  }, [stream]);

  return (
    <video
      ref={(el) => {
        internalRef.current = el;

        if (ref) {
          if (typeof ref === "function") {
            ref(el);
          } else {
            ref.current = el;
          }
        }
      }}
      autoPlay
      playsInline
      muted
      className="w-full h-full object-cover scale-x-[-1]"
    />
  );
}
