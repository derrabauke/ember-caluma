import { setupTest } from "ember-qunit";
import { module, test } from "qunit";

module("Unit | Controller | reports/edit/index", function (hooks) {
  setupTest(hooks);

  // TODO: Replace this with your real tests.
  test("it exists", function (assert) {
    const controller = this.owner.lookup("controller:reports/edit/index");
    assert.ok(controller);
  });
});
