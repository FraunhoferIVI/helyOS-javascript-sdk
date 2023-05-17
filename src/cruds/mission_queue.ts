import { ApolloClient } from "apollo-client";
import gql from "graphql-tag";

import { gqlJsonResponseHandler, gqlJsonResponseInstanceHandler, parseStringifiedJsonColumns, stringifyJsonFields } from "../helyos.helpers";
import { H_MissionQueue  } from '../helyos.models';


 /////////////////////////  Work Process/////////////////////////

 export class MISSIONQUEUE {
    public wprocessFecthing: boolean;
    public getMissionQueuePromise;
    public getActionPromise;
    private _client:  ApolloClient<any>;
    private _socket;

    constructor(client, socket) {
        this._client = client;
        this._socket = socket;
    }


    list(condition: Partial<H_MissionQueue>, orderBy='MODIFIED_AT_DESC'): Promise<any> {
        const QUERY_FUNTCION = 'allMissionQueues';
        const QUERY_STR = gql`
        query ${QUERY_FUNTCION}($condition:MissionQueueCondition!,  $orderBy:[MissionQueuesOrderBy!]){
            ${QUERY_FUNTCION}(condition: $condition, orderBy: $orderBy) {
            edges {
                node {
                id,
                name,
                status,
                createdAt,
                modifiedAt,
                startedAt,
                endedAt,
                schedStartAt,
                schedEndAt,
                stopOnFailure,
                description,
                }
            }
            }
        }
        `;


        if (this.wprocessFecthing) { return this.getMissionQueuePromise }

        this.wprocessFecthing = true;
        this.getMissionQueuePromise = this._client.query({ query: QUERY_STR, variables: { condition, orderBy}  })
            .then(response => {
                this.wprocessFecthing = false;
                const wprocesses = gqlJsonResponseHandler(response, QUERY_FUNTCION);
                return wprocesses;

            })
            .catch(e => {
                    console.log(e);
                    return e;
             })

        return this.getMissionQueuePromise;
    }



        listRecent(since: number): Promise<any> {
            const QUERY_FUNTCION = 'allMissionQueues';
            const QUERY_STR = gql`
            query ${QUERY_FUNTCION}($test: MissionQueueCondition!){
                ${QUERY_FUNTCION}(condition: $test, orderBy: MODIFIED_AT_DESC) {
                edges {
                    node {
                    id,
                    name,
                    status,
                    createdAt,
                    modifiedAt,
                    startedAt,
                    endedAt,
                    schedStartAt,
                    schedEndAt,
                    stopOnFailure,
                    description,
                    }
                }
                }
            }
            `;

            const localTime = new Date(since);
            const timestampSeconds = since / 1000 - localTime.getTimezoneOffset() * 60;

            if (this.wprocessFecthing) { return this.getMissionQueuePromise }

            this.wprocessFecthing = true;
            this.getMissionQueuePromise = this._client.query({ query: QUERY_STR, variables: { test: {}}  })
                .then(response => {
                    this.wprocessFecthing = false;
                    console.log("update time from gql", timestampSeconds);
                    const wprocesses = gqlJsonResponseHandler(response, QUERY_FUNTCION);
                    return wprocesses;

                })
                .catch(e => {
                    console.log(e);
                    return e;
             })

            return this.getMissionQueuePromise;
        }



        create(missionQueue: Partial<H_MissionQueue>): Promise<any> {
            const CREATE = gql`
            mutation createMissionQueue ($postMessage: CreateMissionQueueInput!){
                createMissionQueue(input: $postMessage) {
                        missionQueue {
                            id,
                            name,
                            status,
                            createdAt,
                            modifiedAt,
                            startedAt,
                            endedAt,
                            schedStartAt,
                            schedEndAt,
                            stopOnFailure,
                            description,
                        }
                }
            }
            
            `;


            const postMessage = { clientMutationId: "not_used", missionQueue: missionQueue };
            console.log("postMessage",postMessage)
            return this._client.mutate({ mutation: CREATE, variables: { postMessage, missionQueue: missionQueue } })
                .then(response => {
                    return response;
                })
                .catch(e => {
                    console.log(e);
                    return e;
             })
        }


        patch(wprocess: Partial<H_MissionQueue>): Promise<any> {
            const QUERY_FUNTCION = 'updateMissionQueueById';
            const UPDATE = gql`
            mutation  ${QUERY_FUNTCION}($postMessage: UpdateMissionQueueByIdInput!){
                ${QUERY_FUNTCION}(input: $postMessage) {
                        missionQueue {
                            id,
                            name,
                            status,
                            createdAt,
                            modifiedAt,
                            startedAt,
                            endedAt,
                            schedStartAt,
                            schedEndAt,
                            stopOnFailure,
                            description,
                        }
                }
            }
            `;

            const patch = {...wprocess};
            delete patch['__typename'];
            const postMessage = { id: wprocess.id, missionQueuePatch: patch };
            return this._client.mutate({ mutation: UPDATE, variables: { postMessage } })
                .then(response => {
                    console.log('create request', response);
                    return response;
                })
                .catch(e => {
                    console.log(e);
                    return e;
             })
        }


        get(missionQueueId: string ): Promise<any> {
            console.log("id", missionQueueId)

            const QUERY_FUNTCION = 'missionQueueById';
            const QUERY_STR = gql`
            query ${QUERY_FUNTCION}($missionQueueId: BigInt! ){
                ${QUERY_FUNTCION}(id: $missionQueueId) {
                    id,
                    name,
                    status,
                    createdAt,
                    modifiedAt,
                    startedAt,
                    endedAt,
                    schedStartAt,
                    schedEndAt,
                    stopOnFailure,
                    description,
                }
            }
            `;


            const getPromise = this._client.query({ query: QUERY_STR, variables: {missionQueueId: parseInt(missionQueueId)  } })
                    .then(response => {
                        const data = gqlJsonResponseHandler(response, QUERY_FUNTCION);
                        return data;
                    })
                    .catch(e => {
                    console.log(e);
                    return e;
             })

                return getPromise;
            }


            delete(id: any): Promise<any> {
                const QUERY_FUNTCION = 'deleteMissionQueueById';
                const QUERY_STR = gql`
                mutation ${QUERY_FUNTCION}($deletedId :  DeleteMissionQueueByIdInput! ){
                    ${QUERY_FUNTCION}(input: $deletedId) {
                        deletedMissionQueueId
                    }
                }
                `;
        
                return  this._client.query({ query: QUERY_STR, variables: {deletedId: {id:parseInt(id,10) }} })
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

