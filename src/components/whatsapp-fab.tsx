import { MessageCircle } from "lucide-react";

export function WhatsappFab() {
  return (
    <a
      href="https://wa.me/244935105538?text=Olá%20HCB-BANDES%2C%20gostaria%20de%20mais%20informações."
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed bottom-6 right-6 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[oklch(0.62_0.17_150)] text-white shadow-[0_12px_30px_-8px_oklch(0.5_0.15_150/0.55)] hover:scale-105 transition"
    >
      <MessageCircle size={24} />
    </a>
  );
}
