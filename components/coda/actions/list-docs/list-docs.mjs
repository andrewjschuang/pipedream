import coda from "../../coda.app.mjs";

export default {
  key: "coda-list-docs",
  name: "List Docs",
  description: "Returns a list of docs accessible by the user. These are returned in the same order as on the docs page: reverse chronological by the latest event relevant to the user (last viewed, edited, or shared)",
  version: "0.0.1",
  type: "action",
  props: {
    coda,
    docId: {
      propDefinition: [
        coda,
        "docId",
        (c) => c,
      ],
      description: "Show only docs copied from the specified doc ID",
      optional: true,
    },
    workspaceId: {
      type: "string",
      label: "Workspace ID",
      description: "Show only docs belonging to the given workspace",
      optional: true,
    },
    folderId: {
      propDefinition: [
        coda,
        "folderId",
      ],
      description: "Show only docs belonging to the given folder",
    },
    query: {
      propDefinition: [
        coda,
        "query",
      ],
    },
    isOwner: {
      type: "boolean",
      label: "Is Owner Docs",
      description: "Show only docs owned by the user",
      optional: true,
    },
    isPublished: {
      type: "boolean",
      label: "Is Published Docs",
      description: "Show only published docs",
      optional: true,
    },
    isStarred: {
      type: "boolean",
      label: "Is Starred Docs",
      description: "If true, returns docs that are starred. If false, returns docs that are not starred",
      optional: true,
    },
    inGallery: {
      type: "boolean",
      label: "In Gallery Docs",
      description: "Show only docs visible within the gallery",
      optional: true,
    },
    limit: {
      propDefinition: [
        coda,
        "limit",
      ],
    },
    pageToken: {
      propDefinition: [
        coda,
        "pageToken",
      ],
    },
  },
  async run({ $ }) {
    let params = {
      sourceDoc: this.docId,
      workspaceId: this.workspaceId,
      folderId: this.folderId,
      query: this.query,
      isOwner: this.isOwner,
      isPublished: this.isPublished,
      isStarred: this.isStarred,
      inGallery: this.inGallery,
      limit: this.limit,
      pageToken: this.pageToken,
    };

    let items = [];
    let response;
    do {
      response = await this.coda.listDocs(params);
      items.push(...response.items);
      params.pageToken = response.nextPageToken;
    } while (params.pageToken && items.length < this.limit);

    if (items.length > this.limit) items.length = this.limit;

    $.export("$summary", `Retrieved ${items.length} doc(s)`);

    return {
      items,
    };
  },
};
