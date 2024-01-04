import { ApolloClient } from "apollo-client";
import gql from "graphql-tag";

import { gqlJsonResponseHandler, gqlJsonResponseInstanceHandler, parseStringifiedJsonColumns, stringifyJsonFields } from "../helyos.helpers";
import { H_AgentInterconnection } from '../helyos.models';

/////////////////////////  AGENTS_INTERCONNECTIONS /////////////////////////

export class AGENTS_INTERCONNECTIONS {
    public lastPromise;
    public fetching: boolean;
    private _client:  ApolloClient<any>;
    private _socket;

    constructor(client, socket) {
        this._client = client;
        this._socket = socket;
    }

    
    list(condition: Partial<H_AgentInterconnection>={}): Promise<any> {
        const QUERY_FUNTCION = 'allAgentsInterconnections';
        const QUERY_STR = gql`
        query ${QUERY_FUNTCION}($condition: AgentsInterconnectionCondition!){
            ${QUERY_FUNTCION}(condition: $condition) {
                edges {
                    node {
                      id
                      leaderId
                      followerId
                      connectionGeometry
                      createdAt
                      agentByFollowerId {
                        id
                        agentType
                        name
                        uuid
                      }
                    }
                }    
            }
        }
        `;

        this.fetching = true;
        const self = this;
        this.lastPromise= this._client.query({ query: QUERY_STR, variables: { condition: condition } })
            .then(response => {
                this.fetching =  false;
                const listItems = gqlJsonResponseHandler(response, QUERY_FUNTCION);
                return parseStringifiedJsonColumns(listItems, [ 'connectionGeometry']);
            })
            .catch(e => {
                    console.log(e);
                    return e;
             });

        return this.lastPromise;
    }





    patch(tool: Partial<H_AgentInterconnection>): Promise<any> {
        const QUERY_FUNTCION = 'updateAgentsInterconnectionById';
        const TOOL_UPDATE = gql`
        mutation updateAgentsInterconnectionById ($postMessage: UpdateAgentsInterconnectionByIdInput!){
            updateAgentsInterconnectionById(input: $postMessage) {
                    agentsInterconnection {
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

        return this._client.mutate({ mutation: TOOL_UPDATE, variables: { postMessage, agentsInterconnection: patch } })
            .then(response => {
                const data = gqlJsonResponseInstanceHandler(response, QUERY_FUNTCION,'agentsInterconnection' );
                return parseStringifiedJsonColumns([data], [ 'connectionGeometry'])[0];
            })
            .catch(e => {
                    console.log(e);
                    return e;
             })
    }


    create(tool: Partial<H_AgentInterconnection>): Promise<any> {
        const QUERY_FUNTCION = 'createAgentsInterconnection';
        const CREATE = gql`
        mutation ${QUERY_FUNTCION} ($postMessage: CreateAgentsInterconnectionInput!){
            createAgentsInterconnection(input: $postMessage) {
                agentsInterconnection {
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
        const postMessage = { clientMutationId: "not_used", agentsInterconnection: patch };

        return this._client.mutate({ mutation: CREATE, variables: { postMessage, agentsInterconnection: patch } })
            .then(response => {
                const data = gqlJsonResponseInstanceHandler(response, QUERY_FUNTCION,'agentsInterconnection' );
                return parseStringifiedJsonColumns([data], [ 'connectionGeometry'])[0];

            })
            .catch(e => {
                    console.log(e);
                    return e;
             })
    }


    
    get(agentId: number ): Promise<H_AgentInterconnection> {

        const QUERY_FUNTCION = 'agentsInterconnectionById';
        const QUERY_STR = gql`
        query ${QUERY_FUNTCION}($toolInterconnnectionId:  BigInt! ){
            ${QUERY_FUNTCION}(id: $toolInterconnnectionId) {
                id,
                leaderId,
                followerId
                connectionGeometry
                createdAt
                agentByFollowerId {
                    id
                    agentType
                    name
                    uuid
                  }
            }
        }
        `;


        return this._client.query({ query: QUERY_STR, variables: {id: agentId } })
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
        const QUERY_FUNTCION = 'deleteAgentsInterconnectionById';
        const QUERY_STR = gql`
        mutation ${QUERY_FUNTCION}($deletedAgentsInterconnectionById:  DeleteAgentsInterconnectionByIdInput! ){
            ${QUERY_FUNTCION}(input: $deletedAgentsInterconnectionById) {
                deletedAgentsInterconnectionId
            }
        }
        `;

        return  this._client.query({ query: QUERY_STR, variables: {deletedAgentsInterconnectionById: {id:parseInt(id,10) }} })
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