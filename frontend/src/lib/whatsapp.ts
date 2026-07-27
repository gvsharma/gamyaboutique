import { CONTACT } from "@/constants/site";

export function whatsAppUrl(message: string): string {
  const phone = CONTACT.phone.replace(/\D/g, "");
  return `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;
}

export function whatsAppInterestMessage(productName: string, customerName?: string | null): string {
  const greeting = customerName?.trim() ? `Hi ${customerName.trim()},` : "Hi,";
  return `${greeting} following up on your interest in ${productName} at Gamya Couture.`;
}
