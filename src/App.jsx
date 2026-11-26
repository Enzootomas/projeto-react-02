import { useEffect, useMemo, useState } from "react";
import { Link, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import PostCard from "./components/PostCard.jsx";

const FAVORITOS_KEY = "devfeed-favoritos-v1";
const POSTS_LOCAIS_KEY = "devfeed-posts-locais-v1";

function lerArrayLocal(chave) {
  try {
    const salvo = localStorage.getItem(chave);
    return salvo ? JSON.parse(salvo) : [];
  } catch {
    return [];
  }
}

function PaginaPublicacoes({
  posts,
  usuarios,
  statusApi,
  erroApi,
  aoRecarregar,
  favoritos,
  aoAlternarFavorito,
}) {
  const [busca, setBusca] = useState("");
  const [apenasSalvos, setApenasSalvos] = useState(false);

  const mapaAutores = useMemo(() => {
    const mapa = {};
    usuarios.forEach((u) => {
      mapa[u.id] = u.name;
    });
    return mapa;
  }, [usuarios]);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return posts.filter((post) => {
      const bateFavorito = !apenasSalvos || favoritos.includes(post.id);
      const bateTexto =
        !termo ||
        post.title.toLowerCase().includes(termo) ||
        post.body.toLowerCase().includes(termo);
      return bateFavorito && bateTexto;
    });
  }, [posts, busca, apenasSalvos, favoritos]);

  return (
    <section className="secao">
      <div className="hero">
        <div>
          <span className="etiqueta">AULA 09 — PROJETO REACT 02</span>
          <h1>Portal Acadêmico de Publicações</h1>
          <p>
            Aplicação React demonstrando <strong>State (`useState`)</strong>,{" "}
            <strong>Formulários Controlados</strong>,{" "}
            <strong>`useEffect` com limpeza</strong>,{" "}
            <strong>Consumo de APIs (`GET` e `POST`)</strong> e{" "}
            <strong>React Router (`Link` e `useParams`)</strong>.
          </p>
        </div>
        <Link to="/nova" className="btn-primario">
          + Publicar via POST
        </Link>
      </div>

      <div className="barra-filtros">
        <input
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Pesquisar por título ou conteúdo..."
          className="campo-pesquisa"
        />

        <div className="acoes-filtro">
          <button
            type="button"
            className={`btn-chip ${!apenasSalvos ? "ativo" : ""}`}
            onClick={() => setApenasSalvos(false)}
          >
            Todas ({posts.length})
          </button>
          <button
            type="button"
            className={`btn-chip ${apenasSalvos ? "ativo" : ""}`}
            onClick={() => setApenasSalvos(true)}
          >
            Salvas ({favoritos.length})
          </button>
        </div>
      </div>

      {statusApi === "loading" && posts.length === 0 && (
        <div className="painel-estado">
          Buscando publicações na API JSONPlaceholder...
        </div>
      )}

      {statusApi === "error" && (
        <div className="painel-erro" role="alert">
          <p>
            <strong>Erro na consulta à API:</strong> {erroApi}
          </p>
          <button type="button" className="btn-primario" onClick={aoRecarregar}>
            Tentar novamente
          </button>
        </div>
      )}

      {statusApi !== "loading" && filtrados.length === 0 && (
        <div className="painel-estado">
          Nenhuma publicação encontrada para os filtros selecionados.
        </div>
      )}

      <div className="grade-posts">
        {filtrados.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            autor={post.autorCustomizado || mapaAutores[post.userId]}
            favorito={favoritos.includes(post.id)}
            aoAlternarFavorito={aoAlternarFavorito}
          />
        ))}
      </div>
    </section>
  );
}

function PaginaDetalhePost({ postsLocais, favoritos, aoAlternarFavorito }) {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const localEncontrado = postsLocais.find(
      (item) => String(item.id) === String(id)
    );

    if (localEncontrado) {
      setPost(localEncontrado);
      setComentarios([]);
      setStatus("success");
      return undefined;
    }

    const controller = new AbortController();
    setStatus("loading");

    async function carregarDetalhes() {
      try {
        const [respPost, respComentarios] = await Promise.all([
          fetch(`https://jsonplaceholder.typicode.com/posts/${id}`, {
            signal: controller.signal,
          }),
          fetch(`https://jsonplaceholder.typicode.com/posts/${id}/comments`, {
            signal: controller.signal,
          }),
        ]);

        if (!respPost.ok) {
          throw new Error("Publicação não localizada na API.");
        }

        const dadosPost = await respPost.json();
        const dadosComentarios = respComentarios.ok
          ? await respComentarios.json()
          : [];

        setPost(dadosPost);
        setComentarios(dadosComentarios.slice(0, 4));
        setStatus("success");
      } catch (erro) {
        if (erro.name !== "AbortError") {
          setStatus("error");
        }
      }
    }

    carregarDetalhes();
    return () => controller.abort();
  }, [id, postsLocais]);

  if (status === "loading") {
    return (
      <div className="painel-estado">
        Carregando detalhes da publicação #{id}...
      </div>
    );
  }

  if (status === "error" || !post) {
    return (
      <div className="painel-erro">
        <p>Não foi possível localizar a publicação de ID #{id}.</p>
        <Link to="/" className="btn-primario">
          Voltar para publicações
        </Link>
      </div>
    );
  }

  const salvo = favoritos.includes(post.id);

  return (
    <section className="secao">
      <div className="topo-detalhe">
        <Link to="/" className="btn-secundario">
          ← Voltar ao feed
        </Link>
        <span className="etiqueta">PARÂMETRO DE ROTA (useParams): id = {id}</span>
      </div>

      <article className="painel-detalhe">
        <div className="post-card-topo">
          <span className="post-tag">Publicação #{post.id}</span>
          <button
            type="button"
            className={`btn-favorito ${salvo ? "ativo" : ""}`}
            onClick={() => aoAlternarFavorito(post.id)}
          >
            {salvo ? "★ Salvo nos favoritos" : "☆ Salvar nos favoritos"}
          </button>
        </div>

        <h1>{post.title}</h1>
        <p className="texto-detalhe">{post.body}</p>
      </article>

      <div className="secao-comentarios">
        <h2>Comentários da API ({comentarios.length})</h2>
        {comentarios.length === 0 ? (
          <p className="texto-suave">
            Publicação recém-criada localmente via método POST.
          </p>
        ) : (
          <div className="lista-comentarios">
            {comentarios.map((c) => (
              <div key={c.id} className="comentario-card">
                <strong>{c.email}</strong>
                <p>{c.body}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function PaginaNovaPublicacao({ aoCriarPost }) {
  const [titulo, setTitulo] = useState("");
  const [autor, setAutor] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [respostaPost, setRespostaPost] = useState(null);
  const navigate = useNavigate();

  async function enviarFormulario(evento) {
    evento.preventDefault(); // Impede o recarregamento padrão da página (Slide 18)
    setErro("");

    if (!titulo.trim() || !autor.trim() || !conteudo.trim()) {
      setErro("Preencha todos os campos obrigatórios antes de publicar.");
      return;
    }

    setEnviando(true);

    try {
      const resposta = await fetch(
        "https://jsonplaceholder.typicode.com/posts",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: titulo.trim(),
            body: conteudo.trim(),
            userId: 1,
          }),
        }
      );

      if (!resposta.ok) {
        throw new Error(`Erro HTTP ${resposta.status} ao enviar publicação.`);
      }

      const dados = await resposta.json();
      const novoRegistro = {
        ...dados,
        id: Date.now(),
        title: titulo.trim(),
        body: conteudo.trim(),
        autorCustomizado: autor.trim(),
        origemLocal: true,
      };

      aoCriarPost(novoRegistro);
      setRespostaPost(dados);
      setTitulo("");
      setAutor("");
      setConteudo("");
    } catch (falha) {
      setErro(
        falha instanceof Error
          ? falha.message
          : "Não foi possível enviar os dados via POST."
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="secao estreita">
      <span className="etiqueta">FORMULÁRIOS CONTROLADOS + FETCH POST</span>
      <h1>Nova Publicação Acadêmica</h1>
      <p className="texto-suave">
        Todos os campos abaixo são controlados por <code>useState</code>, validados
        no <code>onSubmit</code> com <code>preventDefault()</code> e enviados para a
        API via método HTTP <code>POST</code>.
      </p>

      <form onSubmit={enviarFormulario} className="formulario-card">
        <label htmlFor="campo-titulo">Título da publicação *</label>
        <input
          id="campo-titulo"
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Ex.: Como o Hook useEffect sincroniza sistemas externos"
        />

        <label htmlFor="campo-autor">Nome do estudante / autor *</label>
        <input
          id="campo-autor"
          type="text"
          value={autor}
          onChange={(e) => setAutor(e.target.value)}
          placeholder="Ex.: Enzo Gabriel"
        />

        <label htmlFor="campo-conteudo">Resumo técnico *</label>
        <textarea
          id="campo-conteudo"
          rows={5}
          value={conteudo}
          onChange={(e) => setConteudo(e.target.value)}
          placeholder="Explique o conceito estudado ou compartilhe uma anotação..."
        />

        {erro && (
          <p className="alerta-form-erro" role="alert">
            {erro}
          </p>
        )}

        <div className="acoes-form">
          <button type="submit" className="btn-primario" disabled={enviando}>
            {enviando ? "Enviando POST..." : "Publicar na API (POST)"}
          </button>
          <button
            type="button"
            className="btn-secundario"
            onClick={() => navigate("/")}
          >
            Ver Feed
          </button>
        </div>
      </form>

      {respostaPost && (
        <div className="sucesso-post" role="status">
          <strong>Publicação enviada com sucesso!</strong>
          <p>
            A API respondeu ao <code>POST /posts</code> e o item já está disponível
            no topo do Feed.
          </p>
          <pre>{JSON.stringify(respostaPost, null, 2)}</pre>
        </div>
      )}
    </section>
  );
}

function PaginaConceitos() {
  const [contadorEstudo, setContadorEstudo] = useState(0);

  const conceitosAula09 = [
    {
      id: 1,
      titulo: "State e useState",
      onde: "Favoritos, busca textual, abas de filtro, estados de envio e contador interativo.",
    },
    {
      id: 2,
      titulo: "Formulários Controlados",
      onde: "Página Nova Publicação com value + onChange, validação e event.preventDefault().",
    },
    {
      id: 3,
      titulo: "useEffect e Função de Limpeza",
      onde: "Título dinâmico da aba (document.title), listener resize na Navbar e AbortController nas buscas HTTP.",
    },
    {
      id: 4,
      titulo: "Consumo de APIs (GET e POST)",
      onde: "Listagem de posts/usuários/comentários (GET) e criação de publicação (POST) com verificação de response.ok.",
    },
    {
      id: 5,
      titulo: "React Router e useParams",
      onde: "Rotas /, /nova, /conceitos e rota dinâmica /publicacoes/:id sem recarregar a página.",
    },
  ];

  return (
    <section className="secao">
      <span className="etiqueta">MAPEAMENTO DIDÁTICO — AULA 09</span>
      <h1>Conceitos Aplicados na Prática</h1>

      <div className="demo-contador">
        <div>
          <strong>Demonstração Reativa de useState</strong>
          <p>
            Variáveis comuns não re-renderizam a tela; alterar o estado com{" "}
            <code>setContadorEstudo</code> solicita nova renderização imediata.
          </p>
        </div>
        <div className="contador-controles">
          <span className="contador-valor">{contadorEstudo}</span>
          <button
            type="button"
            className="btn-primario"
            onClick={() => setContadorEstudo((atual) => atual + 1)}
          >
            Incrementar +1
          </button>
        </div>
      </div>

      <div className="grade-conceitos">
        {conceitosAula09.map((c) => (
          <article key={c.id} className="conceito-card">
            <span className="post-tag">Conceito 0{c.id}</span>
            <h3>{c.titulo}</h3>
            <p>{c.onde}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function App() {
  const [postsApi, setPostsApi] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [postsLocais, setPostsLocais] = useState(() =>
    lerArrayLocal(POSTS_LOCAIS_KEY)
  );
  const [favoritos, setFavoritos] = useState(() => lerArrayLocal(FAVORITOS_KEY));
  const [statusApi, setStatusApi] = useState("loading");
  const [erroApi, setErroApi] = useState("");
  const [tentativa, setTentativa] = useState(0);
  const location = useLocation();

  // Sincroniza título da aba conforme a rota ativa (Slide 22 — Aula 09)
  useEffect(() => {
    if (location.pathname === "/") {
      document.title = "DevFeed React 02 — Publicações";
    } else if (location.pathname === "/nova") {
      document.title = "DevFeed React 02 — Nova Publicação (POST)";
    } else if (location.pathname === "/conceitos") {
      document.title = "DevFeed React 02 — Conceitos da Aula 09";
    } else if (location.pathname.startsWith("/publicacoes/")) {
      document.title = "DevFeed React 02 — Detalhes da Publicação";
    }
  }, [location.pathname]);

  useEffect(() => {
    localStorage.setItem(FAVORITOS_KEY, JSON.stringify(favoritos));
  }, [favoritos]);

  useEffect(() => {
    localStorage.setItem(POSTS_LOCAIS_KEY, JSON.stringify(postsLocais));
  }, [postsLocais]);

  // Busca inicial de dados na API com limpeza via AbortController (Slides 27–30)
  useEffect(() => {
    const controller = new AbortController();
    setStatusApi("loading");
    setErroApi("");

    async function carregarFeed() {
      try {
        const [respPosts, respUsers] = await Promise.all([
          fetch("https://jsonplaceholder.typicode.com/posts?_limit=9", {
            signal: controller.signal,
          }),
          fetch("https://jsonplaceholder.typicode.com/users", {
            signal: controller.signal,
          }),
        ]);

        if (!respPosts.ok || !respUsers.ok) {
          throw new Error("Falha HTTP ao consultar dados da API externa.");
        }

        const listaPosts = await respPosts.json();
        const listaUsers = await respUsers.json();

        setPostsApi(listaPosts);
        setUsuarios(listaUsers);
        setStatusApi("success");
      } catch (erro) {
        if (erro.name !== "AbortError") {
          setStatusApi("error");
          setErroApi(
            erro instanceof Error
              ? erro.message
              : "Serviço temporariamente indisponível."
          );
        }
      }
    }

    carregarFeed();
    return () => controller.abort();
  }, [tentativa]);

  function alternarFavorito(postId) {
    setFavoritos((atual) =>
      atual.includes(postId)
        ? atual.filter((id) => id !== postId)
        : [...atual, postId]
    );
  }

  function adicionarPostCriado(novoPost) {
    setPostsLocais((atual) => [novoPost, ...atual]);
  }

  const todosOsPosts = useMemo(
    () => [...postsLocais, ...postsApi],
    [postsLocais, postsApi]
  );

  return (
    <div className="app-shell">
      <Navbar totalFavoritos={favoritos.length} />

      <main className="conteudo-principal">
        <Routes>
          <Route
            path="/"
            element={
              <PaginaPublicacoes
                posts={todosOsPosts}
                usuarios={usuarios}
                statusApi={statusApi}
                erroApi={erroApi}
                aoRecarregar={() => setTentativa((n) => n + 1)}
                favoritos={favoritos}
                aoAlternarFavorito={alternarFavorito}
              />
            }
          />
          <Route
            path="/publicacoes/:id"
            element={
              <PaginaDetalhePost
                postsLocais={postsLocais}
                favoritos={favoritos}
                aoAlternarFavorito={alternarFavorito}
              />
            }
          />
          <Route
            path="/nova"
            element={<PaginaNovaPublicacao aoCriarPost={adicionarPostCriado} />}
          />
          <Route path="/conceitos" element={<PaginaConceitos />} />
        </Routes>
      </main>

      <footer className="rodape">
        <span>Frameworks Front-end — Aula 09 (Projeto React 02)</span>
        <span>SENAI • Prof. Me. Deivison S. Takatu</span>
      </footer>
    </div>
  );
}
