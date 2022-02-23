import { EC2Client } from "@aws-sdk/client-ec2";
import { LambdaClient } from "@aws-sdk/client-lambda";
import { SSMClient } from "@aws-sdk/client-ssm";
import { IAMClient } from "@aws-sdk/client-iam";
import { S3Client } from "@aws-sdk/client-s3";
import { CloudWatchLogsClient } from "@aws-sdk/client-cloudwatch-logs";
import { EventBridgeClient } from "@aws-sdk/client-eventbridge";
import { SQSClient } from "@aws-sdk/client-sqs";
import { SNSClient } from "@aws-sdk/client-sns";

export default {
  defaultRegion: "us-east-1",
  awsClients: {
    ec2: EC2Client,
    lambda: LambdaClient,
    ssm: SSMClient,
    iam: IAMClient,
    s3: S3Client,
    cloudWatchLogs: CloudWatchLogsClient,
    eventBridge: EventBridgeClient,
    sqs: SQSClient,
    sns: SNSClient,
  },
  // List extracted from the official AWS documentation:
  // https://docs.aws.amazon.com/general/latest/gr/rande.html
  awsRegions: [
    {
      label: "US East (Ohio) - us-east-2",
      value: "us-east-2",
    },
    {
      label: "US East (N. Virginia) - us-east-1",
      value: "us-east-1",
    },
    {
      label: "US West (N. California) - us-west-1",
      value: "us-west-1",
    },
    {
      label: "US West (Oregon) - us-west-2",
      value: "us-west-2",
    },
    {
      label: "Africa (Cape Town) - af-south-1",
      value: "af-south-1",
    },
    {
      label: "Asia Pacific (Hong Kong) - ap-east-1",
      value: "ap-east-1",
    },
    {
      label: "Asia Pacific (Mumbai) - ap-south-1",
      value: "ap-south-1",
    },
    {
      label: "Asia Pacific (Osaka) - ap-northeast-3",
      value: "ap-northeast-3",
    },
    {
      label: "Asia Pacific (Seoul) - ap-northeast-2",
      value: "ap-northeast-2",
    },
    {
      label: "Asia Pacific (Singapore) - ap-southeast-1",
      value: "ap-southeast-1",
    },
    {
      label: "Asia Pacific (Sydney) - ap-southeast-2",
      value: "ap-southeast-2",
    },
    {
      label: "Asia Pacific (Tokyo) - ap-northeast-1",
      value: "ap-northeast-1",
    },
    {
      label: "Canada (Central) - ca-central-1",
      value: "ca-central-1",
    },
    {
      label: "China (Beijing) - cn-north-1",
      value: "cn-north-1",
    },
    {
      label: "China (Ningxia) - cn-northwest-1",
      value: "cn-northwest-1",
    },
    {
      label: "Europe (Frankfurt) - eu-central-1",
      value: "eu-central-1",
    },
    {
      label: "Europe (Ireland) - eu-west-1",
      value: "eu-west-1",
    },
    {
      label: "Europe (London) - eu-west-2",
      value: "eu-west-2",
    },
    {
      label: "Europe (Milan) - eu-south-1",
      value: "eu-south-1",
    },
    {
      label: "Europe (Paris) - eu-west-3",
      value: "eu-west-3",
    },
    {
      label: "Europe (Stockholm) - eu-north-1",
      value: "eu-north-1",
    },
    {
      label: "Middle East (Bahrain) - me-south-1",
      value: "me-south-1",
    },
    {
      label: "South America (São Paulo) - sa-east-1",
      value: "sa-east-1",
    },
  ],
};
