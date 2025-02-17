describe('Login Tests', () => {
    // TC0001
    it('Ruft die Loginseite auf und versucht sich mit gültigen Credentials einzuloggen.', () => {
        cy.visit('/login');
        cy.get('#username').type(Cypress.env('USERNAME'));
        cy.get('#password').type(Cypress.env('PASSWORD'));
        cy.get('#login').click();
        cy.on('window:alert', (text) => {
            expect(text).to.equal('Sie sind jetzt eingeloggt!');
        });
        cy.url({ timeout: 20000 }).should('include', '/navigation');
    });

    // TC0002
    it('Ruft die Loginseite auf und versucht sich einzuloggen, ohne ein Feld auszufüllen.', () => {
        cy.visit('/login');
        cy.get('#login').click();
        cy.get('.error-message').should('be.visible');
        cy.get('.error-message').should('have.text', 'Bitte füllen Sie alle Felder aus.');
    });

    // TC0003
    it('Ruft die Loginseite auf und versucht sich nur mit Benutternamen einzuloggen', () => {
        cy.visit('/login');
        cy.get('#username').type('user');
        cy.get('#login').click();
        cy.get('.error-message').should('be.visible');
        cy.get('.error-message').should('have.text', 'Bitte füllen Sie alle Felder aus.');
    });

    // TC0004
    it('Ruft die Loginseite auf und versucht sich nur mit Passwort einzuloggen, ohne ein Feld auszufüllen.', () => {
        cy.visit('/login');
        cy.get('#password').type('password');
        cy.get('#login').click();
        cy.get('.error-message').should('be.visible');
        cy.get('.error-message').should('have.text', 'Bitte füllen Sie alle Felder aus.');
    });

    // TC0005
    it('Ruft die Loginseite auf und versucht sich mit ungültigem Benutzernamen einzuloggen.', () => {
        cy.visit('/login');
        cy.get('#username').type('user');
        cy.get('#password').type(Cypress.env('PASSWORD'));
        cy.get('#login').click();
        cy.get('#loading').should('be.visible');
        cy.get('.error-message').should('be.visible');
        cy.get('.error-message').should('have.text', 'Ein Fehler ist aufgetreten oder Falscher Benutzername / falsches Passwort. Bitte versuchen Sie es später erneut.');
    });

    // TC0006
    it('Ruft die Loginseite auf und versucht sich mit ungültigem Passwort einzuloggen.', () => {
        cy.visit('/login');
        cy.get('#username').type(Cypress.env('USERNAME'));
        cy.get('#password').type('password');
        cy.get('#login').click();
        cy.get('.error-message', { timeout: 10000 }).should('be.visible');
        cy.get('.error-message').should('have.text', 'Ein Fehler ist aufgetreten oder Falscher Benutzername / falsches Passwort. Bitte versuchen Sie es später erneut.');
    })

    // TC0007
    it('Ruft die Loginseite auf und versucht sich mit ungültigem Benutzernamen und ungültigem Passwort einzuloggen.', () => {
        cy.visit('/login');
        cy.get('#username').type('user');
        cy.get('#password').type('password');
        cy.get('#login').click();
    })

    // TC0008
    it('Ruft die Loginseite auf und versucht sich mit gültigen Credentials einzuloggen und sich anschließend wieder auszuloggen..', () => {
        cy.visit('/login');
        cy.get('#username').type(Cypress.env('USERNAME'));
        cy.get('#password').type(Cypress.env('PASSWORD'));
        cy.get('#login').click();
        cy.on('window:alert', (text) => {
            expect(text).to.equal('Sie sind jetzt eingeloggt!');
        });

        cy.url({ timeout: 20000 }).should('include', '/navigation');
        cy.get('#toolbar').within(() => {
            cy.get('#logout-button', { timeout: 10000 }).should('be.visible').click();
        });
        cy.on('window:alert', (text) => {
            expect(text).to.equal('Sie wurden vom VSC, HSP und VPIS ausgeloggt.');
        });


    })

});
