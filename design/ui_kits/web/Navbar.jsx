// CS2 Parser Stats — hidden navbar (slides down on hover)
function Navbar({ view, go }) {
  const links = [
    { id: "home", label: "Home" },
    { id: "matches", label: "Matches" },
    { id: "leaderboard", label: "Players" },
  ];
  return (
    <div className="navwrap">
      <nav className="navbar">
        <div className="navinner">
          <span className="brand" onClick={() => go("home")}>
            <img src="assets/logo.png" alt="UL" style={{ height: 26, width: 26, verticalAlign: "middle", marginRight: 10 }} />
            CS2_<span className="ghost">PARSER</span>
          </span>
          <div className="navlinks">
            {links.map(l => (
              <button key={l.id}
                className={"navlink" + (view === l.id ? " is-active" : "")}
                onClick={() => go(l.id)}>{l.label}</button>
            ))}
          </div>
          <span className="cap cap--xs" style={{ color: "var(--zinc600)" }}>NET_LINK // NODE_01</span>
        </div>
        <div className="navtab"></div>
      </nav>
    </div>
  );
}
window.Navbar = Navbar;
