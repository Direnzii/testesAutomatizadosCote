import { clicarEmBotaoPedidoGerado } from "../utils/utils";
import { URL_AUTH_DEMO, PEDIDOMANUAL } from "../utils/envVariaveis";
import * as pedidoAuto from "../pedidoAutomatico/pedidoAutomatico";
import {
    clicarNasChecks,
    marcarTodasCheckboxItem,
} from "./checkBoxPedidoManual";

export function acessarPedidoManualTodosProdutos() {
    pedidoAuto.marcarCheckTodos();
    cy.get(".MuiButtonBase-root").contains("Ver Respostas Por Produto").click();
    cy.wait(2000);
}

export function desmarcarSwitch() {
    cy.intercept({
        method: "GET",
        url: `${URL_AUTH_DEMO}/pedidomanual/total/${PEDIDOMANUAL}`,
    }).as("total");
    cy.wait("@total").its("response.statusCode").should("eq", 200);
    cy.get('[class="switch"]')
        .find("input")
        .invoke("attr", "aria-checked")
        .then((estadoSwitch) => {
            if (estadoSwitch === "true") {
                cy.get('[class="switch"]').click().wait(1000);
            }
        });
}

export function verificarElementos() {
    desmarcarSwitch();
    cy.get('[class="MuiAccordion-region"]').then((filtrarProdutos) => {
        cy.get(filtrarProdutos)
            .find("input")
            .first()
            .should("be.visible")
            .type("Test input produto");
        cy.get(filtrarProdutos)
            .find('select[name="cnpj"]')
            .should("be.visible")
            .find("option")
            .each((_, idxSelect) => {
                cy.get('select[name="cnpj"]')
                    .should("be.visible")
                    .select(idxSelect);
            }); //select de filial
        cy.get(filtrarProdutos)
            .find('select[name="cnpjFornecedor"]')
            .should("be.visible")
            .find("option")
            .each((_, idxSelect) => {
                cy.get('select[name="cnpjFornecedor"]')
                    .should("be.visible")
                    .select(idxSelect);
            }); //select de filial
        cy.get(filtrarProdutos)
            .find("#respostaSemQuantidade")
            .should("be.visible")
            .click()
            .click();
        cy.get(filtrarProdutos)
            .find("#semRespostaSelecionada")
            .should("be.visible")
            .click()
            .click();
        cy.get(filtrarProdutos)
            .find("#respostaComOportunidade")
            .should("be.visible")
            .click()
            .click();
    });
    cy.get("#naoRespondidos").should("be.visible");
    cy.get(
        '[class*="MuiButtonBase-root MuiAccordionSummary-root Mui-expanded"]'
    )
        .eq(1)
        .should("be.visible")
        .click()
        .wait(500)
        .click();
    cy.get('[class="icon-button icon-button-save "]')
        .should("be.visible")
        .click(); // botao salvar placebo
    cy.get('[class*="pedido-manual-top MuiBox-root"]')
        .contains("Total dos Pedidos:")
        .should("be.visible"); // checar de o texto esta certo
    cy.get('[data-testid="CachedIcon"]').should("be.visible").click(); // icone de reload do total
    cy
        .get('[class*="table-pedido-manual-body--row resposta branco"]')
        .first()
        .find('[class*="table-pedido-manual-body--row--column"]')
        .eq(4)
        .find("input")
        .type("999").enter;
    cy.intercept({
        method: "GET",
        url: `${URL_AUTH_DEMO}/pedidomanual/marcarResposta/*`,
    }).as("marcarResposta");
    cy.get('[class="table-pedido-manual"]')
        .find("input")
        .first()
        .uncheck() // desmarcar
        .wait(250)
        .check() // marcar checkbox geral do pedido
        .wait("@marcarResposta")
        .its("response.statusCode")
        .should("eq", 200);
    cy.get('[data-testid="CachedIcon"]').should("be.visible"); // verificar se o reload apareceu novamente
    cy.get('[class*="pedido-manual-top MuiBox-root"]')
        .contains("Visualizar Agrupado")
        .should("be.visible");
    cy.get('[class="switch"]').should("be.visible").click().wait(700).click();
}

export function confirmarTelaManualCerta() {
    cy.get('[class="pedido-manual"]').then((pedidoManual) => {
        let verPedido = pedidoManual
            .get(0)
            .querySelector("button.MuiButtonBase-root:nth-child(3)");
        if (verPedido) {
            cy.get('[class="pedido-manual"]')
                .find("button")
                .contains("Ver Pedidos")
                .click();
            pedidoAuto.marcarCheckTodos();
            cy.get("button").contains("Ver Respostas Por Produto").click();
        }
    });
}

export function validarExcluscaoInsercaoItem() {
    cy.get('[class="table-pedido-manual-body"]').then((listObjtProduto) => {
        let indexRandom = Math.floor(
            Math.random() * listObjtProduto.length // randomizo um index para pegar um produto aleatorio dentro da modal
        );
        cy.get('[class="table-pedido-manual-body"]')
            .eq(indexRandom)
            .then((produtoSorteado) => {
                let eanExcluido = produtoSorteado
                    .get(0)
                    .querySelector(
                        '[class="table-pedido-manual-body--row produto"]'
                    )
                    .children[1].querySelector("span").textContent;
                cy.get(produtoSorteado)
                    .find('[class="table-pedido-manual-body--row produto"]')
                    .find('[type="checkbox"]')
                    .invoke("prop", "checked")
                    .then((isChecked) => {
                        if (!isChecked) {
                            clicarNasChecks(produtoSorteado, true, false);
                        }
                        cy.get(produtoSorteado)
                            .find(
                                '[class="table-pedido-manual-body--row produto"]'
                            )
                            .find('[type="checkbox"]')
                            .click();
                        cy.wait(1500);
                        clicarEmBotaoPedidoGerado("Inserir no Pedido");
                        cy.get('[class*="MuiButtonBase-root "]')
                            .contains("Ver Produtos Excluidos")
                            .should("be.visible")
                            .click(); // entrar na aba produtos excluidos
                        cy.get('[class="table-pedido-manual-body"]')
                            .first()
                            .find(
                                '[class="table-pedido-manual-body--row produto"]'
                            )
                            .contains(eanExcluido)
                            .should("be.visible");
                        desmarcarSwitch();
                        marcarTodasCheckboxItem();
                        clicarEmBotaoPedidoGerado("Inserir no Pedido");
                        pedidoAuto.marcarCheckTodos();
                        cy.get("button")
                            .contains("Ver Respostas Por Produto")
                            .click();
                        cy.get('[class="table-pedido-manual"]')
                            .contains(eanExcluido)
                            .should("be.visible");
                    });
            });
    });
}

export function gerarPedidoManualConfirmar() {
    clicarEmBotaoPedidoGerado("Inserir no Pedido");
    clicarEmBotaoPedidoGerado("Confirmar Pedido");
}
