export default function except() {
    cy.on("uncaught:exception", (err, runnable) => {
        //criar funcao para except
        return false;
    }); // Existe um erro > Unexpected end of JSON input que não se trata de nada visual, são apenas erros que constam no console mas que o cy acusa, aqui eu excluo o erro
}
