import { setupTest } from "ember-qunit";
import { module, test } from "qunit";

module("Unit | Route | reports/new", function (hooks) {
  setupTest(hooks);

  test("it exists", function (assert) {
    const route = this.owner.lookup("route:reports/new");
    assert.ok(route);
  });
});
