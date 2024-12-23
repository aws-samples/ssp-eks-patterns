import { Construct } from 'constructs';

// Blueprints Lib
import * as blueprints from '@aws-quickstart/eks-blueprints';


export default class MultiClusterBuilderConstruct {
    build(scope: Construct, id: string, account?: string, region?: string ) {
        // Setup platform team
        const accountID = account ?? process.env.CDK_DEFAULT_ACCOUNT! ;
        const awsRegion =  region ?? process.env.CDK_DEFAULT_REGION! ;
 
        const stackID = `${id}-blueprint`;
        this.create(scope, accountID, awsRegion)
            .build(scope, stackID);
    }
    

    create(scope: Construct, account?: string, region?: string ) {
        // Setup platform team
        const accountID = account ?? process.env.CDK_DEFAULT_ACCOUNT! ;
        const awsRegion =  region ?? process.env.CDK_DEFAULT_REGION! ;
        const parentDomain = blueprints.utils.valueFromContext(scope, "parent.hostedzone.name", "shbhavye.people.aws.dev");
        
        return blueprints.EksBlueprint.builder()
                    .account(accountID)
                    .region(awsRegion)
                    .resourceProvider(blueprints.GlobalResources.HostedZone, new blueprints.LookupHostedZoneProvider(parentDomain))
                    .addOns(
                        new blueprints.AwsLoadBalancerControllerAddOn(),
                        new blueprints.KubeStateMetricsAddOn(),
                        new blueprints.PrometheusNodeExporterAddOn(),
                        new blueprints.CertManagerAddOn(),
                        new blueprints.AdotCollectorAddOn(),
                        new blueprints.XrayAdotAddOn(),
                        new blueprints.ClusterAutoScalerAddOn(),
                        new blueprints.CalicoOperatorAddOn(),
                        new blueprints.ExternalDnsAddOn({
                                hostedZoneResources: [blueprints.GlobalResources.HostedZone],
                        })
                    )
    }
}


