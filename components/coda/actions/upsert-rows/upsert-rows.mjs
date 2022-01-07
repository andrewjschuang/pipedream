import coda from "../../coda.app.mjs";

export default {
  key: "coda_upsert-rows",
  name: "Upsert Rows",
  description: "Creates a new row or updates existing rows if any upsert key columns are provided. When upserting, if multiple rows match the specified key column(s), they will all be updated with the specified value",
  version: "0.0.1",
  type: "action",
  props: {
    coda,
    docId: {
      propDefinition: [
        coda,
        "sourceDoc",
        (c) => c,
      ],
      label: "Doc ID",
      description: "ID of the Doc",
      optional: false,
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
    keyColumns: {
      propDefinition: [
        coda,
        "keyColumns",
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
    rows: {
      type: "string",
      label: "Rows to create",
      description: "Array of rows objects to create. Example: `[{\"cells\":[{column:\"<columnId>\",value:\"<value>\"}]}]`. More information at [Coda API](https://coda.io/developers/apis/v1#operation/upsertRows)",
    },
  },
  async run() {
    var data = {
      rows: JSON.parse(this.rows),
      keyColumns: this.keyColumns,
    };

    var params = {
      disableParsing: this.disableParsing,
    };

    return await this.coda.createRows(
      this.docId,
      this.tableId,
      data,
      params,
    );
  },
};
