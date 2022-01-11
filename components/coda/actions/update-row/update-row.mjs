import coda from "../../coda.app.mjs";

export default {
  key: "coda-update-row",
  name: "Update a Row",
  description: `Updates the specified row in the table.
    More information at [Coda API](https://coda.io/developers/apis/v1#operation/updateRow)`,
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
    rowId: {
      propDefinition: [
        coda,
        "rowId",
        (c) => ({
          docId: c.docId,
          tableId: c.tableId,
        }),
      ],
    },
    columnId: {
      propDefinition: [
        coda,
        "columnId",
        (c) => ({
          docId: c.docId,
          tableId: c.tableId,
        }),
      ],
    },
    disableParsing: {
      propDefinition: [
        coda,
        "disableParsing",
      ],
    },
    row: {
      type: "string",
      label: "Row",
      description: "An edit made to a particular row",
    },
  },
  async run({ $ }) {
    let params = {
      disableParsing: this.disableParsing,
    };

    let data = {
      row: JSON.parse(this.row),
    };

    let response = await this.coda.updateRow(
      this.docId,
      this.tableId,
      this.rowId,
      data,
      params,
    );

    $.export("$summary", "Updated row successfully");
    return response;
  },
};
