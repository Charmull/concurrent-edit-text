import { Tldraw } from "@tldraw/tldraw";
import "./App.css";
import CustomCursor from "./CustomCursor";
import useMultiplayerState from "./hook/useMultiplayerState";

function App() {
  const { ...events } = useMultiplayerState(`tldraw-`);
  const component = { Cursor: CustomCursor };

  return (
    <div className="App">
      <div className="tldraw">
        <Tldraw
          components={component}
          autofocus
          disableAssets={true}
          showPages={false}
          // {...fileSystemEvents}
          {...events}
        />
      </div>
    </div>
  );
}

export default App;
