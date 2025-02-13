import 'cypress-real-events/support';

describe('Allgemeine und sonstige Tests', () => {
    it('Ruft Mensa auf, klickt auf Optionen ausblenden und prüft, ob die Optionen unsichtbar sind.', () => {
        cy.visit('/meals', {
            onBeforeLoad(win) {
                cy.stub(win.navigator.geolocation, 'getCurrentPosition')
                    .callsFake((callback) => {
                        callback({ coords: { latitude: 51.3627892, longitude: 7.5631738 } }); // Beispiel: Berlin
                    });
            }
        });


        cy.url().should('include', '/meals');
        cy.get('#toggle-container').should('exist').and('be.visible');
        cy.get('#toggle').within(() => {
            cy.get('#custom-toggle', { timeout: 10000 }).should('be.visible').click();
        });
        cy.get('#toggle-container').should('not.exist');

        cy.get('#toggle').within(() => {
            cy.get('#custom-toggle', { timeout: 10000 }).should('be.visible').click();
        });
        cy.get('#toggle-container').should('exist').and('be.visible');
    });
});
