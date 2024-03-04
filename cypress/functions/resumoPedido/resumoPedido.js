import * as modal from "../utils/validarModais.js";
import { botoesTelaResumoParaEncerrar } from "../utils/constants";
import {
    ROTA_EXCLUIR_REGISTROS,
    URL_API_TESTES,
} from "../utils/envVariaveis.js";

export function checagemElementosTelaResumoPrincipais() {
    cy.get('[data-testid="botoes-resumo-pedido"]')
        .find("button")
        .each((botao) => {
            if (!botoesTelaResumoParaEncerrar.includes(botao.text())) {
                cy.fail("Botão capturado não esta na lista, ERRO");
            }
        });
}

export function checagemElementosTelaResumoCategoria() {
    checagemDeCategoriaBotoes();
}

export function checagemElementosTelaResumoAcordeonCliente() {
    elementosEscritosAcordeonCliente();
}

export function checarDadosModalLupa(tipo, passarPorTodosOsBlocos) {
    let ok = false;
    cy.get('[data-testid="bloco-resposta-representante"]').each(
        (blocoResposta) => {
            // pegar a quantidade de "Visualizar respostar por filial"
            if (!ok) {
                let motivoResposta;
                cy.get(blocoResposta).click(); // abre o acordeon da resposta
                cy.get(blocoResposta)
                    .find('[data-testid="conteudo-tabela-row"]')
                    .each((linhaRespostaCliente) => {
                        // Se tiver algun sinalizador Sucess vai entrar acessar a lupa e fazer as validações
                        try {
                            motivoResposta = linhaRespostaCliente
                                .get(0)
                                .children[4].getAttribute("data-testid")
                                .split("-")[3]; // aqui eu pego exatamente o texto que esta na coluna Resposta do bloco para cada linha
                        } catch {
                            motivoResposta = "Aguardando"; // como o aguardando nao é um motivo valido, ele nao aparece com o atributo necessario, por isso consta aqui
                        }
                        if (motivoResposta === "Respondida") {
                            modal.abrirModalLupa(
                                blocoResposta,
                                linhaRespostaCliente
                            );
                            modal.realizarChecagemNaModal(tipo);
                        }
                    });
            }
            if (!passarPorTodosOsBlocos) {
                ok = true;
            }
        }
    );
}

function elementosEscritosAcordeonCliente() {
    cy.get('[data-testid="acordeon-cliente"]').each(
        (listAcordeonCliente, indx) => {
            // pegar a quantidade de acordeons cliente
            cy.get(listAcordeonCliente)
                .click()
                .wait(250)
                .get('[data-testid="interior-acordeon-cliente"]')
                .eq(indx)
                .find("span")
                .each((dadosAcordeonCliente) => {
                    if (
                        !dadosAcordeonCliente.get(0).textContent.split(":")[1]
                    ) {
                        // checar se tem algum dado vazio no acordeon
                        cy.fail(
                            "Existe algum elemento dentro do acordeon da filial sem nada, elemento index: " +
                                index
                        );
                    }
                });
            cy.get(listAcordeonCliente).click();
        }
    );
}

function checagemDeCategoriaBotoes() {
    cy.get('[data-rbd-droppable-id="droppable"]')
        .find("label")
        .then((listCategorias) => {
            cy.get(listCategorias).each((categoria, index) => {
                checagemDeRespostasCategoria(categoria.get(0).id, index);
            });
        });
}

function checagemDeRespostasCategoria(elemento, index) {
    let idCategoria = "#" + elemento;
    function scrollRight(posicaoCategoria) {
        if (posicaoCategoria >= 3) {
            // se o elemento estiver na posição 3 ou a cima, eu scrollo para a direita
            cy.get('[data-rbd-droppable-id="droppable"]')
                .scrollTo("right", { ensureScrollable: true })
                .wait(500);
        }
    }
    cy.get(idCategoria).then(($objCategoria) => {
        const win = $objCategoria[0].ownerDocument.defaultView;
        const pseudoElemento = win.getComputedStyle($objCategoria[0], "before");
        var contentValue = pseudoElemento.getPropertyValue("content"); // pegar o valor do pseudoElemento
        cy.get(idCategoria).click();
        scrollRight(index);
        if (contentValue === `"0"`) {
            // se o numero em cima da categoria for 0 quer dizer que nao tem resposta com esse sinalizador
            cy.get('[class="pedido-resumo-page"]')
                .find("div")
                .contains("Categoria selecionada não encontrada!")
                .should("be.visible");
            cy.get('[data-testid="WarningIcon"]').should("be.visible");
            cy.get(idCategoria).should("be.visible").click();
        } else {
            // quer dizer que existe resposta com esse sinalizador, logo deve ser verificado se corresponde ao mesmo sinalizador filtrado
            cy.get("[data-testid^=sinalizadores-bloco-]")
                .first()
                .then((check_sinalizador) => {
                    let sinalizador = check_sinalizador
                        .get(0)
                        .getAttribute("data-testid")
                        .split("-")[2]; // pego o id do sinalizados do bloco da resposta pelo datatestid
                    if (sinalizador != elemento) {
                        cy.fail(
                            "Sinalizador exibido ao filtrar é diferente do que foi clicado"
                        );
                    }
                });
            cy.get(idCategoria).should("be.visible").click();
        }
    });
}

export function checarTextosSobrepostosRespondidos() {
    checarDadosModalLupa("textoSobreposto", true);
}

export function checarSelectResumoResposta() {
    cy.get('[data-testid="select-itemsPorPagina"]')
        .find("option")
        .each((option) => {
            let valueOption = option.val(); // pegar o valor do option
            cy.wrap(option)
                .invoke("prop", "disabled")
                .then((valueOptionAtt) => {
                    // pegar o estado do option, se true entao quer dizer que esta desativado
                    if (!valueOptionAtt) {
                        cy.get('[data-testid="select-itemsPorPagina"]')
                            .select(valueOption)
                            .wait("@getFornecedores")
                            .then((query) => {
                                let depoisDeClicarSizeDaURL = query.response.url
                                    .split("&")[1]
                                    .split("=")[1];
                                if (valueOption !== depoisDeClicarSizeDaURL) {
                                    cy.fail(
                                        "Valor clicado no option é diferente do valor enviado na request"
                                    );
                                }
                            });
                    }
                });
        });
}

export function validarVerificarRespostaSinalizadores(cotacao) {
    cy.get('[data-testid="sinalizadores-bloco-success"]').should("be.visible");
    cy.request("POST", `${URL_API_TESTES}${ROTA_EXCLUIR_REGISTROS}`, {
        idcotacao: cotacao,
    });
    cy.get('[data-testid="botoes-resumo-pedido"]')
        .find("button")
        .contains("Verificar respostas")
        .click();
    cy.get('[data-testid="sinalizadores-bloco-success"]').should("be.visible");
}
