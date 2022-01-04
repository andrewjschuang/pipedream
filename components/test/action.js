import axios from "axios";

export default {
  name: "Action Demo",
  description: "This is a demo action",
  key: "action_demo",
  version: "0.0.3",
  type: "action",
  props: {},
  async run() {
    const response = await axios.get(`https://swapi.dev/api/people/1/`);
    return `hello ${response.data.name}`
  },
}
