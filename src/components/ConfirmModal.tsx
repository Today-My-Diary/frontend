import { Button } from "@/components/ui/button";
import { useModalStore } from "@/stores/useModalStore";

export function ConfirmModal() {
  const { isOpen, options, resolve, close } = useModalStore();
  if (!isOpen) return null;

  const handleConfirm = () => {
    resolve?.(true);
    close();
  };

  const handleCancel = () => {
    resolve?.(false);
    close();
  };

  return (
    <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm duration-300">
      <div className="bg-background-white animate-in zoom-in-95 text-secondary mx-4 w-full max-w-xs overflow-hidden rounded-xl px-6 py-5 shadow-lg duration-300">
        <div className="flex flex-col gap-4 pb-4">
          <h3 className="text-lg font-bold">{options.title}</h3>
          <div className="text-md break-keep whitespace-pre-wrap">
            {options.description}
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={handleCancel}>
            {options.cancelText}
          </Button>
          <Button variant="primary" onClick={handleConfirm}>
            {options.confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
