import { validatePresence } from "ember-changeset-validations/validators";

export default {
  name: validatePresence(true),
  startingObject: validatePresence(true),
};
