import { useEffect, useState } from "react";
import { DesktopIcon } from "./components/DesktopIcon";
import { Taskbar } from "./components/Taskbar";
import { Window } from "./components/Window";
import { desktopApps } from "./config/desktopApps";
import { WindowsProvider, useWindows } from "./store/windows";
import "./App.css";

const portfolioWindow = {
  id: "portfolio",
  title: "My Portfolio",
  x: 64,
  y: 64,
  width: 480,
  height: 320,
};

function Desktop() {
  const { windows, openWindow } = useWindows();

  useEffect(() => {
    openWindow(portfolioWindow);
  }, [openWindow]);

  const [selectedWindowId, setSelectedWindowId] = useState<string | null>(null);

  return (
    <main className="desktop" aria-label="Desktop">
      <section className="desktopIcons" aria-label="Desktop applications">
        {desktopApps.map((app) => (
          <DesktopIcon
            key={app.id}
            label={app.label}
            icon={app.icon}
            windowId={app.id}
            isSelected={selectedWindowId === app.id}
            onSelect={setSelectedWindowId}
          />
        ))}
      </section>
      {windows.map((windowState) => (
        <Window key={windowState.id} id={windowState.id}>
          <p>Welcome to {windowState.title}.</p>
        </Window>
      ))}
      <Taskbar />
    </main>
  );
}

function App() {
  return (
    <WindowsProvider>
      <Desktop />
    </WindowsProvider>
  );
}

export default App;
