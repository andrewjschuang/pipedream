import analytics from "../../google_analytics.app.mjs";

export default {
  key: "google_analytics-list-goals",
  name: "List Goals",
  description: "Lists goals to which the user has access",
  version: "0.0.1",
  type: "action",
  props: {
    analytics,
    token: {
      propDefinition: [
        analytics,
        "token",
      ],
    },
    accountId: {
      propDefinition: [
        analytics,
        "accountId",
      ],
    },
    webPropertyId: {
      propDefinition: [
        analytics,
        "webPropertyId",
      ],
    },
    profileId: {
      propDefinition: [
        analytics,
        "profileId",
      ],
    },
    maxResults: {
      type: "integer",
      label: "Max Results",
      description: "The maximum number of goals to include in this response",
      optional: true,
    },
    startIndex: {
      type: "integer",
      label: "Start Index",
      description: `An index of the first goal to retrieve
        Use this parameter as a pagination mechanism along with the max-results parameter`,
      optional: true,
    },
  },
  async run({ $ }) {
    let params = {
      "accountId": this.accountId,
      "webPropertyId": this.webPropertyId,
      "profileId": this.profileId,
      "max-results": this.maxResults,
      "start-index": this.startIndex,
    };
    let response = await this.analytics.listGoals(
      this.token,
      params,
    );
    $.export("$summary", `Found ${response.items.length} goal(s) for ${response.username}`);
    return response;
  },
};
