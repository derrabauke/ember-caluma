import { getOwner } from "@ember/application";
import merge from "lodash.merge";
import { cached } from "tracked-toolbox";

export const INQUIRY_STATUS = {
  DRAFT: "draft",
  SKIPPED: "skipped",
  SENT: "sent",
  POSITIVE: "positive",
  NEGATIVE: "negative",
  NEEDS_INTERACTION: "needs-interaction",
};

export default function config(target, property) {
  return cached(target, property, {
    get() {
      return merge(
        {
          ui: { stack: false, small: false, readonly: false },
          controls: {
            createTask: "create-inquiry",
            completeTask: "complete-distribution",
          },
          warningPeriod: 3,
          inquiry: {
            task: "inquiry",
            deadlineQuestion: "inquiry-deadline",
            infoQuestion: "inquiry-remark",
            answer: {
              statusQuestion: "inquiry-answer-status",
              infoQuestions: ["inquiry-answer-reason"],
              statusMapping: {
                "inquiry-answer-status-positive": INQUIRY_STATUS.POSITIVE,
                "inquiry-answer-status-negative": INQUIRY_STATUS.NEGATIVE,
                "inquiry-answer-status-needs-interaction":
                  INQUIRY_STATUS.NEEDS_INTERACTION,
              },
              buttons: {
                "compose-inquiry-answer": {
                  color: "primary",
                  label: "caluma.distribution.answer.buttons.compose.label",
                  status: "caluma.distribution.answer.buttons.compose.status",
                },
                "confirm-inquiry-answer": {
                  color: "primary",
                  label: "caluma.distribution.answer.buttons.confirm.label",
                  status: "caluma.distribution.answer.buttons.confirm.status",
                },
                "revise-inquiry-answer": {
                  color: "default",
                  label: "caluma.distribution.answer.buttons.revise.label",
                },
                "adjust-inquiry-answer": {
                  color: "primary",
                  label: "caluma.distribution.answer.buttons.adjust.label",
                  status: "caluma.distribution.answer.buttons.adjust.status",
                },
              },
            },
          },
          new: {
            defaultTypes: ["suggestions"],
            types: {
              suggestions: {
                label: "caluma.distribution.new.suggestions",
                icon: "star",
                iconColor: "warning",
              },
            },
          },
          permissions: {},
        },
        getOwner(this).lookup("service:calumaOptions")?.distribution ?? {}
      );
    },
  });
}
