import except from "../utils/except";

export function clicarNasChecks(
    produtoSorteado,
    nivelItem = false,
    primeiraResposta = false
) {
    except();
    if (nivelItem) {
        cy.get(produtoSorteado).find('[type="checkbox"]').first().click();
    }
    if (primeiraResposta) {
        cy.get(produtoSorteado).find('[type="checkbox"]').eq(1).click();
    }
}

export function marcarTodasCheckboxItem() {
    cy.get('[class="table-pedido-manual-body--row produto"]').each(
        (linhaItem) => {
            cy.get(linhaItem)
                .find('[type="checkbox"]')
                .invoke("prop", "checked")
                .then((statusCheck) => {
                    if (!statusCheck) {
                        cy.get(linhaItem)
                            .find('[type="checkbox"]')
                            .click()
                            .wait(700);
                    }
                });
        }
    );
}
