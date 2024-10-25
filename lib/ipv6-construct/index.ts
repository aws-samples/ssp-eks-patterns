import * as cdk from 'aws-cdk-lib';
import * as blueprints from '@aws-quickstart/eks-blueprints';
import { Construct } from "constructs";
import { IpFamily } from 'aws-cdk-lib/aws-eks';

export default class IpV6Construct {
    build(scope: Construct, id: string) {
        const account = process.env.CDK_DEFAULT_ACCOUNT!;
        const region = process.env.CDK_DEFAULT_REGION!;
        const stackID = `${id}-blueprint`;

        const ipFamily = IpFamily.IP_V6; //IpFamily.IP_V6 is equivalent to "ipv6"
        // AddOns for the cluster. For ipv6 cluster, we haven't tested with all the addons except for the below addons.
        const addOns: Array<blueprints.ClusterAddOn> = [
            new blueprints.addons.VpcCniAddOn(),
            new blueprints.addons.KarpenterAddOn(),
            new blueprints.addons.SecretsStoreAddOn()
        ];
        blueprints.EksBlueprint.builder()
            .account(account)
            .region(region)
            .version('auto')
            .ipFamily(ipFamily)
            .addOns(...addOns)
            .build(scope, stackID);
    }
}