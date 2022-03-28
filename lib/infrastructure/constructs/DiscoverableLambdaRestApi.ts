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

import {Construct} from "constructs";

import {NodejsFunction} from "aws-cdk-lib/aws-lambda-nodejs";
import {Duration, Lazy} from "aws-cdk-lib";
import {Runtime} from "aws-cdk-lib/aws-lambda";
import {RetentionDays} from "aws-cdk-lib/aws-logs";
import {LambdaRestApi} from "aws-cdk-lib/aws-apigateway";
import {HttpNamespace} from "aws-cdk-lib/aws-servicediscovery";
import {Effect, ManagedPolicy, PolicyDocument, PolicyStatement, Role, ServicePrincipal} from "aws-cdk-lib/aws-iam";

export class DiscoverableLambdaRestApi extends Construct {

    constructor(scope: Construct, id: string, namespace: string, serviceName: string, functionPath: string, environment: {
        [key: string]: string;
    }) {
        super(scope, id);
        const lambda = new NodejsFunction(this, "function", {
            memorySize: 256,
            timeout: Duration.seconds(30),
            runtime: Runtime.NODEJS_14_X,
            handler: "handler",
            entry: functionPath,
            logRetention: RetentionDays.ONE_MONTH,
            environment: environment
        });

        const api = new LambdaRestApi(this, "api", {
            handler: lambda,
            proxy: true
        })

        const httpNamespace = new HttpNamespace(this, 'namespace', {
            name: namespace,
        });
        const service = httpNamespace.createService("service", {
            name: serviceName,

        })
        service.registerNonIpInstance("cname", {
            customAttributes: {
                "url": api.deploymentStage.urlForPath("/")
            },
            instanceId: "apigw"
        })
        lambda.addToRolePolicy(new PolicyStatement({
            effect: Effect.ALLOW,
            actions: ["servicediscovery:DiscoverInstances"],
            resources: ["*"]
        }))


    }
}