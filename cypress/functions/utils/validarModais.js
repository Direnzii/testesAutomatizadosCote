import { listNomeColunasModal, listDadosCabecalho } from "./constants.js";
import { URL_AUTH_DEMO } from "./envVariaveis.js";

export function clicarNoBotaoTelaResumo(nomeNoBotao) {
    cy.get('[class="pedido-resumo-page"]')
        .find("button")
        .contains(nomeNoBotao)
        .should("be.visible")
        .click();
}

export function modalIsVisible() {
    cy.get("#rc-modal-title").should("be.visible");
    cy.get("#rc-modal-descr").should("be.visible");
}

export function checarTodosDadosModalLupa() {
    // verificar de modal é completamente visivel
    modalIsVisible();
    cy.get("#rc-modal-descr")
        .find('[class="MuiAccordion-region"]')
        .should("be.visible");
    cy.get("#rc-modal-descr")
        .find('[data-testid="conteudo-tabela-cell"]')
        .should("be.visible");
    cy.get("#rc-modal-descr")
        .find("span")
        .each((dadosModalSpan, indexSpan) => {
            if (!dadosModalSpan.text()) {
                cy.fail(
                    `Verificar textos dentro da modal, falhou em: span[${indexSpan}]`
                );
            }
        });
    cy.get("#rc-modal-descr")
        .find("span")
        .find("strong")
        .each((dadosModalStrong, indexStrong) => {
            if (!dadosModalStrong.text() === listDadosCabecalho[indexStrong]) {
                cy.fail(
                    `Verificar textos dentro da modal, falhou em: span[${indexSpan}]`
                );
            }
        });
    cy.get("#rc-modal-descr")
        .find("thead")
        .first()
        .find("td")
        .each((dadosColuna, indexDadosColuna) => {
            if (
                !dadosColuna.text() === listNomeColunasModal[indexDadosColuna]
            ) {
                cy.fail(
                    `Verificar textos dentro da modal, falhou em: span[${indexDadosColuna}]`
                );
            }
        });
}

function checarOrdenacaoLupaApenasClique() {
    //checar a ordenação, aqui serao realizados cliques em todos os campos de ordenação
    cy.get("#rc-modal-descr")
        .find("thead")
        .first()
        .find("td")
        .each((colunaOrdenar) => {
            cy.get(colunaOrdenar).click().wait(200).click().wait(200).click();
        });
}

export function checarFiltroDeProdutoPorItemLupa(
    textoParaPesquisar,
    indexCelulaLinha,
    spanIndex,
    indexRandom,
    wait
) {
    modalIsVisible();
    if (indexCelulaLinha === 3 && spanIndex === 1) {
        // celula da coluna Nome do produto e fabribante
        textoParaPesquisar = textoParaPesquisar.split("-")[0]; // fabricante eu pego apenas antes do -
    }
    cy.intercept({
        method: "GET",
        url: `${URL_AUTH_DEMO}/resumoresposta/getItensResposta/*`,
    }).as("pedidoGerando");
    cy.get('[id="rc-modal-descr"]')
        .find('[type="search"]')
        .type(textoParaPesquisar.split("-")[0]); // aqui eu coloco o texto no input da modal
    cy.wait("@pedidoGerando").its("response.statusCode").should("eq", 200);
    if (wait) {
        cy.wait(2000);
    }
    if (!indexRandom) {
        // quer dizer que a linha sorteada para filtrar foi a primeira
        cy.get("#rc-modal-descr")
            .find('[data-testid="conteudo-tabela-row"]')
            .contains(textoParaPesquisar)
            .should("be.visible");
    } else {
        cy.get("#rc-modal-descr")
            .find('[data-testid="conteudo-tabela-row"]')
            .first()
            .contains(textoParaPesquisar)
            .should("be.visible");
    }
    cy.intercept({
        method: "GET",
        url: `${URL_AUTH_DEMO}/resumoresposta/getItensResposta/*`,
    }).as("pedidoGerandoClean");
    cy.get('[id="rc-modal-descr"]').find('[type="search"]').clear();
    cy.wait("@pedidoGerandoClean").its("response.statusCode").should("eq", 200);
    if (wait) {
        cy.wait(2000);
    }
}

function checarFiltroDeProdutoModalLupa() {
    cy.get('[id="rc-modal-descr"]')
        .find('[data-testid="conteudo-tabela-row"]')
        .then((listObjtProduto) => {
            // pego todas as linhas de produtos dentro da modal
            let indexRandom = Math.floor(
                Math.random() * listObjtProduto.length // randomizo um index para pegar um produto aleatorio dentro da modal
            );
            cy.get('[id="rc-modal-descr"]')
                .find('[data-testid="conteudo-tabela-row"]')
                .eq(indexRandom)
                .find('[data-testid="conteudo-tabela-cell"]')
                .each((celulaLinha, indexCelulaLinha) => {
                    if (
                        indexCelulaLinha !== 1 &&
                        indexCelulaLinha !== 2 &&
                        !celulaLinha.get(0).textContent
                    ) {
                        // existe essa condicional pq o index 1 é vazio mesmo
                        cy.fail("Nao entrou no index: ", indexCelulaLinha);
                    } else {
                        // demais index são populados
                        if (indexCelulaLinha === 3 || indexCelulaLinha === 4) {
                            // index 2 e 3 são as celulas de ean e descricao do produto
                            cy.get("#rc-modal-descr")
                                .find('[data-testid="conteudo-tabela-row"]')
                                .eq(indexRandom)
                                .find('[data-testid="conteudo-tabela-cell"]')
                                .eq(indexCelulaLinha)
                                .find("span")
                                .each((spanCell, spanIndex) => {
                                    if (listObjtProduto.length > 1) {
                                        // existem mais produtos na modal
                                        let wait;
                                        if (!indexRandom) {
                                            // item sorteado para filtro foi o primeiro
                                            wait = true;
                                        } else {
                                            wait = false;
                                        }
                                        checarFiltroDeProdutoPorItemLupa(
                                            spanCell.text(),
                                            indexCelulaLinha,
                                            spanIndex,
                                            indexRandom,
                                            wait
                                        );
                                    } else {
                                        // só existe 1 produto na modal
                                        checarFiltroDeProdutoPorItemLupa(
                                            spanCell.text(),
                                            indexCelulaLinha,
                                            spanIndex,
                                            true
                                        );
                                    }
                                });
                        }
                    }
                });
        });
}

function checarSeDadosEstaoSobrepostosModalLupa() {
    cy.get('[id="rc-modal-descr"]')
        .find('[data-testid="conteudo-tabela-row"]')
        .each((linha) => {
            cy.get(linha)
                .find('[data-testid="conteudo-tabela-cell"]')
                .each((celula, indxCelula) => {
                    if (indxCelula === 3 || indxCelula === 4) {
                        let larguraCelula = celula.width();
                        cy.get(celula)
                            .find("span")
                            .each((celulaSpan) => {
                                let textoSpan = celulaSpan.text();
                                let larguraDoTexto = Cypress.$(celulaSpan)
                                    .text(textoSpan)
                                    .width();
                                expect(larguraCelula).to.be.greaterThan(
                                    larguraDoTexto
                                );
                            });
                    }
                });
        });
}

export function realizarChecagemNaModal(tipo) {
    if (tipo === "dados") {
        checarTodosDadosModalLupa();
    } else if (tipo === "filtro") {
        // se nao é dados é filtro
        checarFiltroDeProdutoModalLupa();
    } else if (tipo === "textoSobreposto") {
        checarSeDadosEstaoSobrepostosModalLupa();
    }
    cy.get("#rc-modal-title")
        .find('[class="backdrop-content--header-close"]')
        .click({ force: true });
}

export function abrirModalLupa(blocoResposta, linhaRespostaCliente) {
    cy.get(blocoResposta)
        .find(linhaRespostaCliente)
        .find('[data-testid="conteudo-tabela-cell"]')
        .eq(4)
        .find("img")
        .click(); // abrir acordeon lupa
}

export function reiniciarPedidoAlterandoVencimento(pedidoGerado = true) {
    const dataAtual = new Date(); // trazer data atual do sistema
    const dia = dataAtual.getDate();
    if (pedidoGerado === true) {
        cy.get('[class="content"]')
            .find("button")
            .contains("Reiniciar Pedidos")
            .click();
        cy.get("#rc-modal-descr").find("button").contains("Sim").click();
    }
    clicarNoBotaoTelaResumo("Alterar Vencimento");
    cy.get('[class="alterar-vencimento-middle"]').find("input").first().click();
    if (dia >= 10) {
        // usado para setar o dia com base no dia do systema
        cy.get('[class="react-datepicker__month"]')
            .find(".react-datepicker__day--0" + dia)
            .each((diaButton) => {
                // gero uma lista com os botos iguais
                cy.get(diaButton)
                    .invoke("attr", "aria-disabled")
                    .then((diaButtonisNotClicavel) => {
                        if (diaButtonisNotClicavel === "false") {
                            // quando o botao for o visivel vai cair aqui
                            cy.get(diaButton).click(); // verificação para quando tem mais de um dia igual
                        }
                    });
            }); // ex: quando for o dia 10 o index do dia na tooltip vai com um 0 a menos
    } else {
        cy.get('[class="react-datepicker__month"]')
            .find(".react-datepicker__day--00" + dia)
            .first()
            .click();
    }
    cy.get(".alterar-vencimento-middle-time-picker").click();
    cy.get(".react-datepicker").contains("23:30").click(); // usado para setar a hora na modal
    cy.get("button").contains("Confirmar").click();
}

export const funcoesBotaoModal = {
    alterarVencimento: function alterarVencimento() {
        clicarNoBotaoTelaResumo("Alterar Vencimento");
        modalIsVisible();
        cy.get("#rc-modal-title").contains("Alterar Vencimento");
        cy.get("#rc-modal-descr").contains("Data e hora de vencimento");
        cy.get("#rc-modal-descr").find("button").contains("Confirmar");
        cy.get("#rc-modal-descr").find("button").contains("Cancelar").click();
    },
    cancelarCotacao: function cancelarCotacao() {
        clicarNoBotaoTelaResumo("Cancelar Cotação");
        modalIsVisible();
        cy.get("#rc-modal-title").contains("Aviso");
        cy.get("#rc-modal-descr").contains(
            "Ao cancelar uma cotação, todas as informações serão perdidas e não será possível acessá-la novamente ou enviar pedidos."
        );
        cy.get("#rc-modal-descr").contains(
            "Deseja realmente cancelar esta cotação?"
        );
        cy.get("#rc-modal-descr").contains("Motivo do cancelamento:");
        cy.get("#rc-modal-descr").find("img"); // ver se existe uma imagem na modal
        cy.get("#rc-modal-descr").find("textarea"); // validar input
        cy.get("#rc-modal-descr")
            .find("textarea")
            .type("Qualquer coisa só para ver se esta escrevendo normal");
        cy.get("#rc-modal-descr").contains("Não").click();
    },
    pedidoAutoAndManual: function pedidoAutomaticoManual() {
        clicarNoBotaoTelaResumo("Pedido Automático");
        modalIsVisible();
        cy.get("#rc-modal-title").contains("Pedido");
        cy.get("#rc-modal-descr").contains(
            "Deseja realmente iniciar o pedido?"
        );
        cy.get("#rc-modal-descr").contains("Não").click();
        cy.get(".pedido-resumo-page > :nth-child(3)")
            .find("button")
            .contains("Pedido Manual")
            .should("be.visible")
            .click();
        modalIsVisible();
        cy.get("#rc-modal-title").contains("Pedido");
        cy.get("#rc-modal-descr").contains(
            "Deseja realmente iniciar o pedido?"
        );
        cy.get("#rc-modal-descr").contains("Não").click();
    },
};

export function clicarEmComponenteModalEnviarPedido(contains) {
    cy.get("#rc-modal-descr").should("be.visible").contains(contains).click();
}
