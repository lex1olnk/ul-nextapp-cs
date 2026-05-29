// CS2 Parser Stats — PRINT app: render every screen stacked, one per page
function PrintApp() {
  const noop = () => {};
  return (
    <div className="app">
      <div className="printpage"><HomeView go={noop} /></div>
      <div className="printpage"><MatchesView go={noop} /></div>
      <div className="printpage"><LeaderboardView go={noop} /></div>
      <div className="printpage"><PlayerView go={noop} playerId="zywoo" /></div>
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<PrintApp />);
