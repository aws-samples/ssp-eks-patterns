import { Construct } from 'constructs';
import * as blueprints from '@aws-quickstart/eks-blueprints'

/**
 * GitOps AppOfApps AddOns pattern shows how to install and manage cluster addons via ArgoCD GitOps App of Apps
 * The addons are provided in this repo as an example: https://github.com/aws-samples/eks-blueprints-add-ons
 */
export default class GitOpsAppOfAppsAddOnsConstruct {

    constructor(scope: Construct, id: string) {
        // enable gitops bootstrapping with argocd app of apps
        const bootstrapArgo = new blueprints.addons.ArgoCDAddOn({
            bootstrapRepo: {
                repoUrl: 'https://github.com/starchx/eks-blueprints-add-ons',
                path: 'chart',
                targetRevision: "eks-blueprints-cdk",
            },
        });

        // AddOns for the cluster.
        const addOns: Array<blueprints.ClusterAddOn> = [
            bootstrapArgo,
            new blueprints.AppMeshAddOn,
            new blueprints.AwsLoadBalancerControllerAddOn,
            new blueprints.CertManagerAddOn,
            new blueprints.ClusterAutoScalerAddOn,
            new blueprints.MetricsServerAddOn,
            new blueprints.NginxAddOn({
                values: {
                    controller: { service: { create: false } }
                }
            }),
            new blueprints.SecretsStoreAddOn,
        ];

        const stackID = `${id}-blueprint`

        blueprints.EksBlueprint.builder()
            .region('ap-southeast-2')
            .addOns(...addOns)
            .enableGitOpsAppOfApps()
            .build(scope, stackID);
    }
}