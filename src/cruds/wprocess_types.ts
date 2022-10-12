import { ApolloClient } from "apollo-client";
import gql from "graphql-tag";

import { gqlJsonResponseHandler, gqlJsonResponseInstanceHandler, parseStringifiedJsonColumns, stringifyJsonFields } from "../helyos.helpers";
import { H_WorkProcessType } from '../helyos.models';




 /////////////////////////  WorkProcess Type/////////////////////////

 export class WORKPROCESS_TYPE {
    public wprocessFecthing: boolean;
    public getWorkProcessTypePromise;
    public getActionPromise;
    private _client:  ApolloClient<any>;
    private _socket;

    constructor(client, socket) {
        this._client = client;
        this._socket = socket;
    }

        list(condition: Partial<H_WorkProcessType>): Promise<any> {
            const QUERY_FUNTCION = 'allWorkProcessTypes';
            const QUERY_STR = gql`
            query ${QUERY_FUNTCION}($condition: WorkProcessTypeCondition!){
                ${QUERY_FUNTCION}(condition: $condition) {
                edges {
                    node {
                    id,
                    name,
                    description,
                    numMaxAgents,
                    dispatchOrder,
                    settings,
                    extraParams,
                    }
                }
                }
            }
            `;

            if (this.wprocessFecthing) { return this.getWorkProcessTypePromise }

            this.wprocessFecthing = true;
            this.getWorkProcessTypePromise = this._client.query({ query: QUERY_STR, variables: { condition: condition }})
                .then(response => {
                    this.wprocessFecthing = false;
                    const listItems = gqlJsonResponseHandler(response, QUERY_FUNTCION);
                    return parseStringifiedJsonColumns(listItems, ['dispatchOrder', 'settings', 'extraParams'])
                    
                })
                .catch(e => console.log(e))

            return this.getWorkProcessTypePromise;
        }



        create(workProcessType: Partial<H_WorkProcessType>): Promise<any> {
            const CREATE = gql`
            mutation createWorkProcessType ($postMessage: CreateWorkProcessTypeInput!){
                createWorkProcessType(input: $postMessage) {
                        workProcessType {
                            id,
                            name,
                            description,
                            numMaxAgents,
                            dispatchOrder,
                            settings,
                            extraParams,
                        }
                }
            }
            
            `;

            const patch = {...workProcessType};
            stringifyJsonFields(patch,['settings', 'extraParams']);

            const postMessage = { clientMutationId: "not_used", workProcessType: patch };
            return this._client.mutate({ mutation: CREATE, variables: { postMessage, workProcessType: workProcessType } })
                .then(response => {
                    return response;
                })
                .catch(e => console.log(e))
        }


        patch(data: Partial<H_WorkProcessType>): Promise<any> {
            const QUERY_FUNTCION = 'updateWorkProcessTypeById';
            const UPDATE = gql`
            mutation  ${QUERY_FUNTCION}($postMessage: UpdateWorkProcessTypeByIdInput!){
                ${QUERY_FUNTCION}(input: $postMessage) {
                        workProcessType {
                            id,
                            name,
                            description,
                            numMaxAgents,
                            dispatchOrder,
                            settings,
                            extraParams,
                        }
                }
            }
            `;

            const patch = {...data};
            delete patch['__typename'];
            stringifyJsonFields(patch,['settings', 'extraParams']);

            const postMessage = { id: data.id, workProcessTypePatch: patch };
            return this._client.mutate({ mutation: UPDATE, variables: { postMessage } })
                .then(response => {
                    const wpType = gqlJsonResponseInstanceHandler(response, QUERY_FUNTCION, 'workProcessType');
                    return parseStringifiedJsonColumns([wpType], ['settings', 'extraParams'])[0];
                })
                .catch(e => console.log(e))
        }


        get(workProcessTypeId: string ): Promise<H_WorkProcessType> {
            const QUERY_FUNTCION = 'workProcessTypeById';
            const QUERY_STR = gql`
            query ${QUERY_FUNTCION}($workProcessTypeId:  BigInt! ){
                ${QUERY_FUNTCION}(id: $workProcessTypeId) {
                    id,
                    name,
                    description,
                    numMaxAgents,
                    dispatchOrder,
                    settings,
                    extraParams,
                }
            }
            `;


            this.getActionPromise = this._client.query({ query: QUERY_STR, variables: {workProcessTypeId: parseInt(workProcessTypeId)  } })
                .then(response => {
                    const wpType = gqlJsonResponseHandler(response, QUERY_FUNTCION);
                    return parseStringifiedJsonColumns([wpType], ['settings', 'extraParams'])[0];
                })
                .catch(e => console.log(e))

            return this.getActionPromise;
        }


        delete(workProcessTypeId: string ): Promise<H_WorkProcessType> {
            const QUERY_FUNTCION = 'deleteWorkProcessTypeById';
            const QUERY_STR = gql`
            mutation ${QUERY_FUNTCION}($deletedWorkProcessTypeId :  DeleteWorkProcessTypeByIdInput! ){
                ${QUERY_FUNTCION}(input: $deletedWorkProcessTypeId) {
                    deletedWorkProcessTypeId
                }
            }
            `;


            this.getActionPromise = this._client.query({ query: QUERY_STR, variables: {deletedWorkProcessTypeId: {id:parseInt(workProcessTypeId) }} })
                .then(response => {
                    const data = gqlJsonResponseHandler(response, QUERY_FUNTCION);
                    return data;
                })
                .catch(e => console.log(e))

            return this.getActionPromise;
        }

}



