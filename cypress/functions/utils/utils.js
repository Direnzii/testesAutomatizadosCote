import * as utils from "../utils/utils";
import * as reset from "../utils/resetarCotacao.js";
import * as modal from "../utils/validarModais";
import * as pedidoAuto from "../pedidoAutomatico/pedidoAutomatico";
import {
    CLIENTE_USUARIO,
    CLIENTE_SENHA,
    URL_AMPLIFY,
    URL_AUTH_DEMO,
    URL_API_TESTES,
    ROTA_COTACAO_EM_ANALISE,
} from "./envVariaveis.js";
import * as login from "../login/login";

export function acessarProcessarPedido(botao, cotacao) {
    login.login(CLIENTE_USUARIO, CLIENTE_SENHA, URL_AMPLIFY);
    login.acessandoCotacao(cotacao);
    reset.reiniciarCompletamenteCotacao(botao, cotacao);
    utils.encerrarCotacao(cotacao);
    utils.processarPedido(botao, cotacao);
}

export function logarAcessarReiniciarCotacao(cotacao) {
    login.login(CLIENTE_USUARIO, CLIENTE_SENHA, URL_AMPLIFY);
    login.acessandoCotacao(cotacao);
    reset.reiniciarCompletamenteCotacao(false, cotacao);
}

export function confirmarPedido() {
    cy.get(".content").find("button").contains("Confirmar Pedido").click();
}

export function encerrarCotacao(cotacao) {
    cy.intercept({
        method: "GET",
        url: `${URL_AUTH_DEMO}/resumoresposta/getBotoes/${cotacao}`,
    }).as("getBotoes"); // intercepto a request da modal de loading do pedido
    cy.get("button").contains("Encerrar cotação").should("be.visible").click(); //encerrar cotação
    cy.get("button").contains("Exportar Produtos").should("be.visible"); //exportar produtos
    cy.get("button").contains("Cancelar Cotação").should("be.visible"); //cancelar cotacao
    cy.get("button").contains("Alterar Vencimento").should("be.visible"); //alterar vencimento
    cy.get("button")
        .contains("Ver Produtos Não Respondidos")
        .should("be.visible"); //ver produtos nao respondidos
    cy.get("button").contains("Pedido Automático").should("be.visible"); //pedido automatico
    cy.get("button").contains("Pedido Manual").should("be.visible"); //pedido manual
    cy.wait("@getBotoes").its("response.statusCode").should("eq", 200);
}

export function interceptRequest(metodo, url, status) {
    let alias = `api${url}`;
    cy.intercept({
        method: `${metodo}`,
        url: url,
    }).as(`api${url}`);
    cy.wait(`@${alias}`).its("response.statusCode").should("eq", status);
}

export function processarPedido(botao, cotacao) {
    cy.get("button").contains(botao).should("be.visible").click(); //botao pedido automatico para abrir a modal de confirmação
    modal.modalIsVisible();
    cy.intercept({
        method: "GET",
        url: `${URL_AUTH_DEMO}/pedido/${cotacao}/generate*`,
    }).as("generate"); // intercepto a request da modal de loading do pedido
    cy.get("#rc-modal-descr").find("button").contains("Sim").click();
    cy.wait("@generate").its("response.statusCode").should("eq", 200); // checo se ja finalizou a request, botao sim da modal
    cy.get('[class="MuiAccordion-region"]').should("be.visible");
    cy.get('[class="MuiAccordion-region"]')
        .find("input")
        .first()
        .type("Escrevendo qualquer coisa para carregar a pagina");
    cy.get('[class="MuiAccordion-region"]').find("input").first().clear();
    if (botao === "Pedido Manual") {
        cy.get('input[role="switch"]')
            .invoke("attr", "aria-checked")
            .then((boolSwith) => {
                boolSwith === "true" && cy.get(".react-switch-bg").click();
            });
    }
}

export function clicarEmBotaoPedidoGerado(contains) {
    cy.get('[class*="MuiButtonBase-root "]')
        .contains(contains)
        .should("be.visible")
        .click(); // inserir no pedido e voltar para o pedido auto
}

export function enviarPedidoSemLooping() {
    clicarEmBotaoPedidoGerado("Enviar Pedidos");
    modal.modalIsVisible();
    modal.clicarEmComponenteModalEnviarPedido("Enviar sem looping");
    checarAvisoRevisaoEnvio("Pedidos enviados com sucesso.");
}

export function checarAvisoRevisaoEnvio(aviso) {
    cy.get("#alert").contains(aviso).should("be.visible");
    cy.get('[data-testid="CloseIcon"]').click();
}

export function deletarPedidosMudarParaEmAnalise(cotacao) {
    cy.request("POST", `${URL_API_TESTES}${ROTA_COTACAO_EM_ANALISE}`, {
        idcotacao: cotacao,
    });
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.reload(true);
}

export function checarTextosSobrepostos(tela, cotacao) {
    if (tela === "pedido") {
        cy.get('[class*="nomeFantasia MuiBox-root "]').each(
            (acordeonCliente) => {
                cy.get(acordeonCliente).click();
            }
        );
        cy.get('[data-testid="conteudo-tabela-row"]').each((linha) => {
            cy.get(linha)
                .find('[data-testid="conteudo-tabela-cell"]')
                .each((celula, indxCelula) => {
                    if (
                        indxCelula === 5 ||
                        indxCelula === 6 ||
                        indxCelula === 10
                    ) {
                        // aqui eu pego apenas as colunas de eans e descricao
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
    } else if (tela === "resumo") {
        cy.get('[data-testid="bloco-resposta-representante"]').each(
            (blocoRespsota) => {
                cy.get(blocoRespsota).click();
            }
        );
        cy.get('[data-testid="conteudo-tabela-row"]').each((linha) => {
            cy.get(linha)
                .find('[data-testid*="conteudo-tabela-codigoMotivo-"]')
                .each((celula) => {
                    cy.get(celula);
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
                });
        });
    } else if (tela === "revisaoEnvio") {
        cy.intercept({
            method: "POST",
            url: `${URL_AUTH_DEMO}/pedidoAutomatico/*/itens*`,
        }).as("itens");
        cy.get("#painel-enviados")
            .find('[class="MuiAccordion-region"]')
            .find('[class="MuiAccordion-region"]')
            .find(
                '[class*="MuiPaper-root MuiPaper-elevation MuiPaper-elevation0 MuiAccordion-root "]'
            )
            .each((acordeonCliente) => {
                cy.get(acordeonCliente)
                    .click()
                    .wait("@itens")
                    .its("response.statusCode")
                    .should("eq", 200);
                cy.get("#painel-enviados")
                    .find('[data-testid="conteudo-tabela-row"]')
                    .find('[data-testid="conteudo-tabela-cell"]')
                    .each((celula, indxCelula) => {
                        if (indxCelula === 5 || indxCelula === 6) {
                            // aqui eu pego apenas as colunas de eans e descricao
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
    } else if (tela === "pedidoManual") {
        cy.intercept({
            method: "GET",
            url: `${URL_AUTH_DEMO}/pedidomanual/total/${cotacao}`,
        }).as("total");
        cy.wait(2000);
        cy.wait("@total").its("response.statusCode").should("eq", 200);
        cy.get('[class="table-pedido-manual-body"]')
            .find('[class="table-pedido-manual-body--row produto"]')
            .each((linhaItem) => {
                cy.get(linhaItem)
                    .find("div")
                    .each((celulaLinhaItem, indx) => {
                        let larguraCelula = celulaLinhaItem.width() + 6;
                        if (indx === 3 || indx === 4) {
                            cy.get(celulaLinhaItem)
                                .find("span")
                                .each((celulaLinhaItemSpan) => {
                                    let textoSpan = celulaLinhaItemSpan.text();
                                    let larguraDoTexto = Cypress.$(
                                        celulaLinhaItemSpan
                                    )
                                        .text(textoSpan)
                                        .width();
                                    expect(larguraCelula).to.be.greaterThan(
                                        larguraDoTexto
                                    );
                                });
                        }
                    });
            });
    } else if (tela === "pedidoManualResposta") {
        cy.wait(2000);
        cy.intercept({
            method: "GET",
            url: `${URL_AUTH_DEMO}/pedidomanual/total/${cotacao}`,
        }).as("total");
        cy.wait("@total").its("response.statusCode").should("eq", 200);
        cy.get('[class="table-pedido-manual-body"]')
            .find('[class="resposta-descricao"]')
            .each((celulaLinhaResposta) => {
                let larguraCelula = celulaLinhaResposta.width();
                cy.get(celulaLinhaResposta)
                    .find('[class="descricao"]')
                    .find("span")
                    .each((celulaLinhaRespostaSpan) => {
                        let textoSpan = celulaLinhaRespostaSpan.text();
                        let larguraDoTexto = Cypress.$(celulaLinhaRespostaSpan)
                            .text(textoSpan)
                            .width();
                        expect(larguraCelula).to.be.greaterThan(larguraDoTexto);
                    });
            });
    }
}

export function adicionarTodosProdutosExcluidos() {
    pedidoAuto.abrirTelaProdutosExcluidos();
    cy.wait(2000);
    cy.get('[class="MuiAccordion-region"]');
}
