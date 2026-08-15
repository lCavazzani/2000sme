import { useEffect, useState } from "react";
import { AppearanceThemesWindow } from "./components/AppearanceThemesWindow";
import { DesktopIcon } from "./components/DesktopIcon";
import { FileExplorer } from "./components/FileExplorer";
import { Guestbook } from "./components/Guestbook";
import { ProjectDetail } from "./components/ProjectDetail";
import { Taskbar } from "./components/Taskbar";
import { WordPad } from "./components/WordPad";
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

function WindowContent({ windowId, title }: { windowId: string; title: string }) {
  if (windowId === "my-computer") return <FileExplorer />;
  if (windowId === "resume") return <WordPad />;
  if (windowId === "guestbook") return <Guestbook />;
  if (windowId === "appearance-themes") return <AppearanceThemesWindow />;
  if (windowId.startsWith("project-detail-")) {
    return <ProjectDetail projectId={windowId.replace("project-detail-", "")} />;
  }
  return <p>Welcome to {title}.</p>;
}

function Desktop() {
  const { windows, openWindow } = useWindows();
  useEffect(() => {
    openWindow(portfolioWindow);
  }, [openWindow]);

  const [selectedWindowId, setSelectedWindowId] = useState<string | null>(null);

  return (
    <main className="desktop" aria-label="Desktop" data-desktop-root tabIndex={-1}>
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
          <WindowContent windowId={windowState.id} title={windowState.title} />
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
