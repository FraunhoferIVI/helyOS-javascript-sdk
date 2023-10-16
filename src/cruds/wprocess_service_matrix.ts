import { ApolloClient } from "apollo-client";
import gql from "graphql-tag";

import { gqlJsonResponseHandler, gqlJsonResponseInstanceHandler, parseStringifiedJsonColumns, stringifyJsonFields } from "../helyos.helpers";
import { H_WorkProcessServicePlan  } from '../helyos.models';

 /////////////////////////  WorkProcess-Services Matrix /////////////////////////

 export class WORKPROCESS_SERVICE_PLAN {
    public fetching: boolean;
    public lastListPromise;
    private _client:  ApolloClient<any>;
    private _socket;

    constructor(client, socket) {
        this._client = client;
        this._socket = socket;
    }

        list(condition: any= {}, since=0, first=100, offset=0, orderBy='REQUEST_ORDER_ASC'): Promise<any> {
            const QUERY_FUNTCION = 'allWorkProcessServicePlans';
            const QUERY_STR = gql`
            query ${QUERY_FUNTCION}($condition: WorkProcessServicePlanCondition!, $orderBy:[WorkProcessServicePlansOrderBy!], $first:Int, $offset: Int){
                ${QUERY_FUNTCION}(condition: $condition, orderBy: $orderBy,  first:$first, offset:$offset) {
                edges {
                    node {
                    id,
                    workProcessTypeId,
                    step,
                    requestOrder,
                    agent,
                    serviceType,
                    waitDependenciesAssignments,
                    serviceConfig,
                    dependsOnSteps,
                    isResultAssignment
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
                    const listItems = gqlJsonResponseHandler(response, QUERY_FUNTCION);
                    return parseStringifiedJsonColumns(listItems, ['dependsOnSteps', 'serviceConfig'])
                    
                })
                .catch(e => {
                    console.log(e);
                    return e;
             })

            return this.lastListPromise;
        }



        create(workProcessServicePlan: Partial<H_WorkProcessServicePlan>): Promise<any> {
            const QUERY_FUNCTION = 'createWorkProcessServicePlan';
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
                            waitDependenciesAssignments,
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
                    return response.data[QUERY_FUNCTION].workProcessServicePlan;
                })
                .catch(e => {
                    console.log(e);
                    return e;
             })
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
                            waitDependenciesAssignments,
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
                .catch(e => {
                    console.log(e);
                    return e;
             })
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
                    waitDependenciesAssignments
                    serviceType,
                    serviceConfig,
                    dependsOnSteps,
                    isResultAssignment
                }
            }
            `;


            return this._client.query({ query: QUERY_STR, variables: {workProcessServicePlanId: parseInt(workProcessServicePlanId)  } })
                .then(response => {
                    const data = gqlJsonResponseHandler(response, QUERY_FUNTCION);
                    return parseStringifiedJsonColumns([data], ['dependsOnSteps', 'serviceConfig'])[0];
                })
                .catch(e => {
                    console.log(e);
                    return e;
             })

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


            return this._client.query({ query: QUERY_STR, variables: {deletedWorkProcessServicePlanId: {id:parseInt(workProcessServicePlanId) }} })
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


