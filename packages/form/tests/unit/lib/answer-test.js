import { setupTest } from "ember-qunit";
import { module, test } from "qunit";

module("Unit | Library | answer", function (hooks) {
  setupTest(hooks);

  test("it works", async function (assert) {
    assert.expect(1);

    const answer = new (this.owner.factoryFor("caluma-model:answer").class)({
      raw: {
        __typename: "StringAnswer",
        stringValue: "test",
      },
      field: {},
      owner: this.owner,
    });

    assert.strictEqual(answer.value, "test");
  });

  test("it computes a pk", async function (assert) {
    assert.expect(3);

    const newAnswer = new (this.owner.factoryFor("caluma-model:answer").class)({
      raw: {
        __typename: "StringAnswer",
      },
      field: {},
      owner: this.owner,
    });

    assert.strictEqual(newAnswer.pk, null);

    const existingAnswer = new (this.owner.factoryFor(
      "caluma-model:answer"
    ).class)({
      raw: {
        __typename: "StringAnswer",
        id: btoa("Answer:xxxx-xxxx"),
      },
      field: {},
      owner: this.owner,
    });

    assert.strictEqual(existingAnswer.uuid, "xxxx-xxxx");
    assert.strictEqual(existingAnswer.pk, "Answer:xxxx-xxxx");
  });

  test("it generates documents for table answers", async function (assert) {
    assert.expect(3);

    const answer = new (this.owner.factoryFor("caluma-model:answer").class)({
      field: {
        document: {
          jexlContext: {
            form: "parent-form",
          },
        },
      },
      raw: {
        __typename: "TableAnswer",
        tableValue: [
          {
            __typename: "Document",
            id: btoa("Document:xxxx-xxxx"),
            form: {
              __typename: "Form",
              slug: "table",
              questions: {
                edges: [
                  {
                    node: {
                      __typename: "TextQuestion",
                      slug: "frage",
                      isHidden: "false",
                      isRequired: "false",
                    },
                  },
                ],
              },
            },
            answers: {
              edges: [
                {
                  node: {
                    __typename: "StringAnswer",
                    stringValue: "test",
                    id: btoa("Answer:yyyy-yyyy"),
                    question: {
                      slug: "frage",
                    },
                  },
                },
              ],
            },
          },
        ],
      },
      owner: this.owner,
    });

    assert.strictEqual(answer.value[0].pk, "Document:xxxx-xxxx");
    assert.deepEqual(answer.serializedValue, ["xxxx-xxxx"]);

    assert.deepEqual(
      answer.value[0].jexlContext,
      { form: "parent-form" },
      "JEXL context of the table rows do not match the parent documents context"
    );
  });
});
