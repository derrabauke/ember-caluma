import { action } from "@ember/object";
import Component from "@glimmer/component";

export default class CaFieldSelectorListComonent extends Component {
  @action
  updateFieldPath(id, alias, path) {
    this.args.onUpdate({ id, alias, dataSource: path });
  }

  @action
  updateFieldDescription(field, props) {
    this.args.onUpdate({ ...field, ...props });
  }

  @action
  removeField(id) {
    this.args.onDelete({ id });
  }
}
