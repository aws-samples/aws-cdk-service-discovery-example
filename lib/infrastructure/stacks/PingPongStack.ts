/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this
 * software and associated documentation files (the "Software"), to deal in the Software
 * without restriction, including without limitation the rights to use, copy, modify,
 * merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import {Stack, StackProps} from "aws-cdk-lib";
import {Construct} from "constructs";
import {DiscoverableLambdaRestApi} from "../constructs/DiscoverableLambdaRestApi";
import * as path from "path";
import {NagSuppressions} from "cdk-nag";

export interface PingPongStackProps extends StackProps{
    targetNamespace:string
    targetServiceName:string,
    namespace:string,
    serviceName:string,
    answer:string
}

export class PingPongStack extends Stack {
    constructor(scope: Construct, id: string, props: PingPongStackProps) {
        super(scope, id, props);
        const api=new DiscoverableLambdaRestApi(this,`${props.serviceName}-service`, props.namespace,props.serviceName,path.join(__dirname,"/../../runtime/index.ts"),{
            "NAMESPACE":props.targetNamespace,
            "SERVICE":props.targetServiceName,
            "NAME": props.serviceName,
            "ANSWER": props.answer
        })
        //CDK Nag Suppressions
        NagSuppressions.addResourceSuppressionsByPath(this, `/${this.stackName}/${api.node.id}/function/ServiceRole/Resource`, [{
            id: "AwsSolutions-IAM4",
            reason: "I'm ok using managed policies here"
        }])
        NagSuppressions.addResourceSuppressionsByPath(this, `/${this.stackName}/${api.node.id}/function/ServiceRole/DefaultPolicy/Resource`, [{
            id: "AwsSolutions-IAM5",
            reason: "I'm ok with a wildcard here I want to be able to discover any service"
        }])
        NagSuppressions.addResourceSuppressionsByPath(this, `/${this.stackName}/${api.node.id}/api/Resource`, [{
            id: "AwsSolutions-APIG2",
            reason: "For this example I don't need request validation"
        }])
        NagSuppressions.addResourceSuppressionsByPath(this, `/${this.stackName}/${api.node.id}/api/CloudWatchRole/Resource`, [{
            id: "AwsSolutions-IAM4",
            reason: "I'm ok using managed policies here"
        }])
        NagSuppressions.addResourceSuppressionsByPath(this, `/${this.stackName}/${api.node.id}/api/DeploymentStage.prod/Resource`, [{
            id: "AwsSolutions-APIG1",
            reason: "I don't need logging for this example"
        }])
        NagSuppressions.addResourceSuppressionsByPath(this, `/${this.stackName}/${api.node.id}/api/DeploymentStage.prod/Resource`, [{
            id: "AwsSolutions-APIG3",
            reason: "No need for WAF for this example"
        }])
        NagSuppressions.addResourceSuppressionsByPath(this, `/${this.stackName}/${api.node.id}/api/DeploymentStage.prod/Resource`, [{
            id: "AwsSolutions-APIG6",
            reason: "No need for CloudWatch logging"
        }])
        NagSuppressions.addResourceSuppressionsByPath(this, `/${this.stackName}/${api.node.id}/api/Default/{proxy+}/ANY/Resource`, [{
            id: "AwsSolutions-APIG4",
            reason: "No need for authorization"
        },{
            id: "AwsSolutions-COG4",
            reason: "No need for cognito"
        }])
        NagSuppressions.addResourceSuppressionsByPath(this, `/${this.stackName}/${api.node.id}/api/Default/ANY/Resource`, [{
            id: "AwsSolutions-APIG4",
            reason: "No need for authorization"
        },{
            id: "AwsSolutions-COG4",
            reason: "No need for cognito"
        }])
        NagSuppressions.addResourceSuppressionsByPath(this, `/${this.stackName}/LogRetentionaae0aa3c5b4d4f87b02d85b201efdd8a/ServiceRole/Resource`, [{
            id: "AwsSolutions-IAM4",
            reason: "I'm ok using managed policies here for log retention"
        }])
        NagSuppressions.addResourceSuppressionsByPath(this, `/${this.stackName}/LogRetentionaae0aa3c5b4d4f87b02d85b201efdd8a/ServiceRole/DefaultPolicy/Resource`, [{
            id: "AwsSolutions-IAM5",
            reason: "I'm ok with a wildcard here for log retention"
        }])
    }
}