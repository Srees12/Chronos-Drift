import { ControlsPanel } from "@/components/ControlsPanel";
import { MapView } from "@/components/MapView";
import { VoiceAssistant } from "@/components/VoiceAssistant";
import { ChatWidget } from "@/components/ChatWidget";

export default function Home() {
  return (
    <div className="min-h-screen p-6 md:p-10 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold">ChronosFlex — Meteor Madness Simulator</h1>
        <VoiceAssistant />
      </header>
      <main className="grid md:grid-cols-[380px_1fr] gap-6">
        <ControlsPanel />
        <MapView />
      </main>
      <ChatWidget />
    </div>
  );
}
