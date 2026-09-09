// Carrossel de imagens do Hero
(() => {
    const hero = document.querySelector(".hero");
    const slides = document.querySelectorAll(".hero-slide");
    const anterior = document.querySelector("#hero-anterior");
    const proximo = document.querySelector("#hero-proximo");
    const pausa = document.querySelector("#hero-pausa");
    const contador = document.querySelector("#hero-contador");
    const legenda = document.querySelector("#hero-legenda");
const profissional = document.querySelector("#hero-profissional");
const area = document.querySelector("#hero-area");

    if (!hero || !slides.length || !anterior || !proximo || !pausa || !contador) {
        return;
    }

    const movimentoReduzido = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );

    let indiceAtual = 0;
    let pausado = movimentoReduzido.matches;
    let temporizador = null;

    function mostrarSlide(indice) {
    indiceAtual = (indice + slides.length) % slides.length;

    slides.forEach((slide, posicao) => {
        slide.classList.toggle("ativo", posicao === indiceAtual);
    });

    contador.textContent = `${indiceAtual + 1} / ${slides.length}`;

    if (legenda && profissional && area) {
        const slideAtual = slides[indiceAtual];
        const nome = slideAtual.dataset.nome || "";
        const especialidade = slideAtual.dataset.area || "";

        profissional.textContent = nome;
        area.textContent = especialidade;
        legenda.hidden = !nome;
        legenda.href = slideAtual.dataset.perfil
    ? `#${slideAtual.dataset.perfil}`
    : "#equipe";

legenda.setAttribute(
    "aria-label",
    nome ? `Conheça ${nome} na seção Equipe` : "Conheça nossa equipe"
);
    }
}

    function atualizarReproducao() {
        window.clearInterval(temporizador);
        temporizador = null;

        const reproduzir = !pausado && !document.hidden;

        hero.classList.toggle("em-reproducao", reproduzir);
        pausa.textContent = pausado ? "Reproduzir" : "Pausar";
        pausa.setAttribute(
            "aria-label",
            pausado ? "Reproduzir imagens automaticamente" : "Pausar imagens"
        );

        if (reproduzir) {
            temporizador = window.setInterval(() => {
                mostrarSlide(indiceAtual + 1);
            }, 6000);
        }
    }

    function navegar(direcao) {
        // A navegação manual pausa a troca automática.
        pausado = true;
        mostrarSlide(indiceAtual + direcao);
        atualizarReproducao();
    }

    anterior.addEventListener("click", () => navegar(-1));
    proximo.addEventListener("click", () => navegar(1));

    pausa.addEventListener("click", () => {
        pausado = !pausado;
        atualizarReproducao();
    });

    document.addEventListener("visibilitychange", atualizarReproducao);

    movimentoReduzido.addEventListener("change", () => {
        if (movimentoReduzido.matches) {
            pausado = true;
            atualizarReproducao();
        }
    });

    mostrarSlide(0);
    atualizarReproducao();
})();

// Modal de demonstração
(() => {
    const abrir = document.querySelector("#abrir-demo");
    const modal = document.querySelector("#modal-demo");

    if (!abrir || !modal) {
        return;
    }

    abrir.addEventListener("click", () => {
        if (!modal.open) {
            modal.showModal();
            document.body.classList.add("modal-aberto");
        }
    });

    modal.addEventListener("close", () => {
        document.body.classList.remove("modal-aberto");
        abrir.focus();
    });
})();

// Menu do cabeçalho
(() => {
    const botao = document.querySelector(".menu-toggle");
    const menu = document.querySelector("#menu-principal");
    const telaCompacta = window.matchMedia("(max-width: 1100px)");

    if (!botao || !menu) {
        return;
    }

    function definirMenu(aberto) {
        menu.classList.toggle("nav-aberta", aberto);
        botao.setAttribute("aria-expanded", String(aberto));
        botao.setAttribute(
            "aria-label",
            aberto ? "Fechar menu" : "Abrir menu"
        );
        botao.textContent = aberto ? "✕" : "☰";
    }

    botao.addEventListener("click", () => {
        const aberto = botao.getAttribute("aria-expanded") === "true";
        definirMenu(!aberto);
    });

    menu.addEventListener("click", (evento) => {
        if (evento.target.closest("a")) {
            definirMenu(false);
        }
    });

    document.addEventListener("click", (evento) => {
        if (!menu.contains(evento.target) && !botao.contains(evento.target)) {
            definirMenu(false);
        }
    });

    document.addEventListener("keydown", (evento) => {
        if (
            evento.key === "Escape" &&
            botao.getAttribute("aria-expanded") === "true"
        ) {
            definirMenu(false);
            botao.focus();
        }
    });

    telaCompacta.addEventListener("change", () => definirMenu(false));
})();

// Entrada suave das seções durante a rolagem
(() => {
    const movimentoReduzido = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );

    if (
        movimentoReduzido.matches ||
        !("IntersectionObserver" in window) ||
        !Element.prototype.animate
    ) {
        return;
    }

    const elementos = document.querySelectorAll(`
        .tratamentos .section-cabecalho,
        .tratamento-card,
        .sobre-imagem-wrapper,
        .sobre-conteudo,
        .equipe-cabecalho,
        .equipe-imagem-wrapper,
        .especialidades-equipe,
        .faq .section-cabecalho,
        .faq-item,
        .contato-conteudo,
        .contato-card
    `);

    const animacoes = new Map();

    const observador = new IntersectionObserver((entradas) => {
        entradas.forEach((entrada) => {
            if (!entrada.isIntersecting) {
                return;
            }

            const elemento = entrada.target;

            observador.unobserve(elemento);

            if (
                movimentoReduzido.matches ||
                elemento.contains(document.activeElement)
            ) {
                return;
            }

            const animacao = elemento.animate(
                [
                    { opacity: 0, translate: "0 50px" },
                    { opacity: 1, translate: "0 0" }
                ],
                {
                    duration: 650,
                    easing: "cubic-bezier(0.22, 1, 0.36, 1)"
                }
            );

            animacoes.set(elemento, animacao);

            animacao.onfinish = () => {
                animacoes.delete(elemento);
            };
        });
    }, {
        threshold: 0.08
    });

    elementos.forEach((elemento) => {
        observador.observe(elemento);
    });

    // Mantém visível qualquer elemento acessado pelo teclado.
    document.addEventListener("focusin", (evento) => {
        animacoes.forEach((animacao, elemento) => {
            if (elemento.contains(evento.target)) {
                animacao.cancel();
                animacoes.delete(elemento);
            }
        });
    });

    movimentoReduzido.addEventListener("change", () => {
        if (movimentoReduzido.matches) {
            observador.disconnect();

            animacoes.forEach((animacao) => animacao.cancel());
            animacoes.clear();
        }
    });
})();   

// Revelação das imagens nos tratamentos
(() => {
    const cards = document.querySelectorAll(".tratamento-card");
    const possuiHover = window.matchMedia(
        "(hover: hover) and (pointer: fine)"
    );

    cards.forEach((card) => {
        const botao = card.querySelector(".tratamento-revelar");
        const foto = card.querySelector(".tratamento-foto");
        const titulo = card.querySelector("h3");

        if (!botao || !foto || !titulo) {
            return;
        }

        let fixado = false;
        let mouseDentro = false;
        let focoTeclado = false;

        function atualizar() {
            const visivel = possuiHover.matches
    ? mouseDentro || focoTeclado
    : fixado || focoTeclado;
            card.classList.toggle("imagem-visivel", visivel);

            // O botão controla se a imagem permanece aberta.
            botao.setAttribute("aria-pressed", String(fixado));
            botao.textContent = fixado ? "Ocultar imagem" : "Ver imagem";

            botao.setAttribute(
                "aria-label",
                `${fixado ? "Ocultar" : "Mostrar"} imagem de ${
                    titulo.textContent.trim()
                }`
            );
        }

        botao.addEventListener("click", () => {
            fixado = !fixado;

            // Ao ocultar, respeita o clique mesmo com o cursor no card.
            if (!fixado) {
                mouseDentro = false;
                focoTeclado = false;
            }

            atualizar();
        });

        card.addEventListener("pointerenter", (evento) => {
            if (possuiHover.matches && evento.pointerType !== "touch") {
                mouseDentro = true;
                atualizar();
            }
        });

        card.addEventListener("pointerleave", () => {
            mouseDentro = false;
            atualizar();
        });

        card.addEventListener("focusin", (evento) => {
            focoTeclado = evento.target.matches(":focus-visible");
            atualizar();
        });

        card.addEventListener("focusout", (evento) => {
            if (!card.contains(evento.relatedTarget)) {
                focoTeclado = false;
                atualizar();
            }
        });

        card.addEventListener("keydown", (evento) => {
            if (evento.key === "Escape") {
                fixado = false;
                mouseDentro = false;
                focoTeclado = false;
                atualizar();
            }
        });

       possuiHover.addEventListener("change", () => {
    fixado = false;
    mouseDentro = false;
    focoTeclado = false;
    atualizar();
});
});

})();

// Navegação para a equipe e perfis demonstrativos
(() => {
    const legenda = document.querySelector("#hero-legenda");
    const modal = document.querySelector("#modal-perfil");
    const titulo = document.querySelector("#perfil-titulo");
    const botoes = document.querySelectorAll(".equipe-perfil");

    let origem = null;

    legenda?.addEventListener("click", () => {
        const destino = legenda.getAttribute("href");
        const profissional = document.getElementById(
            destino?.replace("#", "")
        );

        // O link realiza a rolagem; o foco acompanha o destino.
        profissional?.focus({ preventScroll: true });
    });

    if (!modal || !titulo) {
        return;
    }

    botoes.forEach((botao) => {
        botao.addEventListener("click", () => {
            if (modal.open) {
                return;
            }

            origem = botao;
            titulo.textContent = botao.dataset.profissional;
            modal.showModal();
            document.body.classList.add("modal-aberto");
        });
    });

    modal.addEventListener("close", () => {
        if (!document.querySelector("dialog[open]")) {
            document.body.classList.remove("modal-aberto");
        }

        origem?.focus({ preventScroll: true });
    });
})();