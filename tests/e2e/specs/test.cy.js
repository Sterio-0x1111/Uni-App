describe('Test Titel', () => {
  it('Besucht die Startseite der App und prüft den Titel.', () => {
    cy.visit('/home');
    cy.title().should('include', 'Ionic App');
  });
});
