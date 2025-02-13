describe('Navigationstests', () => {
  // TC0009
  it('Besucht die Startseite der App, klickt auf den Button und prüft, ob die Navigationsseite aufgerufen wurde..', () => {
    cy.visit('/home');
    cy.get('#overview-button').should('be.visible').click();
    cy.url().should('include', 'navigation');
  });

  // TC0010
  it('Besucht die Navigationsseite der App, klickt auf den Button Mensaplan und prüft, ob die Mensa Seite aufgerufen wurde..', () => {
    cy.visit('/navigation');
    cy.get('#0').should('be.visible').click();
    cy.url().should('include', '/meals');
  });

  // TC0011
  it('Besucht die Navigationsseite der App, klickt auf den Button Semestertermine und prüft, ob die Semester Seite aufgerufen wurde..', () => {
    cy.visit('/navigation');
    cy.get('#1').should('be.visible').click();
    cy.url().should('include', '/semester');
  });

  // TC0012
  it('Besucht die Navigationsseite der App, klickt auf den Button Lagepläne und prüft, ob die Gebäudeplan  Seite aufgerufen wurde..', () => {
    cy.visit('/navigation');
    cy.get('#2').should('be.visible').click();
    cy.url().should('include', '/locations');
  });

  // TC0013
  it('Besucht die Navigationsseite der App, klickt auf den Button Fachbereichstermine und prüft, ob die Fachbereichsseite aufgerufen wurde..', () => {
    cy.visit('/navigation');
    cy.get('#3').should('be.visible').click();
    cy.url().should('include', '/departments');
  });

  // TC0014
  it('Besucht die Navigationsseite der App, klickt auf den Button Prüfungsplan und prüft, ob die Prüfungsplan Seite aufgerufen wurde..', () => {
    cy.visit('/navigation');
    cy.get('#4').should('be.visible').click();
    cy.url().should('include', '/vpisPruefungsplaene');
  });

  // TC0015
  it('Besucht die Navigationsseite der App, klickt auf den Button Veranstaltungsplan und prüft, ob die Veranstaltungsplan Seite aufgerufen wurde..', () => {
    cy.visit('/navigation');
    cy.get('#6').should('be.visible').click();
    cy.url().should('include', '/vpisPlaner');
  });

  // TC0016
  it('Ruft die Loginseite auf und versucht sich mit gültigen Credentials einzuloggen. Danach wird Meine Prüfungen Button auf Navigation angeklickt und dorthin navigiert.', () => {
    navigateWithLogin('#exam-button', '/exams');
  });

  // TC0017
  it('Ruft Meine Prüfungen über URL und ohne Login auf.', () => {
    navigateWithURL('/exams');
  });

  // TC0018
  it('Ruft Meine Prüfungen und Notenspiegel mit Login auf.', () => {
    cy.visit('/login');
    cy.get('#username').type(Cypress.env('USERNAME'));
    cy.get('#password').type(Cypress.env('PASSWORD'));
    cy.get('#login').click();
    cy.on('window:alert', (text) => {
      expect(text).to.equal('Sie sind jetzt eingeloggt!');
    });
    cy.url({ timeout: 20000 }).should('include', '/navigation');
    cy.get('#navigation-content').then(($content) => {
      $content[0].scrollToBottom(); // Native Ionic-Methode
    });
    cy.get('#exam-button').should('be.visible').click();
    cy.get('#results').should('exist').and('be.visible').click();
    cy.url().should('include', '/exams/results');
  });

  // TC0019
  it('Ruft Notenspiegel über URL und ohne Login auf.', () => {
    navigateWithURL('/exams/results');
  });

  // TC0020
  it('Ruft Meine Prüfungen und Angemeldete Prüfungen mit Login auf.', () => {
    cy.visit('/login');
    cy.get('#username').type(Cypress.env('USERNAME'));
    cy.get('#password').type(Cypress.env('PASSWORD'));
    cy.get('#login').click();
    cy.on('window:alert', (text) => {
      expect(text).to.equal('Sie sind jetzt eingeloggt!');
    });
    cy.url({ timeout: 20000 }).should('include', '/navigation');
    cy.get('#navigation-content').then(($content) => {
      $content[0].scrollToBottom(); // Native Ionic-Methode
    });
    cy.get('#exam-button').should('be.visible').click();
    cy.get('#registered').should('exist').and('be.visible').click();
    cy.url().should('include', '/exams/registered');
  });

  // TC0021
  it('Ruft Angemeldete Prüfungen über URL und ohne Login auf.', () => {
    navigateWithURL('/exams/registered');
  });

  // TC0022
  it('Ruft Studieninformationen mit Login auf.', () => {
    navigateWithLogin('#information-button', '/PersonalInformation');
  });

  // TC0023
  it('Ruft Studieninformationen über URL und ohne Login auf.', () => {
    navigateWithURL('/PersonalInformation');
  });

  // TC0024
  it('Ruft Rückmeldung mit Login auf.', () => {
    navigateWithLogin('#feedback-button', 'payReport');
  });

  // TC0025
  it('Ruft Rückmeldung über URL und ohne Login auf.', () => {
    navigateWithURL('/payReport');
  });

  // TC0026
  it('Ruft Nachrichten mit Login auf.', () => {
    navigateWithLogin('#news-button', '/news');
  });

  // TC0027
  it('Ruft Nachrichten über URL und ohne Login auf.', () => {
    navigateWithURL('/news');
  });

  // TC0028
  it('Ruft Wochenplan mit Login auf.', () => {
    navigateWithLogin('#calendar-button', '/calendar');
  });

  // TC0029
  it('Ruft Wochenplan über URL und ohne Login auf.', () => {
    navigateWithURL('/calendar');
  });

  // TC0030
  it('Ruft Startseite auf, klickt auf Navigation, navigiert zu Navigationsseite.', () => {
    cy.visit('/home');
    cy.get('#toolbar').within(() => {
      cy.get('#navigation-button', { timeout: 10000 }).should('be.visible').click();
    });
    cy.url().should('include', '/navigation');
  });

  // TC0030
  it('Ruft Startseite auf, klickt auf Navigation, navigiert zu Navigationsseite.', () => {
    cy.visit('/home');
    cy.get('#toolbar').within(() => {
      cy.get('#login-button', { timeout: 10000 }).should('be.visible').click();
    });
    cy.url().should('include', '/login');
  });


});

const navigateWithLogin = (element, url) => {
  cy.visit('/login');
  cy.get('#username').type(Cypress.env('USERNAME'));
  cy.get('#password').type(Cypress.env('PASSWORD'));
  cy.get('#login').click();
  cy.on('window:alert', (text) => {
    expect(text).to.equal('Sie sind jetzt eingeloggt!');
  });
  cy.url({ timeout: 20000 }).should('include', '/navigation');
  cy.get('#navigation-content').then(($content) => {
    $content[0].scrollToBottom(); // Native Ionic-Methode
  });
  cy.get(element).should('be.visible').click();
  cy.url().should('include', url);
}

const navigateWithURL = (url) => {
  cy.visit(url);
  cy.url().should('include', '/navigation');
}
