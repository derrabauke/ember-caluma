import { getOwner } from "@ember/application";
import Service, { inject as service } from "@ember/service";
import { queryManager, getObservable } from "ember-apollo-client";
import { dropTask } from "ember-concurrency";
import { trackedTask } from "ember-resources/util/ember-concurrency";

import { decodeId } from "@projectcaluma/ember-core/helpers/decode-id";
import config from "@projectcaluma/ember-distribution/config";
import createInquiryMutation from "@projectcaluma/ember-distribution/gql/mutations/create-inquiry.graphql";
import controlWorkItemsQuery from "@projectcaluma/ember-distribution/gql/queries/control-work-items.graphql";
import inquiryNavigationQuery from "@projectcaluma/ember-distribution/gql/queries/inquiry-navigation.graphql";

export default class DistributionService extends Service {
  @service("-scheduler") scheduler;
  @service calumaOptions;
  @service router;
  @service intl;
  @service notification;

  @queryManager apollo;

  @config config;

  get caseId() {
    return getOwner(this).lookup("route:application").currentModel;
  }

  controls = trackedTask(this, this.fetchControls, () => [this.caseId]);
  navigation = trackedTask(this, this.fetchNavigation, () => [this.caseId]);

  async refetch() {
    await getObservable(this.controls.value)?.refetch();
    await getObservable(this.navigation.value)?.refetch();
  }

  @dropTask
  *fetchControls(caseId) {
    return yield this.apollo.watchQuery({
      query: controlWorkItemsQuery,
      variables: {
        caseId,
        currentGroup: String(this.calumaOptions.currentGroupId),
        createTask: this.config.controls.createTask,
        completeTask: this.config.controls.completeTask,
        inquiryTask: this.config.inquiry.task,
      },
    });
  }

  @dropTask
  *fetchNavigation(caseId) {
    const response = yield this.apollo.watchQuery({
      query: inquiryNavigationQuery,
      variables: {
        caseId,
        task: this.config.inquiry.task,
        currentGroup: String(this.calumaOptions.currentGroupId),
        statusQuestion: this.config.inquiry.answer.statusQuestion,
        deadlineQuestion: this.config.inquiry.deadlineQuestion,
        includeNavigationData: true,
      },
    });

    getObservable(response).subscribe(({ data }) => {
      const groupIds = [
        ...new Set(
          Object.values(data)
            .map((inquiries) => {
              return inquiries.edges.map((edge) => [
                ...edge.node.addressedGroups,
                ...edge.node.controllingGroups,
              ]);
            })
            .flat(2)
        ),
      ];

      // Resolve all involved groups with the scheduler each time the query is
      // updated. This will only trigger requests for new groups that are not in
      // the cache.
      this.scheduler.resolve(groupIds, "group");
    });

    return response;
  }

  @dropTask
  *createInquiry(groups) {
    try {
      // get create inquiry work item to complete
      const createId = decodeId(this.controls.value?.create.edges[0].node.id);

      // create new inquiries
      yield this.apollo.mutate({
        mutation: createInquiryMutation,
        variables: {
          id: createId,
          context: JSON.stringify({
            addressed_groups: groups.map(String),
          }),
        },
      });

      // refetch navigation and controls data
      yield this.refetch();
    } catch (e) {
      this.notification.danger(
        this.intl.t("caluma.distribution.new.error", { count: groups.length })
      );
    }
  }
}
