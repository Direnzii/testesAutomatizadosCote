import except from "../utils/except";

function adicionarIdCotacaoInput(cotacao) {
    cy.get("#cod").clear();
    cy.get("#cod").type(cotacao);
    cy.get("#cod")
        .invoke("val")
        .then((inputCotacao) => {
            if (cotacao != inputCotacao) {
                cy.get("#cod").click();
                cy.get("#cod").type(cotacao);
            }
        });
}

export function login(usuario, senha, url, amplify = true) {
    // quando a base for direto pelo amplify
    if (amplify === true) {
        cy.loginAmplify(usuario, senha, url);
    } else {
        // se nao for o amplify, o padrão é que seja o demo default
        cy.loginLogan(usuario, senha, url);
    }
}

export function login_incorreto(usuario, senha, url) {
    cy.loginLogan(usuario, senha, url);
    cy.get(".mensagem_erro").contains("Usuário ou senha incorretos");
}

export function acessandoCliente(usuario) {
    cy.get("#mnTopo > .tab_label_true").should("be.visible");
    cy.get(":nth-child(1) > :nth-child(2) > input")
        .should("be.visible")
        .type(usuario);
    cy.get("#pesquisarUsuarios\\:btnPesquisar").click();
    cy.get("a:contains(Logar)")
        .invoke("attr", "onclick")
        .then((onclick) => {
            const updatedOnclick = onclick.replace(/_blank/g, "_self"); // aqui eu troco o atribudo _blank do onclick para _self, para abrir na mesma aba
            cy.get("a:contains(Logar)")
                .invoke("attr", "onclick", updatedOnclick)
                .click();
        });
}

export function acessandoCotacao(cotacao, amplify = true) {
    if (amplify === true) {
        cy.get('[href="/cotacao"]').click();
        cy.get("button")
            .contains("CONSULTAR COTAÇÕES")
            .should("be.visible")
            .click();
        adicionarIdCotacaoInput(cotacao);
        cy.get("button").contains("Buscar").click();
        except();
        cy.get('[class="MuiAccordion-region"]')
            .find("thead")
            .eq(1)
            .find("a")
            .click();
    } else {
        cy.get("img")
            .filter('[src="/CTFLLogan-webapp/images/icons/cotacao_m.png"]')
            .should("be.visible");
        cy.get("img")
            .filter('[src="/CTFLLogan-webapp/images/icons/cotacao_m.png"]')
            .click();
        cy.get("input")
            .contains("Consultar Cotações")
            .should("be.visible")
            .click();
        cy.get("td").eq(12).find("input").should("be.visible").type(cotacao);
        cy.get('[class="botao3"]').should("be.visible").click();
        except();
        cy.get("[class=rich-table-cell]").eq(1).find("a").click();
    }
}

export function iFrameRogan() {
    cy.wait(5000);
    cy.iframe("#roganJsGeral")
        .as("iframe")
        .find('[class="pedido-resumo-page"]')
        .find("button")
        .contains("Ver Pedidos")
        .click();
    cy.screenshot();
}
