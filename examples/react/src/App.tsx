import "@thorvg/lottie-player";
import "./styles.css";

const App = () => {
  return (
    <div className="app">
      <h1 className="app_title">ThorVG React Usage Example</h1>
      <lottie-player
        autoPlay
        loop
        src="https://lottie.host/6d7dd6e2-ab92-4e98-826a-2f8430768886/NGnHQ6brWA.json"
        wasmUrl="/thorvg.wasm"
      />
    </div>
  );
};

export default App;
