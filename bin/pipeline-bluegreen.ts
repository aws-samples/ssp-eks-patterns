import { configureApp, errorHandler } from '../lib/common/construct-utils';
import { PipelineBlueGreenCluster } from '../lib/pipeline-bluegreen-construct/pipeline'


const app = configureApp();

//-------------------------------------------
// Multiple clusters, multiple regions.
//-------------------------------------------

new PipelineBlueGreenCluster().buildAsync(app).catch((error) => {
    errorHandler(app, "Blue Green cluster pattern is not setup. It may be due to missing secrets: ", error);
});

// import { configureApp, errorHandler } from '../lib/common/construct-utils';
// import { PipelineBlueGreenCluster } from '../lib/pipeline-bluegreen-construct/pipeline'
// import * as cdk from 'aws-cdk-lib';


// const app = configureApp();

// //-------------------------------------------
// // Multiple clusters, multiple regions.
// //-------------------------------------------

// class BlueGreenPipelineStack extends cdk.Stack {
//     constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
//         super(scope, id, props);

//         // Create the pipeline within the stack
//         const pipeline = new PipelineBlueGreenCluster();
//         pipeline.buildAsync(this); // 'this' refers to the stack
//     }
// }
// new BlueGreenPipelineStack(app, 'BlueGreenPipelineStack', {
//     env: {
//         account: process.env.CDK_DEFAULT_ACCOUNT,
//         region: process.env.CDK_DEFAULT_REGION
//     }
// });

// app.synth();