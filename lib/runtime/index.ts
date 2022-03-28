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

import {APIGatewayProxyEvent, APIGatewayProxyResult, Context} from "aws-lambda";
import {DiscoverInstancesCommand, ServiceDiscoveryClient} from "@aws-sdk/client-servicediscovery";
import fetch from "node-fetch";


const namespace=process.env.NAMESPACE
const service=process.env.SERVICE
const name=process.env.NAME
const answer=process.env.ANSWER
export const handler = async (event:APIGatewayProxyEvent,context:Context): Promise<APIGatewayProxyResult> => {

    if(event.httpMethod=="GET") {
        let msg = `Could not discover ${namespace}:${service} service`
        try {

            const client = new ServiceDiscoveryClient({})
            const response = await client.send(new DiscoverInstancesCommand({
                NamespaceName: namespace,
                ServiceName: service,

            }))
            console.debug(response)

            if (response.Instances != null && response.Instances.length > 0) {
                const attributes = response.Instances[0].Attributes
                if (attributes != null && attributes["url"] != null) {
                    const url = attributes["url"]
                    console.info(url)
                    const response = await fetch(url,{method:"POST"})
                    msg = await response.text()
                }

            }
        } catch (e) {
            console.error(e)
            msg = e.message
        }
        return {statusCode: 200, body: `{\"${name}\":\"${msg}\"}`};
    }
    else{
        return {statusCode: 200, body: answer!};
    }


};