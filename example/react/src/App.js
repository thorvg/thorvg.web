import "./styles.css";
import "@thorvg/lottie-player";

export default function App() {
  return (
    <div className="App">
      <h1>Hello ThorVG</h1>
      <lottie-player
        autoPlay={true}
        loop={true}
        intermission="1000"
        mode="normal"
        src="https://lottie.host/6d7dd6e2-ab92-4e98-826a-2f8430768886/NGnHQ6brWA.json"
        style={{ display: "block", width: 500, height: 500 }}></lottie-player>
    </div>
  );
}
