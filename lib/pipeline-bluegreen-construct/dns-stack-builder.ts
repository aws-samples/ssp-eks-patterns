import { StackBuilder } from '@aws-quickstart/eks-blueprints';
import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cdk from "aws-cdk-lib";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as ssm from "aws-cdk-lib/aws-ssm";


interface DnsStackProps extends cdk.StackProps {
  envName: string;
}

class DnsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: DnsStackProps) {
    super(scope, id, props);

    const hostZoneId = ssm.StringParameter.valueForStringParameter(
      this,
      "/eks-cdk-pipelines/hostZoneId"
    );

    const zoneName = ssm.StringParameter.valueForStringParameter(
      this,
      "/eks-cdk-pipelines/zoneName"
    );

    const zone = route53.HostedZone.fromHostedZoneAttributes(this, "appZone", {
      zoneName: zoneName,
      hostedZoneId: hostZoneId,
    });

    new route53.CnameRecord(this, "appCnameRecord", {
      zone: zone,
      recordName: "app",
      domainName: `echoserver.${props.envName}.${zoneName}`,
      ttl: cdk.Duration.seconds(30),
    });
  }
}

export default class DnsStackBuilderConstruct implements StackBuilder {
    constructor(private readonly envName: string) {}

    build(scope: Construct, id: string, stackProps?: StackProps): Stack {
        const accountID = process.env.CDK_DEFAULT_ACCOUNT!;
        const awsRegion = process.env.CDK_DEFAULT_REGION!;
 
        return new DnsStack(scope, `${id}-blueprint`, {
            ...stackProps,
            envName: this.envName,
            env: {
                account: accountID,
                region: awsRegion
            },
            tags: {
                Application: "Dns",
                Environment: id,
            }
        });
    }
}