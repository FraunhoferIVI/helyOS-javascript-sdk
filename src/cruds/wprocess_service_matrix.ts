import { ApolloClient } from "apollo-client";
import gql from "graphql-tag";

import { gqlJsonResponseHandler, gqlJsonResponseInstanceHandler, parseStringifiedJsonColumns, stringifyJsonFields } from "../helyos.helpers";
import { H_WorkProcessServicePlan  } from '../helyos.models';

 /////////////////////////  WorkProcess-Services Matrix /////////////////////////

 export class WORKPROCESS_SERVICE_PLAN {
    public wprocessFecthing: boolean;
    public getWorkProcessServicePlanPromise;
    public getActionPromise;
    private _client:  ApolloClient<any>;
    private _socket;

    constructor(client, socket) {
        this._client = client;
        this._socket = socket;
    }

        list(condition: any= {}, since=0): Promise<any> {
            const QUERY_FUNTCION = 'allWorkProcessServicePlans';
            const QUERY_STR = gql`
            query ${QUERY_FUNTCION}($test: WorkProcessServicePlanCondition!){
                ${QUERY_FUNTCION}(condition: $test) {
                edges {
                    node {
                    id,
                    workProcessTypeId,
                    step,
                    requestOrder,
                    agent,
                    serviceType,
                    serviceConfig,
                    dependsOnSteps,
                    isResultAssignment
                    }
                }
                }
            }
            `;

            const localTime = new Date(since);
            const timestampSeconds = since / 1000 - localTime.getTimezoneOffset() * 60;

            if (this.wprocessFecthing) { return this.getWorkProcessServicePlanPromise }

            this.wprocessFecthing = true;
            this.getWorkProcessServicePlanPromise = this._client.query({ query: QUERY_STR, variables: { test: condition}  })
                .then(response => {
                    this.wprocessFecthing = false;
                    const listItems = gqlJsonResponseHandler(response, QUERY_FUNTCION);
                    return parseStringifiedJsonColumns(listItems, ['dependsOnSteps', 'serviceConfig'])
                    
                })
                .catch(e => console.log(e))

            return this.getWorkProcessServicePlanPromise;
        }



        create(workProcessServicePlan: Partial<H_WorkProcessServicePlan>): Promise<any> {
            const CREATE = gql`
            mutation createWorkProcessServicePlan ($postMessage: CreateWorkProcessServicePlanInput!){
                createWorkProcessServicePlan(input: $postMessage) {
                        workProcessServicePlan {
                            id,
                            workProcessTypeId,
                            step,
                            requestOrder,
                            agent,
                            serviceType,
                            serviceConfig,
                            dependsOnSteps,
                            isResultAssignment
                        }
                }
            }
            
            `;

            const data = {...workProcessServicePlan};
            delete data['__typename'];
            stringifyJsonFields(data,['serviceConfig', 'dependsOnSteps']);
            const postMessage = { clientMutationId: "not_used", workProcessServicePlan: data };
            console.log("postMessage",postMessage)
            return this._client.mutate({ mutation: CREATE, variables: { postMessage, workProcessServicePlan: workProcessServicePlan } })
                .then(response => {
                    return response;
                })
                .catch(e => console.log(e))
        }


        patch(data: Partial<H_WorkProcessServicePlan>): Promise<any> {
            const QUERY_FUNTCION = 'updateWorkProcessServicePlanById';
            const UPDATE = gql`
            mutation  ${QUERY_FUNTCION}($postMessage: UpdateWorkProcessServicePlanByIdInput!){
                ${QUERY_FUNTCION}(input: $postMessage) {
                        workProcessServicePlan {
                            id,
                            workProcessTypeId,
                            step,
                            requestOrder,
                            agent,
                            serviceType,
                            serviceConfig,
                            dependsOnSteps,
                            isResultAssignment
                        }
                }
            }
            `;
            const patch = {...data};
            delete patch['__typename'];
            stringifyJsonFields(patch,['serviceConfig', 'dependsOnSteps']);
            const postMessage = { id: data.id, workProcessServicePlanPatch: patch };
            return this._client.mutate({ mutation: UPDATE, variables: { postMessage } })
                .then(response => {
                    console.log('create request', response);
                    return gqlJsonResponseInstanceHandler(response, QUERY_FUNTCION,'workProcessServicePlan' );
                })
                .catch(e => console.log(e))
        }


        get(workProcessServicePlanId: string ): Promise<H_WorkProcessServicePlan> {
            const QUERY_FUNTCION = 'workProcessServicePlanById';
            const QUERY_STR = gql`
            query ${QUERY_FUNTCION}($workProcessServicePlanId:  BigInt! ){
                ${QUERY_FUNTCION}(id: $workProcessServicePlanId) {
                    id,
                    workProcessTypeId,
                    step,
                    requestOrder,
                    agent,
                    serviceType,
                    serviceConfig,
                    dependsOnSteps,
                    isResultAssignment
                }
            }
            `;


            this.getActionPromise = this._client.query({ query: QUERY_STR, variables: {workProcessServicePlanId: parseInt(workProcessServicePlanId)  } })
                .then(response => {
                    const data = gqlJsonResponseHandler(response, QUERY_FUNTCION);
                    return parseStringifiedJsonColumns([data], ['dependsOnSteps', 'serviceConfig'])[0];
                })
                .catch(e => console.log(e))

            return this.getActionPromise;
        }


        delete(workProcessServicePlanId: string ): Promise<H_WorkProcessServicePlan> {
            const QUERY_FUNTCION = 'deleteWorkProcessServicePlanById';
            const QUERY_STR = gql`
            mutation ${QUERY_FUNTCION}($deletedWorkProcessServicePlanId :  DeleteWorkProcessServicePlanByIdInput! ){
                ${QUERY_FUNTCION}(input: $deletedWorkProcessServicePlanId) {
                    deletedWorkProcessServicePlanId
                }
            }
            `;


            this.getActionPromise = this._client.query({ query: QUERY_STR, variables: {deletedWorkProcessServicePlanId: {id:parseInt(workProcessServicePlanId) }} })
                .then(response => {
                    const data = gqlJsonResponseHandler(response, QUERY_FUNTCION);
                    return data;
                })
                .catch(e => console.log(e))

            return this.getActionPromise;
        }

}


