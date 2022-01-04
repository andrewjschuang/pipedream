import { Octokit } from '@octokit/rest';

export default {
  name: "Action Demo",
  description: "This is a demo action",
  key: "action_demo",
  version: "0.0.4",
  type: "action",
  props: {
    github: {
      type: "app",
      app: "github"
    }
  },
  async run({ $ }) {
    const octokit = new Octokit({
      auth: this.github.$auth.oauth_access_token
    });

    const { data } = await octokit.repos.get( {
      owner: `pipedreamhq`,
      repo: `pipedream`
    });

    $.export("$summary", `Successfully fetched info for \`${data.full_name}\``);

    return data;
  },
}
