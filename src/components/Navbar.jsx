import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

export default function Navbar({ totalFavoritos }) {
  const [larguraJanela, setLarguraJanela] = useState(() => window.innerWidth);

  // useEffect com limpeza (cleanup) removendo o listener ao desmontar (Slide 24 — Aula 09)
  useEffect(() => {
    function atualizarLargura() {
      setLarguraJanela(window.innerWidth);
    }

    window.addEventListener("resize", atualizarLargura);

    return () => {
      window.removeEventListener("resize", atualizarLargura);
    };
  }, []);

  const perfilTela =
    larguraJanela < 640 ? "Mobile" : larguraJanela < 1024 ? "Tablet" : "Desktop";

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="marca">
          <span className="marca-icone">R2</span>
          <div>
            <strong>DevFeed React 02</strong>
            <small>Hooks, API REST &amp; React Router</small>
          </div>
        </div>

        <nav className="menu-links" aria-label="Navegação principal">
          <NavLink to="/" end>
            Publicações
          </NavLink>
          <NavLink to="/nova">Nova Publicação</NavLink>
          <NavLink to="/conceitos">Conceitos (Aula 09)</NavLink>
        </nav>

        <div className="indicadores-topo">
          <span className="badge-viewport" title="Monitorado com useEffect + resize cleanup">
            {perfilTela} • {larguraJanela}px
          </span>
          <span className="badge-fav">★ {totalFavoritos} salvo(s)</span>
        </div>
      </div>
    </header>
  );
}
