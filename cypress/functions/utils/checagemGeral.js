function verificarCheckBox(blocoResposta) {
    cy.get(blocoResposta)
        .find('[data-testid="checkbox-resumo"]')
        .each((_, indx) => {
            cy.get(blocoResposta)
                .find('[data-testid="checkbox-resumo"]')
                .eq(indx)
                .invoke("prop", "checked")
                .then((comoEra) => {
                    cy.get(blocoResposta)
                        .find('[data-testid="checkbox-resumo"]')
                        .eq(indx)
                        .click()
                        .wait(1000);
                    if (comoEra === true) {
                        cy.get(blocoResposta)
                            .find('[data-testid="checkbox-resumo"]')
                            .eq(indx)
                            .invoke("prop", "checked")
                            .then((agora) => {
                                if (agora === true) {
                                    cy.fail(
                                        "Não alterou o estado da checkbox após o clique"
                                    );
                                }
                            });
                    } else {
                        cy.get(blocoResposta)
                            .find('[data-testid="checkbox-resumo"]')
                            .eq(indx)
                            .invoke("prop", "checked")
                            .then((agora) => {
                                if (agora === false) {
                                    cy.fail(
                                        "Não alterou o estado da checkbox após o clique"
                                    );
                                }
                            });
                    }
                });
        });
}

function compararSinalizadores(a, b) {
    if (a.length !== b.length) {
        cy.fail("Sinalizadores não batem");
    }
    const sortedA = a.slice().sort();
    const sortedB = b.slice().sort();
    const elements = [a, b];
    for (let i = 0; i < sortedA.length; i++) {
        if (sortedA[i] !== sortedB[i]) {
            cy.fail("Sinalizadores não batem");
        }
    }
}
