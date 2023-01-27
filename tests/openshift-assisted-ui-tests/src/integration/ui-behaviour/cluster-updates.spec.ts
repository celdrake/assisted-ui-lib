import { navbar } from '../../views/navbar';
import { commonActions } from '../../views/common';

describe('Assisted Installer UI behaviour - cluster updates', () => {
  describe('Prevent invalid PATCH requests', () => {
    beforeEach(() => {
      cy.loadAiAPIIntercepts({
        activeSignal: 'READY_TO_INSTALL',
        activeScenario: 'AI_CREATE_MULTINODE',
      });
      commonActions.visitClusterDetailsPage();
    });

    afterEach(() => {
      Cypress.env('AI_FORBIDDEN_CLUSTER_PATCH', false);
    });

    it('Should not update a cluster when no changes were done by the user', () => {
      Cypress.env('AI_FORBIDDEN_CLUSTER_PATCH', true);

      navbar.clickOnNavItem('Cluster details');
      commonActions.clickNextButton();
      commonActions.clickNextButton();
      commonActions.getHeader('h2').should('contain', 'Host discovery');
    });
  });
});
