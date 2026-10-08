import type { Metadata } from "next";
import Chat from "./Chat";

export const metadata: Metadata = { title: "El chat · Vente", robots: { index: false } };

export default function ChatPage() {
  return <Chat />;
}
