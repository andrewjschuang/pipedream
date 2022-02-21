// legacy_hash_id: a_8Ki7Xv
import aws from "../../aws.app.mjs";

export default {
  key: "aws-invoke-lambda",
  name: "AWS - Lambda - Invoke Function",
  description: "Invoke a Lambda function using the AWS API. [See the docs](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-lambda/index.html)",
  version: "0.1.2",
  type: "action",
  props: {
    aws,
    region: {
      propDefinition: [
        aws,
        "region",
      ],
      description: "The AWS region tied to your Lambda, e.g us-east-1 or us-west-2",
    },
    lambdaFunction: {
      propDefinition: [
        aws,
        "lambdaFunction",
        (c) => ({
          region: c.region,
        }),
      ],
    },
    eventData: {
      type: "object",
      label: "Event data",
      description: "A JSON object that will be sent as an event to the function",
      optional: true,
      default: {},
    },
  },
  async run({ $ }) {
    // This invokes the Lambda synchronously so you can view the response
    // details associated with each invocation. This can be changed. See
    // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Lambda.html#invoke-property
    // This also assumes the eventData passed to the step is JSON.
    // Please modify the code accordingly if your data is in a different format.
    const response = await this.aws.invokeLambdaFunction(
      this.region,
      this.lambdaFunction,
      this.eventData,
    );
    $.export("$summary", `Invoked ${this.lambdaFunction} lambda function`);
    this.aws.decodeResponsePayload(response);
    return response;
  },
};
