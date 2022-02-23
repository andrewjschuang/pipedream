import axios from "axios"; // need axios response headers
import AdmZip from "adm-zip";
import dedent from "dedent";
import common from "./common.mjs";
import { generateRandomUniqueName } from "./sources/common/utils.mjs";
import { DescribeRegionsCommand } from "@aws-sdk/client-ec2";
import { ListRolesCommand } from "@aws-sdk/client-iam";
import {
  ListTopicsCommand,
  PublishCommand,
} from "@aws-sdk/client-sns";
import {
  ListQueuesCommand,
  SendMessageCommand,
} from "@aws-sdk/client-sqs";
import {
  ListEventBusesCommand,
  PutEventsCommand,
} from "@aws-sdk/client-eventbridge";
import {
  ListBucketsCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import {
  InvokeCommand,
  ListFunctionsCommand,
  CreateFunctionCommand,
} from "@aws-sdk/client-lambda";

export default {
  type: "app",
  app: "aws",
  propDefinitions: {
    region: {
      type: "string",
      label: "AWS Region",
      description: "The AWS region string where you'd like to create your SNS topic",
      default: common.defaultRegion,
      async options() {
        try {
          const response = await this.listRegions();
          return response.Regions
            .map((regionInfo) => regionInfo.RegionName)
            .sort();
        } catch (error) {
          // Retrieval of available regions can fail if the registered account
          // does not have enough permissions to call the EC2 `DescribeRegions`
          // API. In that case, we default to the static list of regions.
          console.log(`Could not retrieve available regions from AWS. ${error}, falling back to default regions`);
          return common.awsRegions;
        }
      },
    },
    role: {
      type: "string",
      label: "Role",
      description: "An IAM Role ARN, e.g., arn:aws:iam::650138640062:role/v3-lambda-tutorial-lambda-role. [See docs](https://docs.aws.amazon.com/lambda/latest/dg/lambda-intro-execution-role.html)",
      async options({ region }) {
        const response = await this.listRoles(region);
        return response.Roles.map((role) => role.Arn);
      },
    },
    bucket: {
      type: "string",
      label: "S3 Bucket Name",
      description: "The S3 Bucket Name",
      async options() {
        const response = await this.listBuckets();
        return response.Buckets.map((bucket) => bucket.Name);
      },
    },
    key: {
      type: "string",
      label: "S3 Filename Key",
      description: "The name of the S3 key with extension you'd like to upload this file to",
    },
    eventBusName: {
      type: "string",
      label: "Event Bus Name",
      description: "The name of the EventBridge event bus",
      async options() {
        const response = await this.listEventBuses();
        return response.EventBuses.map((eventBus) => eventBus.Name);
      },
    },
    queueUrl: {
      type: "string",
      label: "SQS Queue URL",
      description: "The URL of the SQS Queue",
      async options() {
        const response = await this.listQueues();
        return response.QueueUrls;
      },
    },
    topic: {
      type: "string",
      label: "SNS Topic",
      description: "The ARN of the SNS Topic",
      async options() {
        const response = await this.listTopics();
        return response.Topics.map((topic) => topic.TopicArn);
      },
    },
    lambdaFunction: {
      type: "string",
      label: "Function Name",
      description: "The name of your Lambda function. Also accepts a function ARN",
      async options({ region }) {
        const response = await this.listLambdaFunctions(region);
        return response.Functions.map((fn) => fn.FunctionName);
      },
    },
    lambdaCode: {
      type: "string",
      label: "Code",
      description: "The function code in Node.js. [See docs](https://docs.aws.amazon.com/lambda/latest/dg/nodejs-handler.html)",
      default: dedent`exports.handler = async (event) => {
                        console.log("Received event");
                        const response = {
                            statusCode: 200,
                        };
                        return response;
                      };`,
    },
    eventData: {
      type: "object",
      label: "Event data",
      description: "A JSON object that will be sent as an event",
      optional: true,
    },
    logGroupNames: {
      label: "CloudWatch Log Groups",
      description: "The name of the log group",
      type: "string[]",
      async options({
        region, prevContext,
      }) {
        const prevToken = prevContext.nextToken;
        const {
          logGroups,
          nextToken,
        } = await this.logsInsightsDescibeLogGroups(region, prevToken);
        const options = logGroups.map((group) => {
          return {
            label: group.logGroupName,
            value: group.logGroupName,
          };
        });
        return {
          options,
          context: {
            nextToken,
          },
        };
      },
    },
    logStreamNames: {
      label: "CloudWatch Log Streams",
      description: "The name of the log stream for the chosen log group",
      type: "string[]",
      async options({
        logGroupName, region, prevContext,
      }) {
        const prevToken = prevContext.nextToken;
        const {
          logStreams,
          nextToken,
        } = await this.logsInsightsDescibeLogStreams(region, logGroupName, prevToken);
        const options = logStreams.map((group) => {
          return {
            label: group.logStreamName,
            value: group.logStreamName,
          };
        });
        return {
          options,
          context: {
            nextToken,
          },
        };
      },
    },
  },
  methods: {
    /**
     * This function configures and returns a new reference to the AWS SDK. The
     * configuration involves setting the region based on the provided argument,
     * as well as setting up the credentials previously provided by the user
     * when setting up their AWS account.
     *
     * @param {string} region - The AWS region to which the AWS SDK will
     * connect. This string should be an acceptable value by the AWS SDK, which
     * you can find in the ${@linkcode ./regions.mjs regions.mjs} file, as well as
     * by calling the EC2 `DescribeRegions` API.
     * @returns A new configured instance of the AWS SDK
     */
    sdk(region) {
      const {
        accessKeyId,
        secretAccessKey,
      } = this.$auth;
      AWS.config.update({
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
        region,
      });
      return AWS;
    },
    _getAWSClient(clientType, region = common.defaultRegion) {
      return new common.awsClients[clientType]({
        credentials: {
          accessKeyId: this.$auth.accessKeyId,
          secretAccessKey: this.$auth.secretAccessKey,
        },
        region,
      });
    },
    _getCloudWatchLogsClient(region) {
      const AWS = this.sdk(region);
      return new AWS.CloudWatchLogs();
    },
    _getIamClient(region) {
      const AWS = this.sdk(region);
      return new AWS.IAM();
    },
    _getS3Client(region) {
      const AWS = this.sdk(region);
      return new AWS.S3();
    },
    _getSTSClient(region) {
      const AWS = this.sdk(region);
      return new AWS.STS();
    },
    _getAssumeRolePolicyForService(service) {
      return {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Principal: {
              Service: service,
            },
            Action: "sts:AssumeRole",
          },
        ],
      };
    },
    async getAWSAccountId(region) {
      const { Account } = await this._getSTSClient(region).getCallerIdentity()
        .promise();
      return Account;
    },
    decodeResponsePayload(response) {
      response.Payload = JSON.parse(new TextDecoder("utf-8").decode(response.Payload) || {});
    },
    createZipArchive(data) {
      const zip = new AdmZip();
      zip.addFile("index.js", Buffer.from(data, "utf-8"));
      return zip.toBuffer();
    },
    async streamFile(fileUrl) {
      return await axios.get(fileUrl, {
        responseType: "stream",
      });
    },
    /**
     * This method creates an IAM role for an AWS service. The role will be
     * created in the specified region, and will grant `sts:AssumeRole`
     * permissions to the referred service.
     *
     * @param {string} region - The AWS region to which the AWS SDK will
     * connect. This string should be an acceptable value by the AWS SDK, which
     * you can find in the ${@linkcode ./regions.mjs regions.mjs} file.
     * @param {string}  service - The service that will be granted
     * `sts:AssumeRole` permissions (e.g. `states.amazonaws.com` for Step
     * Functions). You can see [this
     * link]{@link https://gist.github.com/shortjared/4c1e3fe52bdfa47522cfe5b41e5d6f22}
     * for a community-driven list (the official AWS docs still don't have such
     * a list).
     * @param {string} [roleDescription] - A text describing the purpose of the
     * role
     * @returns {Promise<object>} An object containing the new role's name and
     * ARN (`roleName` and `roleArn` respectively)
     */
    async createServiceRole(region, service, roleDescription) {
      const assumeRolePolicyDocument = JSON.stringify(
        this._getAssumeRolePolicyForService(service),
      );
      const params = {
        AssumeRolePolicyDocument: assumeRolePolicyDocument,
        RoleName: generateRandomUniqueName(),
        Description: roleDescription,
        Path: "/pipedream/",
      };
      const { Role } = await this
        ._getIamClient(region)
        .createRole(params)
        .promise();
      console.log(Role);
      return {
        roleArn: Role.Arn,
        roleName: Role.RoleName,
      };
    },
    /**
     * This method creates an S3 bucket in the specified region.
     *
     * @param {string} region - The AWS region to which the AWS SDK will
     * connect. This string should be an acceptable value by the AWS SDK, which
     * you can find in the ${@linkcode ./regions.mjs regions.mjs} file.
     * @param {string} bucketName - The name of the S3 bucket you'd like to create
     * @returns {Promise<object>} An object containing the new bucket's Location
     */
    async createS3Bucket(region, bucketName) {
      const params = {
        Bucket: bucketName,
      };
      // S3 throws an error if you specify us-east-1 as the region in
      // the create bucket LocationConstraint. See https://stackoverflow.com/a/51912090
      if (region !== "us-east-1") {
        params.CreateBucketConfiguration = {
          LocationConstraint: region,
        };
      }
      const { Location } = await this
        ._getS3Client(region)
        .createBucket(params)
        .promise();
      console.log(Location);
      return {
        Location,
      };
    },
    /**
     * This method sets an S3 bucket's policy
     *
     * @param {string} region - The AWS region to which the AWS SDK will
     * connect. This string should be an acceptable value by the AWS SDK, which
     * you can find in the ${@linkcode ./regions.mjs regions.mjs} file.
     * @param {string} bucketName - The name of the S3 bucket you'd like to create
     * @param {string} policy - The bucket policy JSON
     * @returns {Promise<object>} An object containing the put bucket policy response
     */
    async putS3BucketPolicy(region, bucketName, policy) {
      const params = {
        Bucket: bucketName,
        Policy: policy,
      };
      const putBucketPolicyResp = await this
        ._getS3Client(region)
        .putBucketPolicy(params)
        .promise();
      console.log(putBucketPolicyResp);
      return putBucketPolicyResp;
    },
    /**
     * This method adds permissions to an IAM role in the form of inline
     * policies. However, such permissions are free-form as long as they are
     * compatible with the IAM format.
     *
     * @see {@link https://amzn.to/3tV5qyj IAM Policies Reference}
     *
     * @param {string} region - The AWS region to which the AWS SDK will
     * connect. This string should be an acceptable value by the AWS SDK, which
     * you can find in the ${@linkcode ./regions.mjs regions.mjs} file.
     * @param {string} roleName - The name of the role to add permissions to
     * @param {object} permissions - An object containing the name and policy
     * document of the permissions to attach to the specified role
     * @param {string} permissions.name - The name of the inline permission to
     * attach to the specified role
     * @param {object} permissions.document - A JSON-serializable object with
     * the permissions to attach to the specified IAM role
     * @returns {Promise<void>}
     */
    async addPermissionsToRole(region, roleName, permissions) {
      const params = {
        PolicyDocument: JSON.stringify(permissions.document),
        PolicyName: permissions.name,
        RoleName: roleName,
      };
      await this
        ._getIamClient(region)
        .putRolePolicy(params)
        .promise();
    },
    async _deleteInlinePoliciesForRole(region, roleName) {
      const params = {
        RoleName: roleName,
      };

      while (true) {
        const { PolicyNames: policyNames = [] } = await this
          ._getIamClient(region)
          .listRolePolicies(params)
          .promise();

        if (policyNames.length <= 0) {
          // No more inline policies to delete, we can return now
          return;
        }

        await Promise.all(
          policyNames
            .map((policyName) => ({
              RoleName: roleName,
              PolicyName: policyName,
            }))
            .map(
              (params) => this
                ._getIamClient(region)
                .deleteRolePolicy(params)
                .promise(),
            ),
        );
      }

    },
    /**
     * This method deletes a specific IAM role in the specified region.
     *
     * @param {string} region - The AWS region to which the AWS SDK will
     * connect. This string should be an acceptable value by the AWS SDK, which
     * you can find in the ${@linkcode ./regions.mjs regions.mjs} file.
     * @param {string} roleName - The name of the role to add permissions to
     * @returns {Promise<void>}
     */
    async deleteRole(region, roleName) {
      // We must delete all the inline policies attached to the role before
      // we're allowed to delete it
      await this._deleteInlinePoliciesForRole(region, roleName);

      const params = {
        RoleName: roleName,
      };
      await this
        ._getIamClient(region)
        .deleteRole(params)
        .promise();
    },
    async listRoles(region) {
      const client = this._getAWSClient("iam", region);
      return await client.send(new ListRolesCommand({}));
    },
    /**
     * This method describes CloudWatch Log groups
     *
     * @param {string} region - The AWS region to which the AWS SDK will
     * connect. This string should be an acceptable value by the AWS SDK, which
     * you can find in the ${@linkcode ./regions.mjs regions.mjs} file.
     * @param {string} nextToken - The token for the next set of items to return.
     * (You received this token from a previous call.)
     * @returns {Promise<object>} An object containing the log groups and a nextToken
     * to use in subsequent calls (`logGroups` and `nextToken` respectively)
     */
    async logsInsightsDescibeLogGroups(region, lastToken) {
      const params = {
        nextToken: lastToken,
      };
      const data = await this.
        _getCloudWatchLogsClient(region)
        .describeLogGroups(params)
        .promise();
      const {
        logGroups,
        nextToken,
      } = data;
      return {
        logGroups,
        nextToken,
      };
    },
    /**
     * This method describes CloudWatch Log streams for a given log group
     *
     * @param {string} region - The AWS region to which the AWS SDK will
     * connect. This string should be an acceptable value by the AWS SDK, which
     * you can find in the ${@linkcode ./regions.mjs regions.mjs} file.
     * @param {string} logGroupName - The name of the log group.
     * @param {string} nextToken - The token for the next set of items to return.
     * (You received this token from a previous call.)
     * @returns {Promise<object>} An object containing the log streams and a nextToken
     * to use in subsequent calls (`logStreams` and `nextToken` respectively)
     */
    async logsInsightsDescibeLogStreams(region, logGroupName, lastToken) {
      const params = {
        logGroupName,
        nextToken: lastToken,
      };
      const data = await this.
        _getCloudWatchLogsClient(region)
        .describeLogStreams(params)
        .promise();
      const {
        logStreams,
        nextToken,
      } = data;
      return {
        logStreams,
        nextToken,
      };
    },
    /**
     * This method uploads a batch of log events to the specified log stream.
     *
     * @param {string} region - The AWS region to which the AWS SDK will
     * connect. This string should be an acceptable value by the AWS SDK, which
     * you can find in the ${@linkcode ./regions.mjs regions.mjs} file.
     * @param {string} logGroupName - The name of the log group.
     * @param {string} logStreamName - The name of the log stream.
     * @param {Array.<Object>} logEvents - An array of log events. Each log event
     * must contain a `timestamp` (the time the event occurred) and a `message`
     * @param {string} sequenceToken - The sequence token obtained from the
     * response of the previous PutLogEvents call
     * @returns {Promise<object>} An object containing the sequenceToken to use
     * to use in subsequent calls and rejected log events (`nextSequenceToken`
     * and `rejectedLogEventsInfo` respectively)
     */
    async logsPutLogEvents(region, logGroupName, logStreamName, logEvents, sequenceToken) {
      const params = {
        logGroupName,
        logStreamName,
        logEvents,
        sequenceToken,
      };
      const data = await this.
        _getCloudWatchLogsClient(region)
        .putLogEvents(params)
        .promise();
      const {
        nextSequenceToken,
        rejectedLogEventsInfo,
      } = data;
      return {
        nextSequenceToken,
        rejectedLogEventsInfo,
      };
    },
    async listRegions() {
      const client = this._getAWSClient("ec2");
      return await client.send(new DescribeRegionsCommand({}));
    },
    async listBuckets() {
      const client = this._getAWSClient("s3");
      return await client.send(new ListBucketsCommand({}));
    },
    async listEventBuses() {
      const client = this._getAWSClient("eventBridge");
      return await client.send(new ListEventBusesCommand({}));
    },
    async listQueues() {
      const client = this._getAWSClient("sqs");
      return await client.send(new ListQueuesCommand({}));
    },
    async listTopics() {
      const client = this._getAWSClient("sns");
      return await client.send(new ListTopicsCommand({}));
    },
    async listLambdaFunctions(Region) {
      const client = this._getAWSClient("lambda", Region);
      return await client.send(new ListFunctionsCommand({
        Region,
      }));
    },
    async createLambdaFunction(Region, Role, FunctionName, code) {
      const client = this._getAWSClient("lambda", Region);
      const ZipFileCode = this.createZipArchive(code);
      return await client.send(new CreateFunctionCommand({
        Code: {
          ZipFile: ZipFileCode,
        },
        FunctionName,
        Role,
        Runtime: "nodejs12.x",
        Handler: "index.handler",
      }));
    },
    async invokeLambdaFunction(Region, FunctionName, Payload = {}) {
      const client = this._getAWSClient("lambda", Region);
      return await client.send(new InvokeCommand({
        FunctionName,
        Payload,
        InvocationType: "RequestResponse",
        LogType: "Tail",
      }));
    },
    async uploadFileToS3(Region, Bucket, Key, Body, ContentType, ContentLength) {
      const params = {
        Bucket,
        Key,
        Body,
      };
      if (ContentType) params.ContentType = ContentType;
      if (ContentLength) params.ContentLength = ContentLength;
      const client = this._getAWSClient("s3", Region);
      return await client.send(new PutObjectCommand(params));
    },
    async sendEventToEventBridgeBus(Region, EventBusName, EventData) {
      const params = {
        Entries: [
          {
            Detail: JSON.stringify(EventData),
            DetailType: Object.keys(EventData).join(" "),
            EventBusName,
            Source: "pipedream",
          },
        ],
      };
      const client = this._getAWSClient("eventBridge", Region);
      return await client.send(new PutEventsCommand(params));
    },
    async sendMessageToSqs(Region, QueueUrl, EventData) {
      const params = {
        MessageBody: JSON.stringify(EventData),
        QueueUrl,
      };
      const client = this._getAWSClient("sqs", Region);
      return await client.send(new SendMessageCommand(params));
    },
    async sendMessageToSns(Region, TopicArn, Message) {
      const params = {
        TopicArn,
        Message,
      };
      const client = this._getAWSClient("sns", Region);
      return await client.send(new PublishCommand(params));
    },
  },
};
