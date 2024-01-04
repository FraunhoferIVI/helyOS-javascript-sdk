import { ApolloClient } from "apollo-client";
import gql from "graphql-tag";

import { gqlJsonResponseHandler, gqlJsonResponseInstanceHandler, parseStringifiedJsonColumns, stringifyJsonFields } from "../helyos.helpers";
import { H_Agent } from '../helyos.models';

/////////////////////////  AGENTS /////////////////////////

export class AGENTS {
    public lastListPromise;
    public fetching: boolean;
    private _client:  ApolloClient<any>;
    private _socket;

    constructor(client, socket) {
        this._client = client;
        this._socket = socket;
    }

    
    list(condition: Partial<H_Agent>={},first=100, offset=0, orderBy='ID_ASC'): Promise<any> {
        const QUERY_FUNTCION = 'allAgents';
        const QUERY_STR = gql`
        query ${QUERY_FUNTCION}($condition: AgentCondition!, $orderBy:[AgentsOrderBy!], $first:Int, $offset: Int){
            ${QUERY_FUNTCION}(condition: $condition, orderBy: $orderBy,  first:$first, offset:$offset) {
                edges {
                    node {
                        id,
                        status,
                        connectionStatus
                        name
                        code
                        agentType
                        agentClass
                        uuid
                        dataFormat
                        sensorsDataFormat
                        geometryDataFormat
                        geometry
                        createdAt
                        isActuator
                        modifiedAt
                        msgPerSec
                        updtPerSec
                        picture
                        streamUrl
                        allowAnonymousCheckin
                        rbmqUsername
                        acknowledgeReservation
                        protocol
                        yardId
                            x
                            y
                            orientation
                            orientations
                            sensors
                    }
                }   
            }
        }
        `;

        this.fetching = true;
        const self = this;
        this.lastListPromise= this._client.query({ query: QUERY_STR, variables: { condition, first,
                                                                                            orderBy: orderBy,
                                                                                            offset } })
            .then(response => {
                self.fetching =  false;
                const listItems = gqlJsonResponseHandler(response, QUERY_FUNTCION);
                return parseStringifiedJsonColumns(listItems, ['sensors', 'geometry']);
            })
            .catch(e => {
                    console.log(e);
                    return e;
             });

        return this.lastListPromise;
    }




    history(startDateTime: Date, endtDateTime: Date): Promise<any> {
        console.log("startDateTime", startDateTime)
        console.log("endtDateTime", endtDateTime)

        const QUERY_FUNTCION = 'selecttoolposehistory';
        const QUERY_STR = gql`
        query ${QUERY_FUNTCION}($startTime: Float!, $endTime: Float! ){
            ${QUERY_FUNTCION}(startTime: $startTime, endTime: $endTime) {
            edges {
                node {
                id,
                createdAt,
                x,
                y,
                orientation,
                orientations
                agentId,
                sensors,
                }
            }
            }
        }
        `;

        // const start_time = since / 1000 - localTime.getTimezoneOffset() * 60;
        const localTime = new Date();

        const startTime = startDateTime.getTime()/1000;
        const endTime = endtDateTime.getTime()/1000 + 1000;


        console.log("startTime", startTime)
        console.log("endTime", endTime)

        return this._client.query({ query: QUERY_STR, variables: {startTime, endTime  } })
            .then(response => {
                console.log("update time from gql", startTime);
                const toolposes = gqlJsonResponseHandler(response, QUERY_FUNTCION);
                return toolposes;
            })
            .catch(e => {
                    console.log(e);
                    return e;
             })

    }



    patch(agent: Partial<H_Agent>): Promise<any> {
        const QUERY_FUNTCION = 'updateAgentById';
        const TOOL_UPDATE = gql`
        mutation updateAgentById ($postMessage: UpdateAgentByIdInput!){
            updateAgentById(input: $postMessage) {
                    agent {
                        id,
                        picture,
                        wpClearance
                        connectionStatus,
                        dataFormat,
                        sensorsDataFormat,
                        geometryDataFormat,
                        geometry,
                        isActuator,
                        name,
                        streamUrl,
                        allowAnonymousCheckin,
                         verifySignature,
                        rbmqUsername,
                        acknowledgeReservation,
                        protocol
                    }
            }
        }
        `;

        const patch = {...agent};
        delete patch['__typename'];
        stringifyJsonFields(patch,['geometry', 'factsheet', 'wpClearance']);
        const postMessage = { id: agent.id, agentPatch: patch };

        return this._client.mutate({ mutation: TOOL_UPDATE, variables: { postMessage, agent: patch } })
            .then(response => {
                const data = gqlJsonResponseInstanceHandler(response, QUERY_FUNTCION,'agent' );
                return parseStringifiedJsonColumns([data], ['sensors', 'geometry', 'factsheet', 'wpClearance'])[0];
            })
            .catch(e => {
                    console.log(e);
                    return e;
             })
    }


    create(agent: Partial<H_Agent>): Promise<any> {
        const QUERY_FUNTCION = 'createAgent';
        const CREATE = gql`
        mutation createAgent ($postMessage: CreateAgentInput!){
            createAgent(input: $postMessage) {
                agent {
                    id
                    status
                    name
                    code
                    agentType
                    agentClass
                    connectionStatus
                    uuid
                    geometry
                    sensorsDataFormat
                    geometryDataFormat
                    isActuator
                    verifySignature
                    createdAt
                    modifiedAt
                    picture
                    streamUrl
                    yardId
                    protocol
                    x
                    y
                    orientation
                    orientations
                    sensors
                }
            }
        }
        
        `;


        const patch = {...agent};
        delete patch['__typename'];
        stringifyJsonFields(patch,['geometry','factsheet', 'wpClearance']);
        const postMessage = { clientMutationId: "not_used", agent: patch };

        return this._client.mutate({ mutation: CREATE, variables: { postMessage, agent: patch } })
            .then(response => {
                const data = gqlJsonResponseInstanceHandler(response, QUERY_FUNTCION,'agent' );
                return parseStringifiedJsonColumns([data], ['sensors', 'geometry','factsheet',])[0];

            })
            .catch(e => {
                    console.log(e);
                    return e;
             })
    }


    
    get(agentId: number ): Promise<H_Agent> {

        const QUERY_FUNTCION = 'agentById';
        const QUERY_STR = gql`
        query ${QUERY_FUNTCION}($agentId:  BigInt! ){
            ${QUERY_FUNTCION}(id: $agentId) {
                id,
                status
                wpClearance
                name
                code
                connectionStatus
                agentType
                agentClass
                uuid
                dataFormat
                sensorsDataFormat
                geometryDataFormat
                geometry
                factsheet
                createdAt
                isActuator
                modifiedAt
                msgPerSec
                updtPerSec
                picture
                streamUrl
                publicKey
                verifySignature
                yardId
                x
                y
                orientation
                orientations
                sensors
                allowAnonymousCheckin
                rbmqUsername
                acknowledgeReservation
                protocol
            }
        }
        `;


        return this._client.query({ query: QUERY_STR, variables: {agentId: agentId } })
            .then(response => {
                const data = gqlJsonResponseHandler(response, QUERY_FUNTCION);
                return parseStringifiedJsonColumns([data], ['sensors', 'geometry', 'factsheet','wpClearance'])[0];
            })
            .catch(e => {
                    console.log(e);
                    return e;
             })

    }

    delete(id): Promise<any> {
        const QUERY_FUNTCION = 'deleteAgentById';
        const QUERY_STR = gql`
        mutation ${QUERY_FUNTCION}($deletedAgentById:  DeleteAgentByIdInput! ){
            ${QUERY_FUNTCION}(input: $deletedAgentById) {
                deletedAgentId
            }
        }
        `;

        return  this._client.query({ query: QUERY_STR, variables: {deletedAgentById: {id:parseInt(id,10) }} })
            .then(response => {
                const data = gqlJsonResponseHandler(response, QUERY_FUNTCION);
                return data;
            })
            .catch(e => {
                    console.log(e);
                    return e;
             })    
    }



    

    createRabbitMQAgent(agentId:number, username:string, password:string): Promise<any> {
        const QUERY_FUNTCION = 'registerRabbitmqAccount';
        const QUERY_STR = gql`
        mutation ${QUERY_FUNTCION}($inputById: RegisterRabbitmqAccountInput! ){
            ${QUERY_FUNTCION}(input: $inputById) {
                integer
            }
        }
        `;

        return  this._client.query({ query: QUERY_STR, variables: {inputById: {agentId, username, password }} })
            .then(response => {
                return response;
            })
            .catch(e => {
                    console.log(e);
                    return e;
             })    
            
    }


}