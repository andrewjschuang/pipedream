import axios from "axios";

export default {
  type: "app",
  app: "coda",
  propDefinitions: {
    title: {
      type: "string",
      label: "Title",
      description: "Title of the doc. Defaults to `\"Untitled\"`",
      optional: true,
    },
    docId: {
      type: "string",
      label: "Doc ID",
      description: "ID of the doc",
      async options () {
        return this._getKeyValuePair(
          (await this.listDocs()).items,
        );
      },
    },
    folderId: {
      type: "string",
      label: "Folder ID",
      description: "ID of the folder. Defaults to your `\"My docs\"` folder in the oldest workspace you joined",
      optional: true,
    },
    tableId: {
      type: "string",
      label: "Table ID",
      description: "ID of the table",
      async options({ docId }) {
        return this._getKeyValuePair(
          (await this.listTables(docId)).items,
        );
      },
    },
    rowId: {
      type: "string",
      label: "Row ID",
      description: "ID of the row",
      async options({
        docId, tableId,
      }) {
        let counter = 0;
        return (await this.findRow(docId, tableId, {
          sortBy: "natural",
        })).items.map(
          (row) => ({
            label: `Row ${counter++}: id[${row.id}] value[${row.name}]`,
            value: row.id,
          }),
        );
      },
    },
    columnId: {
      type: "string",
      label: "Column ID",
      description: "ID of the column",
      async options({
        docId, tableId,
      }) {
        return (await this.listColumns(docId, tableId)).items.map(
          (column) => ({
            label: `id[${column.id}] value[${column.name}]`,
            value: column.id,
          }),
        );
      },
    },
    keyColumns: {
      type: "string[]",
      label: "Key of columns to be upserted",
      description: "Optional column IDs, specifying columns to be used as upsert keys",
      async options({
        docId, tableId,
      }) {
        return (await this.listColumns(docId, tableId)).items.map(
          (column) => ({
            label: `id[${column.id}] value[${column.name}]`,
            value: column.id,
          }),
        );
      },
    },
    query: {
      type: "string",
      label: "Search Query",
      description: "Search term used to filter down results",
      optional: true,
    },
    sortBy: {
      type: "string",
      label: "sortBy",
      description: "Determines how to sort the given objects",
      optional: true,
      options: [
        "name",
      ],
    },
    disableParsing: {
      type: "boolean",
      label: "Disable Parsing",
      description: "If true, the API will not attempt to parse the data in any way",
      optional: true,
    },
    visibleOnly: {
      type: "boolean",
      label: "visibleOnly",
      description: "If true, returns only visible rows and columns for the table",
      optional: true,
    },
    limit: {
      type: "integer",
      label: "Limit",
      description: "Maximum number of results to return in this query",
      optional: true,
      default: 25,
      min: 1,
      max: 50,
    },
    pageToken: {
      type: "string",
      label: "Page Token",
      description: "An opaque token used to fetch the next page of results",
      optional: true,
    },
    paginate: {
      type: "boolean",
      label: "Auto-Paginate",
      description: "By default, list all docs matching search results across all result pages. Set to `false` to limit results to the first page.",
      optional: true,
      default: true,
    },
  },
  methods: {
    _getKeyValuePair(list) {
      return list.map(
        (e) => ({
          label: e.name,
          value: e.id,
        }),
      );
    },
    _removeEmptyKeyValues(dict) {
      Object.keys(dict).forEach((key) => (dict[key] === null
        || dict[key] === undefined
        || dict[key] === "")
        && delete dict[key]);
      return dict;
    },
    /**
     * Creates a new doc or copies a doc from a source docId
     * @param {string} title - Title of the new doc
     * @param {string} folderId - The ID of the folder within to create this doc
     * @param {string} [docId] - An optional source doc ID from which to create a copy
     * @return {string} ID of the newly created doc
     */
    async createDoc(title, folderId, docId = "") {
      const config = {
        method: "post",
        url: "https://coda.io/apis/v1/docs",
        headers: {
          Authorization: `Bearer ${this.$auth.api_token}`,
        },
        data: {
          title,
          folderId,
          docId,
        },
      };
      return (await axios(config)).data.id;
    },
    /**
     * List docs according to query parameters
     * @param {object}  [params]
     * @param {string}  [params.docId]
     * @param {string}  [params.workspaceId]
     * @param {string}  [params.folderId]
     * @param {string}  [params.query]
     * @param {boolean} [params.isOwner]
     * @param {boolean} [params.isPublished]
     * @param {boolean} [params.isStarred]
     * @param {boolean} [params.inGallery]
     * @param {number}  [params.limit]
     * @param {string}  [params.pageToken]
     * @return {object[]} List of docs
     */
    async listDocs(params = {}) {
      const config = {
        method: "get",
        url: "https://coda.io/apis/v1/docs",
        headers: {
          Authorization: `Bearer ${this.$auth.api_token}`,
        },
        params: this._removeEmptyKeyValues(params),
      };
      return (await axios(config)).data;
    },
    /**
     * Lists tables in a doc according to parameters
     * @param {object} [params]
     * @param {string} [params.sortBy]
     * @param {string} [params.tableTypes]
     * @param {number} [params.limit]
     * @param {string} [params.pageToken]
     * @return {object[]} List of tables
     */
    async listTables(docId, params = {}) {
      const config = {
        method: "get",
        url: `https://coda.io/apis/v1/docs/${docId}/tables`,
        headers: {
          Authorization: `Bearer ${this.$auth.api_token}`,
        },
        params: this._removeEmptyKeyValues(params),
      };
      return (await axios(config)).data;
    },
    /**
     * Searches for a row in the selected table using a column match search
     * @param {string}  docId
     * @param {string}  tableId
     * @param {object}  [params]
     * @param {string}  [params.query]
     * @param {string}  [params.sortBy]
     * @param {boolean} [params.visibleOnly]
     * @param {boolean} [params.useColumnNames]
     * @param {string}  [params.valueFormat]
     * @param {number}  [params.limit]
     * @param {string}  [params.pageToken]
     * @param {string}  [params.syncToken]
     * @return {object[]} List of rows
     */
    async findRow(docId, tableId, params = {}) {
      const config = {
        method: "get",
        url: `https://coda.io/apis/v1/docs/${docId}/tables/${tableId}/rows`,
        headers: {
          Authorization: `Bearer ${this.$auth.api_token}`,
        },
        params: this._removeEmptyKeyValues(params),
      };
      return (await axios(config)).data;
    },
    /**
     * Returns a list of columns in a doc table.
     * @param {string} docId
     * @param {string} tableId
     * @param {object} [params]
     * @param {object} [params.visibleOnly]
     * @param {object} [params.limit]
     * @param {object} [params.pageToken]
     * @return {object[]} List of columns
     */
    async listColumns(docId, tableId, params = {}) {
      const config = {
        method: "get",
        url: `https://coda.io/apis/v1/docs/${docId}/tables/${tableId}/columns`,
        headers: {
          Authorization: `Bearer ${this.$auth.api_token}`,
        },
        params: this._removeEmptyKeyValues(params),
      };
      return (await axios(config)).data;
    },
    /**
     * Inserts rows into a table, optionally updating existing rows using upsert key columns
     * @param {string}    docId
     * @param {string}    tableId
     * @param {object}    data
     * @param {object}    data.rows
     * @param {string[]}  [data.keyColumns]
     * @param {object}    [params]
     * @param {boolean}   [params.disableParsing]
     * @return {object[]} List of added rows and requestId
     */
    async createRows(docId, tableId, data, params = {}) {
      const config = {
        method: "post",
        url: `https://coda.io/apis/v1/docs/${docId}/tables/${tableId}/rows`,
        headers: {
          Authorization: `Bearer ${this.$auth.api_token}`,
        },
        params: this._removeEmptyKeyValues(params),
        data,
      };
      return (await axios(config)).data;
    },
    /**
     * Updates the specified row in the table
     * @param {string}  docId
     * @param {string}  tableId
     * @param {string}  rowId
     * @param {object}  data
     * @param {object}  data.row
     * @param {object}  [params]
     * @param {boolean} [params.disableParsing]
     * @return {object[]} Updated rowId and requestId
     */
    async updateRow(docId, tableId, rowId, data, params = {}) {
      const config = {
        method: "put",
        url: `https://coda.io/apis/v1/docs/${docId}/tables/${tableId}/rows/${rowId}`,
        headers: {
          Authorization: `Bearer ${this.$auth.api_token}`,
        },
        params: this._removeEmptyKeyValues(params),
        data,
      };
      return (await axios(config)).data;
    },
  },
};
