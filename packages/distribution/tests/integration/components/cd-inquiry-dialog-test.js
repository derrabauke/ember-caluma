import { click, render } from "@ember/test-helpers";
import confirm from "dummy/tests/helpers/confirm";
import { hbs } from "ember-cli-htmlbars";
import { setupMirage } from "ember-cli-mirage/test-support";
import { setupIntl } from "ember-intl/test-support";
import { setupRenderingTest } from "ember-qunit";
import { module, test } from "qunit";

import {
  answerInquiry,
  confirmInquiry,
  createBlueprint,
  createCase,
  createInquiry,
  sendInquiry,
} from "@projectcaluma/ember-testing/scenarios/distribution";

module("Integration | Component | cd-inquiry-dialog", function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(function () {
    createBlueprint(this.server);

    this.owner.lookup("service:caluma-options").currentGroupId = "group1";

    this.distributionCase = createCase(this.server, {
      group: { id: "group1" },
    });

    this.caseId = this.distributionCase.id;

    Object.defineProperty(this.owner.lookup("service:distribution"), "caseId", {
      value: this.caseId,
    });
  });

  test("it renders", async function (assert) {
    sendInquiry(this.server, {
      inquiry: createInquiry(this.server, this.distributionCase, {
        from: { id: "group1" },
        to: { id: "group2" },
      }),
    });
    confirmInquiry({
      inquiry: answerInquiry(this.server, {
        inquiry: createInquiry(this.server, this.distributionCase, {
          from: { id: "group1" },
          to: { id: "group2" },
        }),
      }),
    });
    confirmInquiry({
      inquiry: answerInquiry(this.server, {
        inquiry: createInquiry(this.server, this.distributionCase, {
          from: { id: "group1" },
          to: { id: "group2" },
        }),
      }),
    });

    await render(
      hbs`<CdInquiryDialog @from="group1" @to="group2" @caseId={{this.caseId}} />`
    );

    assert.dom("article").exists({ count: 3 });
    assert.dom(".inquiry-divider").exists({ count: 2 });
  });

  test("it can withdraw an inquiry", async function (assert) {
    assert.expect(4);

    createInquiry(this.server, this.distributionCase, {
      from: { id: "group1" },
      to: { id: "group2" },
    });
    createInquiry(this.server, this.distributionCase, {
      from: { id: "group1" },
      to: { id: "group2" },
    });

    await render(
      hbs`<CdInquiryDialog @from="group1" @to="group2" @caseId={{this.caseId}} />`
    );

    await click("[data-test-withdraw]");
    await confirm();

    assert
      .dom("[data-test-deadline]")
      .containsText("t:caluma.distribution.withdraw.status:()");

    this.owner.lookup("service:router").transitionTo = (route) => {
      assert.strictEqual(route, "index");
      assert.step("transition");
    };

    await click("[data-test-withdraw]");
    await confirm();

    assert.verifySteps(["transition"]);
  });

  test("it can create a new inquiry", async function (assert) {
    assert.expect(6);

    createInquiry(this.server, this.distributionCase, {
      from: { id: "group1" },
      to: { id: "group2" },
    });

    await render(
      hbs`<CdInquiryDialog @from="group1" @to="group2" @caseId={{this.caseId}} />`
    );

    this.owner.lookup("service:router").transitionTo = (
      route,
      { from, to },
      uuid
    ) => {
      assert.strictEqual(route, "inquiry.detail.index");
      assert.strictEqual(from, "group1");
      assert.strictEqual(to, "group2");
      assert.ok(uuid);
      assert.step("transition");
    };

    await click("[data-test-new-inquiry]");

    assert.verifySteps(["transition"]);
  });
});
