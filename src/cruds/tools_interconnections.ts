import { ApolloClient } from "apollo-client";
import gql from "graphql-tag";

import { gqlJsonResponseHandler, gqlJsonResponseInstanceHandler, parseStringifiedJsonColumns, stringifyJsonFields } from "../helyos.helpers";
import { H_ToolInterconnection } from '../helyos.models';

/////////////////////////  TOOLS /////////////////////////

export class TOOLS_INTERCONNECTIONS {
    public getToolsPromise;
    public getToolPosesPromise;
    public toolFecthing: boolean;
    private _client:  ApolloClient<any>;
    private _socket;

    constructor(client, socket) {
        this._client = client;
        this._socket = socket;
    }

    
    list(condition: Partial<H_ToolInterconnection>={}): Promise<any> {
        const QUERY_FUNTCION = 'allToolsInterconnections';
        const QUERY_STR = gql`
        query ${QUERY_FUNTCION}($condition: ToolsInterconnectionCondition!){
            ${QUERY_FUNTCION}(condition: $condition) {
                edges {
                    node {
                      id
                      leaderId
                      followerId
                      connectionGeometry
                      createdAt
                      toolByFollowerId {
                        id
                        toolType
                        name
                        uuid
                      }
                    }
                }    
            }
        }
        `;

        this.toolFecthing = true;
        const self = this;
        this.getToolsPromise= this._client.query({ query: QUERY_STR, variables: { condition: condition } })
            .then(response => {
                self.toolFecthing =  false;
                const listItems = gqlJsonResponseHandler(response, QUERY_FUNTCION);
                return parseStringifiedJsonColumns(listItems, [ 'connectionGeometry']);
            })
            .catch(e => {
                    console.log(e);
                    return e;
             });

        return this.getToolsPromise;
    }





    patch(tool: Partial<H_ToolInterconnection>): Promise<any> {
        const QUERY_FUNTCION = 'updateToolsInterconnectionById';
        const TOOL_UPDATE = gql`
        mutation updateToolsInterconnectionById ($postMessage: UpdateToolsInterconnectionByIdInput!){
            updateToolsInterconnectionById(input: $postMessage) {
                    toolsInterconnection {
                        id,
                        leaderId,
                        followerId
                        connectionGeometry
                        createdAt
                    }
            }
        }
        `;

        const patch = {...tool};
        delete patch['__typename'];
        stringifyJsonFields(patch,['connectionGeometry']);
        const postMessage = { id: tool.id, toolPatch: patch };

        return this._client.mutate({ mutation: TOOL_UPDATE, variables: { postMessage, tool: patch } })
            .then(response => {
                const data = gqlJsonResponseInstanceHandler(response, QUERY_FUNTCION,'tool' );
                return parseStringifiedJsonColumns([data], [ 'connectionGeometry'])[0];
            })
            .catch(e => {
                    console.log(e);
                    return e;
             })
    }


    create(tool: Partial<H_ToolInterconnection>): Promise<any> {
        const QUERY_FUNTCION = 'createToolsInterconnection';
        const CREATE = gql`
        mutation ${QUERY_FUNTCION} ($postMessage: CreateToolsInterconnectionInput!){
            createToolsInterconnection(input: $postMessage) {
                toolsInterconnection {
                    id
                    leaderId
                    followerId
                    connectionGeometry
                    createdAt
                }
            }
        }
        
        `;


        const patch = {...tool};
        delete patch['__typename'];
        stringifyJsonFields(patch,['connectionGeometry']);
        const postMessage = { clientMutationId: "not_used", tool: patch };

        return this._client.mutate({ mutation: CREATE, variables: { postMessage, tool: patch } })
            .then(response => {
                const data = gqlJsonResponseInstanceHandler(response, QUERY_FUNTCION,'tool' );
                return parseStringifiedJsonColumns([data], [ 'connectionGeometry'])[0];

            })
            .catch(e => {
                    console.log(e);
                    return e;
             })
    }


    
    get(toolId: number ): Promise<H_ToolInterconnection> {

        const QUERY_FUNTCION = 'toolsInterconnectionById';
        const QUERY_STR = gql`
        query ${QUERY_FUNTCION}($toolInterconnnectionId:  BigInt! ){
            ${QUERY_FUNTCION}(id: $toolInterconnnectionId) {
                id,
                leaderId,
                followerId
                connectionGeometry
                createdAt
                toolByFollowerId {
                    id
                    toolType
                    name
                    uuid
                  }
            }
        }
        `;


        return this._client.query({ query: QUERY_STR, variables: {toolId: toolId } })
            .then(response => {
                const data = gqlJsonResponseHandler(response, QUERY_FUNTCION);
                return parseStringifiedJsonColumns([data], [ 'connectionGeometry'])[0];
            })
            .catch(e => {
                    console.log(e);
                    return e;
             })

    }

    delete(id): Promise<any> {
        const QUERY_FUNTCION = 'deleteToolsInterconnectionById';
        const QUERY_STR = gql`
        mutation ${QUERY_FUNTCION}($deletedToolsInterconnectionById:  DeleteToolsInterconnectionByIdInput! ){
            ${QUERY_FUNTCION}(input: $deletedToolsInterconnectionById) {
                deletedToolsInterconnectionId
            }
        }
        `;

        return  this._client.query({ query: QUERY_STR, variables: {deletedToolsInterconnectionById: {id:parseInt(id,10) }} })
            .then(response => {
                const data = gqlJsonResponseHandler(response, QUERY_FUNTCION);
                return data;
            })
            .catch(e => {
                    console.log(e);
                    return e;
             })    
    }



}