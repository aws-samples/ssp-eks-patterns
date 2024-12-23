import * as blueprints from '@aws-quickstart/eks-blueprints';
import * as eks from 'aws-cdk-lib/aws-eks';
import * as ssm from "aws-cdk-lib/aws-ssm";
import { Construct } from 'constructs';
import MultiClusterBuilderConstruct from './multi-cluster-builder';
import { ManualApprovalStep, ShellStep } from 'aws-cdk-lib/pipelines';
import DnsStackBuilderConstruct from './dns-stack-builder';

/**
 * Main multi-cluster deployment pipeline.
 */
export class PipelineBlueGreenCluster {

    async buildAsync(scope: Construct) {
        const accountID = process.env.ACCOUNT_ID! || process.env.CDK_DEFAULT_ACCOUNT! ;
        const region = process.env.AWS_REGION! || process.env.CDK_DEFAULT_REGION!;
        const clusterANameSuffix = "blue";
        const clusterBNameSuffix = "green";
        // const domainName = ssm.StringParameter.valueForStringParameter(
        //     scope,
        //     "/eks-cdk-pipelines/zoneName"
        //   );

        const stagesEks : blueprints.StackStage[] = [];

        const blueprintBuilder = new MultiClusterBuilderConstruct().create(scope, accountID, region); 
        const blueprintBlue = blueprintBuilder
            .version(eks.KubernetesVersion.V1_28)
            .clusterProvider(new blueprints.MngClusterProvider());

            stagesEks.push({
                id: clusterANameSuffix+"-cluster",
                stackBuilder : blueprintBlue.clone(region),
                // stageProps: {
                //     post: [
                //         new ShellStep("Validate App", {
                //             commands: [
                //               `for i in {1..12}; do curl -Ssf http://echoserver.${clusterANameSuffix}.${domainName} && echo && break; echo -n "Try #$i. Waiting 10s...\n"; sleep 10; done`,
                //             ],
                //         }),
                //     ]
                // }
            })

        const blueprintGreen = blueprintBuilder
            .version(eks.KubernetesVersion.V1_29)
            .clusterProvider(new blueprints.MngClusterProvider());
        
        stagesEks.push({
            id: clusterBNameSuffix+"-cluster",
            stackBuilder : blueprintGreen.clone(region),
            // stageProps: {
            //     post: [
            //         new ShellStep("Validate App", {
            //             commands: [
            //               `for i in {1..12}; do curl -Ssf http://echoserver.${clusterBNameSuffix}.${domainName} && echo && break; echo -n "Try #$i. Waiting 10s...\n"; sleep 10; done`,
            //             ],
            //         }),
            //     ]
            // }
        })
        const stagesDns : blueprints.StackStage[] = [];

        const prodEnv = clusterBNameSuffix;

        const dnsStackBuilder =  new DnsStackBuilderConstruct(prodEnv)
        stagesDns.push({
            id: `dns-${prodEnv}`,
            stackBuilder: dnsStackBuilder,
        });

        const gitOwner = 'Howlla';
        const gitRepositoryName = 'cdk-eks-blueprints-patterns';

        blueprints.CodePipelineStack.builder()
            .application('npx ts-node bin/pipeline-bluegreen.ts')
            .name('blue-green-pipeline')
            .owner(gitOwner)
            .codeBuildPolicies(blueprints.DEFAULT_BUILD_POLICIES)
            .repository({
                repoUrl: gitRepositoryName,
                credentialsSecretName: 'github-token',
                targetRevision: 'main',
                trigger: blueprints.GitHubTrigger.POLL
            })
            .wave({
                id: "eks-stage",
                stages: stagesEks
            })
            .wave({
                id: "dns-stage",
                stages: stagesDns,
                props:{
                    pre:[
                        new ManualApprovalStep(`Promote-${prodEnv}-Environment`)
                       ]
                }
            })
            .build(scope, "blue-green-pipeline", {
                env: {
                    account: process.env.CDK_DEFAULT_ACCOUNT,
                    region: region,
                }
            });
    }
   
}
