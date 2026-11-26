import { Link } from "react-router-dom";

export default function PostCard({ post, autor, favorito, aoAlternarFavorito }) {
  return (
    <article className="post-card">
      <div className="post-card-topo">
        <span className="post-tag">
          {post.origemLocal ? "Criado via POST" : `Publicação #${post.id}`}
        </span>
        <button
          type="button"
          className={`btn-favorito ${favorito ? "ativo" : ""}`}
          onClick={() => aoAlternarFavorito(post.id)}
          aria-label={favorito ? "Remover dos salvos" : "Salvar publicação"}
        >
          {favorito ? "★ Salvo" : "☆ Salvar"}
        </button>
      </div>

      <h3>{post.title}</h3>
      <p>{post.body}</p>

      <div className="post-card-rodape">
        <small>Autor: {autor || "Comunidade Acadêmica"}</small>
        <Link to={`/publicacoes/${post.id}`} className="link-detalhe">
          Ver detalhes →
        </Link>
      </div>
    </article>
  );
}
