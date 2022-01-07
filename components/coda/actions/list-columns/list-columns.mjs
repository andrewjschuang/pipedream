import coda from "../../coda.app.mjs";

export default {
  key: "coda-list-columns",
  name: "List Columns",
  description: "Lists columns in a table",
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
    },
    tableId: {
      propDefinition: [
        coda,
        "tableId",
        (c) => ({
          docId: c.docId,
        }),
      ],
    },
    visibleOnly: {
      propDefinition: [
        coda,
        "visibleOnly",
      ],
      description: "If true, returns only visible columns for the table",
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
  async run() {
    let params = {
      limit: this.limit,
      pageToken: this.pageToken,
      visibleOnly: this.visibleOnly,
    };
    return await this.coda.listColumns(
      this.docId,
      this.tableId,
      params,
    );
  },
};
