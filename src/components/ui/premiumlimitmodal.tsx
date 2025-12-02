import { Card } from "./card";
import { Button } from "./button";
import { AlertCircleIcon } from "../Icons";

interface PremiumLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPremium?: () => void;
  limit: number;
  entityLabel: string; // "напоминаний" | "целей накопления"
}

export function PremiumLimitModal({
  isOpen,
  onClose,
  onOpenPremium,
  limit,
  entityLabel,
}: PremiumLimitModalProps) {
  if (!isOpen) return null;

  const handlePremiumClick = () => {
    onClose();
    if (onOpenPremium) onOpenPremium();
  };

  return (
    <div
      className="
        fixed inset-0 z-40
        flex items-center justify-center
        bg-black/60 backdrop-blur-sm   /* ← сильнее затемнение + blur */
        px-4
      "
    >
      <Card className="max-w-sm w-full p-4 bg-white rounded-xl shadow-xl">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
            <AlertCircleIcon className="w-6 h-4 text-orange-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold mb-1">Лимит достигнут</h3>
            <p className="text-sm text-gray-600">
              Бесплатно можно создать до {limit} активных {entityLabel}.
              Чтобы добавить больше, оформите подписку{" "}
              <span className="font-semibold">Premium</span>.
            </p>
          </div>
        </div>

        <div className="flex gap-2 mt-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
          >
            Позже
          </Button>

          <Button
            className="flex-1 bg-gray-900 hover:bg-gray-800"
            onClick={handlePremiumClick}
          >
            Открыть Premium
          </Button>
        </div>
      </Card>
    </div>
  );
}
