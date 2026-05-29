// CS2 Parser Stats — app shell / fake router
function App() {
  const [view, setView] = React.useState("home");
  const [playerId, setPlayerId] = React.useState(null);

  function go(v, id) {
    if (id !== undefined) setPlayerId(id);
    setView(v);
    if (window.scrollTo) window.scrollTo({ top: 0 });
  }

  let body;
  if (view === "home") body = <HomeView go={go} />;
  else if (view === "matches") body = <MatchesView go={go} />;
  else if (view === "leaderboard") body = <LeaderboardView go={go} />;
  else if (view === "player") body = <PlayerView go={go} playerId={playerId} />;

  return (
    <div className="app">
      <div className="dotgrid"></div>
      <Navbar view={view} go={go} />
      <div key={view}>{body}</div>
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<App />);
