import { ApolloClient } from "apollo-client";
import gql from "graphql-tag";

import { gqlJsonResponseHandler, gqlJsonResponseInstanceHandler, parseStringifiedJsonColumns, stringifyJsonFields } from "../helyos.helpers";
import { H_WorkProcess  } from '../helyos.models';


 /////////////////////////  Work Process/////////////////////////

 export class WORKPROCESS {
    public wprocessFecthing: boolean;
    public getWorkProcessPromise;
    public getActionPromise;
    private _client:  ApolloClient<any>;
    private _socket;

    constructor(client, socket) {
        this._client = client;
        this._socket = socket;
    }

        list(since: number): Promise<any> {
            const QUERY_FUNTCION = 'allWorkProcesses';
            const QUERY_STR = gql`
            query ${QUERY_FUNTCION}($test: WorkProcessCondition!){
                ${QUERY_FUNTCION}(condition: $test, orderBy: MODIFIED_AT_DESC) {
                edges {
                    node {
                    id,
                    status,
                    yardId,
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
                    toolIds,
                    waitFreeAgent
                    }
                }
                }
            }
            `;

            const localTime = new Date(since);
            const timestampSeconds = since / 1000 - localTime.getTimezoneOffset() * 60;

            if (this.wprocessFecthing) { return this.getWorkProcessPromise }

            this.wprocessFecthing = true;
            this.getWorkProcessPromise = this._client.query({ query: QUERY_STR, variables: { test: {}}  })
                .then(response => {
                    this.wprocessFecthing = false;
                    console.log("update time from gql", timestampSeconds);
                    const wprocesses = gqlJsonResponseHandler(response, QUERY_FUNTCION);
                    return parseStringifiedJsonColumns(wprocesses, ['data']);

                })
                .catch(e => console.log(e))

            return this.getWorkProcessPromise;
        }



        create(workProcess: Partial<H_WorkProcess>): Promise<any> {
            const CREATE = gql`
            mutation createWorkProcess ($postMessage: CreateWorkProcessInput!){
                createWorkProcess(input: $postMessage) {
                        workProcess {
                            id,
                            status,
                            yardId,
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
                            toolIds,
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
                    return response;
                })
                .catch(e => console.log(e))
        }


        patch(wprocess: Partial<H_WorkProcess>): Promise<any> {
            const QUERY_FUNTCION = 'updateWorkProcessById';
            const UPDATE = gql`
            mutation  ${QUERY_FUNTCION}($postMessage: UpdateWorkProcessByIdInput!){
                ${QUERY_FUNTCION}(input: $postMessage) {
                        workProcess {
                            id,
                            status,
                            yardId,
                            createdAt,
                            modifiedAt,
                            processType,
                            data,
                            workProcessTypeName,
                            description,
                            toolIds,
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
                .catch(e => console.log(e))
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
                        toolIds,
                        waitFreeAgent
                }
            }
            `;


            const getPromise = this._client.query({ query: QUERY_STR, variables: {workProcessId: parseInt(workProcessId)  } })
                    .then(response => {
                        const data = gqlJsonResponseHandler(response, QUERY_FUNTCION);
                        return data;
                    })
                    .catch(e => console.log(e))

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


            const getActionPromise = this._client.query({ query: QUERY_STR, variables: {workProcessId: parseInt(workProcessId)  } })
                .then(response => {
                    const actions = gqlJsonResponseHandler(response, QUERY_FUNTCION);
                    actions.forEach(a=> a.data = JSON.parse(a.data));

                    return actions;
                })
                .catch(e => console.log(e))

            return getActionPromise;
        }

}

