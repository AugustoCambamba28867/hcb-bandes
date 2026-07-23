import { MessageCircle } from "lucide-react";
import { useSiteSettings } from "@/lib/site-settings";
import { buildWhatsAppUrl } from "@/lib/leads-store";

export function WhatsappFab() {
  const settings = useSiteSettings();
  const href = buildWhatsAppUrl(
    "Olá HCB-BANDES, gostaria de receber mais informações sobre a sua solução habitacional.",
    settings.whatsapp,
  );

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed bottom-6 right-6 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[oklch(0.62_0.17_150)] text-white shadow-[0_12px_30px_-8px_oklch(0.5_0.15_150/0.55)] hover:scale-105 transition"
    >
      <MessageCircle size={24} />
    </a>
  );
}

