/// <reference types="cypress" />

describe("VPIS Tests", () => {
  const baseUrl = "http://localhost:3000/api/vpis";

  // Test: Falsche Zugangsdaten -> sollte fehlschlagen
  it("Login mit falschen Credentials sollte fehlschlagen", () => {
    cy.request({
      method: "POST",
      url: `${baseUrl}/login`,
      body: { username: "falsch", password: "gaaanzFalsch" },
      failOnStatusCode: false, // Verhindert, dass Cypress bei Fehlern sofort abbricht
    }).then((resp) => {
      // Beispiel: Dein Server liefert bei falschen Credentials
      // einen HTTP-Status 500 und { message: "Login failed" }.
      expect(resp.status).to.eq(500);
      expect(resp.body).to.have.property("message", "Login failed");
    });
  });

  // Tests, die einen erfolgreichen Login benötigen
  context("Authentifizierte Tests", () => {
    // beforeEach: Wird vor jedem Test in diesem context-Block ausgeführt.
    beforeEach(() => {
      // Einmaliger Login-Aufruf:
      cy.request("POST", `${baseUrl}/login`, {
        username: "user",
        password: "pass",
      }).then((loginResp) => {
        expect(loginResp.status).to.eq(200);
        expect(loginResp.body).to.have.property("message", "SUCCESS");
      });
    });

    // /news nach erfolgreichem Login abrufen
    it("sollte Nachrichten (scrapeMyNews) nach Login abrufen können", () => {
      // Dank cy.session() sind wir hier bereits eingeloggt
      cy.request("GET", `${baseUrl}/news`).then((resp) => {
        expect(resp.status).to.eq(200);
        expect(resp.body).to.have.property("messages");
        expect(resp.body.messages).to.be.an("array");
      });
    });

    // Logout-Test
    it("sollte sich erfolgreich ausloggen können", () => {
      cy.request("GET", `${baseUrl}/logout`).then((resp) => {
        // Beispiel: { message: "VPIS: Erfolgreich ausgeloggt." }
        expect(resp.status).to.eq(200);
        expect(resp.body).to.have.property("message");
      });
    });

    // Nach Logout erneut /news aufrufen -> erwartet 401
    it("sollte nach Logout keine Nachrichten mehr abrufen können (401)", () => {
      // Erst ausloggen
      cy.request("GET", `${baseUrl}/logout`).then((logoutResp) => {
        expect(logoutResp.status).to.eq(200);

        // Dann /news aufrufen -> erwartet 401
        cy.request({
          method: "GET",
          url: `${baseUrl}/news`,
          failOnStatusCode: false,
        }).then((resp) => {
          expect(resp.status).to.eq(401);
          // Beispiel: { message: "Nicht eingeloggt. Bitte zuerst anmelden." }
          expect(resp.body).to.have.property("message");
        });
      });
    });
  });
});