import { ApolloClient } from "apollo-client";
import gql from "graphql-tag";

import { gqlJsonResponseHandler, gqlJsonResponseInstanceHandler, parseStringifiedJsonColumns, stringifyJsonFields } from "../helyos.helpers";
import { H_WorkProcess  } from '../helyos.models';


 /////////////////////////  Work Process/////////////////////////

 export class WORKPROCESS {
    public fetching: boolean;
    public lastListPromise;
    private _client:  ApolloClient<any>;
    private _socket;

    constructor(client, socket) {
        this._client = client;
        this._socket = socket;
    }


    list(condition: Partial<H_WorkProcess>, first=100, offset=0, orderBy='ID_DESC'): Promise<any> {
        const QUERY_FUNTCION = 'allWorkProcesses';
        const QUERY_STR = gql`
        query ${QUERY_FUNTCION}($condition:WorkProcessCondition!, $orderBy:[WorkProcessesOrderBy!], $first:Int, $offset: Int){
            ${QUERY_FUNTCION}(condition: $condition, orderBy: $orderBy, first:$first, offset:$offset) {
            edges {
                node {
                id,
                status,
                yardId,
                missionQueueId,
                runOrder,
                createdAt,
                modifiedAt,
                startedAt,
                endedAt,
                schedStartAt,
                schedEndAt,
                processType,
                data,
                description,
                workProcessTypeName,
                agentIds,
                waitFreeAgent
                }
            }
            }
        }
        `;



        this.fetching = true;
        this.lastListPromise = this._client.query({ query: QUERY_STR, variables: { condition, first,
                                                                                        orderBy: orderBy,
                                                                                        offset } })
            .then(response => {
                this.fetching = false;
                const wprocesses = gqlJsonResponseHandler(response, QUERY_FUNTCION);
                return parseStringifiedJsonColumns(wprocesses, ['data']);

            })
            .catch(e => {
                    console.log(e);
                    return e;
             });

        return this.lastListPromise;
    }

    create(workProcess: Partial<H_WorkProcess>): Promise<any> {
            const CREATE = gql`
            mutation createWorkProcess ($postMessage: CreateWorkProcessInput!){
                createWorkProcess(input: $postMessage) {
                        workProcess {
                            id,
                            status,
                            yardId,
                            missionQueueId,
                            runOrder,
                            createdAt,
                            modifiedAt,
                            startedAt,
                            endedAt,
                            schedStartAt,
                            schedEndAt,
                            processType,
                            description,
                            data,
                            workProcessTypeName,
                            agentIds,
                            waitFreeAgent
                        }
                }
            }
            
            `;


            stringifyJsonFields(workProcess, ['data']);
            const postMessage = { clientMutationId: "not_used", workProcess: workProcess };
            console.log("postMessage",postMessage)
            return this._client.mutate({ mutation: CREATE, variables: { postMessage, workProcess: workProcess } })
                .then(response => {
                    return response.data.createWorkProcess.workProcess;
                })
                .catch(e => {
                    console.log(e);
                    return e;
                });
        }


        patch(wprocess: Partial<H_WorkProcess>): Promise<any> {
            const QUERY_FUNTCION = 'updateWorkProcessById';
            const UPDATE = gql`
            mutation  ${QUERY_FUNTCION}($postMessage: UpdateWorkProcessByIdInput!){
                ${QUERY_FUNTCION}(input: $postMessage) {
                        workProcess {
                            id,
                            status,
                            missionQueueId,
                            runOrder,
                            yardId,
                            createdAt,
                            modifiedAt,
                            processType,
                            data,
                            workProcessTypeName,
                            description,
                            agentIds,
                            yardId,
                            waitFreeAgent

                        }
                }
            }
            `;

            const patch = {...wprocess};
            delete patch['__typename'];
            stringifyJsonFields(patch, ['data']);
            const postMessage = { id: wprocess.id, workProcessPatch: patch };
            return this._client.mutate({ mutation: UPDATE, variables: { postMessage } })
                .then(response => {
                    console.log('create request', response);
                    return response;
                })
                .catch(e => {
                    console.log(e);
                    return e;
                });
        }


        get(workProcessId: string ): Promise<any> {
            console.log("id", workProcessId)

            const QUERY_FUNTCION = 'workProcessById';
            const QUERY_STR = gql`
            query ${QUERY_FUNTCION}($workProcessId: BigInt! ){
                ${QUERY_FUNTCION}(id: $workProcessId) {
                        id,
                        status,
                        yardId,
                        missionQueueId,
                        runOrder,
                        createdAt,
                        modifiedAt,
                        startedAt,
                        endedAt,
                        schedStartAt,
                        schedEndAt,
                        processType,
                        data,
                        description,
                        workProcessTypeName,
                        agentIds,
                        waitFreeAgent
                }
            }
            `;


            const getPromise = this._client.query({ query: QUERY_STR, variables: {workProcessId: parseInt(workProcessId)  } })
                    .then(response => {
                        const data = gqlJsonResponseHandler(response, QUERY_FUNTCION);
                        return data;
                    })
                    .catch(e => {
                    console.log(e);
                    return e;
                });

                return getPromise;
            }


        getActions(workProcessId: string ): Promise<any> {
            console.log("workProcessId id", workProcessId)
            // use Int! because the postgress function is recognized as Int!.
            const QUERY_FUNTCION = 'getworkprocessactiondata';
            const QUERY_STR = gql`
            query ${QUERY_FUNTCION}($workProcessId: BigInt! ){
                ${QUERY_FUNTCION}(wProcessId: $workProcessId) {
                edges {
                    node {
                    id,
                    data,
                    createdAt,
                    }
                }
                }
            }
            `;


            return this._client.query({ query: QUERY_STR, variables: {workProcessId: parseInt(workProcessId)  } })
                .then(response => {
                    const actions = gqlJsonResponseHandler(response, QUERY_FUNTCION);
                    actions.forEach(a => a.data = a.data?  JSON.parse(a.data):null);
                    return actions;
                })
                .catch(e => {
                    console.log(e);
                    return e;
                });

        }

}

