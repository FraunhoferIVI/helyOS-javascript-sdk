import { ApolloClient } from "apollo-client";
import gql from "graphql-tag";

import { gqlJsonResponseHandler, gqlJsonResponseInstanceHandler, parseStringifiedJsonColumns, stringifyJsonFields } from "../helyos.helpers";
import { H_Target } from '../helyos.models';


////////////////////////  Targets /////////////////////////

export class TARGET  {
    public targetsFecthing: boolean;
    public getTargetsPromise: Promise<any>;
    public getActionPromise;
    private _client:  ApolloClient<any>;
    private _socket;

    constructor(client, socket) {
        this._client = client;
        this._socket = socket;
    }


    list(since: number): Promise<any> {
        const QUERY_FUNTCION = 'allTargets';
        const TOOL_QUERY = gql`
        query ${QUERY_FUNTCION}($test: TargetCondition!){
            ${QUERY_FUNTCION}(condition: $test) {
                edges {
                    node {
                        id,
                        x,
                        y,
                        orientation,
                        targetType,
                        anchor,
                        createdAt,
                        deletedAt,
                        targetName,
                        yardId,
                    }
                }   
            }
        }
        `;

        if (this.targetsFecthing) { return this.getTargetsPromise }

        const localTime = new Date(since);
        const timestampSeconds = since / 1000 - localTime.getTimezoneOffset() * 60;
        const self = this;        
        this.getTargetsPromise = this._client.query({ query: TOOL_QUERY, variables: { test: {} } })
            .then(response => {
                self.targetsFecthing = false;
                return gqlJsonResponseHandler(response, QUERY_FUNTCION);
            })
            .catch(e => console.log(e));

        return this.getTargetsPromise;
    }


    create(target: Partial<H_Target>): Promise<any> {
        const CREATE = gql`
        mutation createTarget ($postMessage: CreateTargetInput!){
            createTarget(input: $postMessage) {
                target {
                    id,
                    x,
                    y,
                    orientation,
                    targetType,
                    anchor,
                    createdAt,
                    deletedAt,
                    targetName,
                    yardId,
                }
            }
        }
        
        `;

        delete target.id;
        const postMessage = { clientMutationId: "not_used", target: target };
        console.log("postMessage",postMessage)
        return this._client.mutate({ mutation: CREATE, variables: { postMessage, target: target } })
            .then(response => {
                return response.data.createTarget.target;
            })
            .catch(e => console.log(e))
    }
}

