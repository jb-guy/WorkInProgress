import { ThemeProvider } from "./context/ThemeContext";
import { SectionInteractionProvider } from "./context/SectionInteractionContext";
import SplitViewport from "./components/SplitViewport";
export default function App() {
  return (
    <ThemeProvider>
      <SectionInteractionProvider>
        <div className="relative">
          <SplitViewport />
        </div>
      </SectionInteractionProvider>
    </ThemeProvider>
  );
}
