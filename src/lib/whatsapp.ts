export const WHATSAPP_NUMBER = "254746621663";

export function buildWhatsAppLink(summaryLines: string[]): string {
  const text = summaryLines.filter(Boolean).join("\n");
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}
