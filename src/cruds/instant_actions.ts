import { ApolloClient } from "apollo-client";
import gql from "graphql-tag";

import { gqlJsonResponseHandler} from "../helyos.helpers";
import { H_InstantAction  } from '../helyos.models';


 /////////////////////////  Work Process/////////////////////////

 export class INSTANT_ACTIONS {
    public fetching: boolean;
    public lastListPromise;
    private _client:  ApolloClient<any>;
    private _socket;

    constructor(client, socket) {
        this._client = client;
        this._socket = socket;
    }

        list(condition: Partial<H_InstantAction>): Promise<any> {
            const QUERY_FUNTCION = 'allINSTANT_ACTIONS';
            const QUERY_STR = gql`
            query ${QUERY_FUNTCION}($condition: InstantActionCondition!){
                ${QUERY_FUNTCION}(condition: $condition, orderBy: ID_DESC) {
                edges {
                    node {
                    id,
                    status,
                    yardId,
                    createdAt,
                    toolId,
                    toolUuid,
                    error,
                    sender
                    }
                }
                }
            }
            `;


            this.fetching = true;
            this.lastListPromise = this._client.query({ query: QUERY_STR, variables: { condition: condition}  })
                .then(response => {
                    this.fetching = false;
                    const wprocesses = gqlJsonResponseHandler(response, QUERY_FUNTCION);
                    return wprocesses;

                })
                .catch(e => {
                    console.log(e);
                    return e;
             })

            return this.lastListPromise;
        }



        create(instantAction: Partial<H_InstantAction>): Promise<any> {
            const CREATE = gql`
            mutation createInstantAction ($postMessage: CreateInstantActionInput!){
                createInstantAction(input: $postMessage) {
                        instantAction {
                            id,
                            status,
                            yardId,
                            createdAt,
                            toolId,
                            toolUuid,
                            error,
                            sender
                            
                        }
                }
            }
            
            `;


            const postMessage = { clientMutationId: "not_used", instantAction: instantAction };
            console.log("postMessage",postMessage)
            return this._client.mutate({ mutation: CREATE, variables: { postMessage, instantAction: instantAction } })
                .then(response => {
                    return response.data.createInstantAction.instantAction;
                })
                .catch(e => {
                    console.log(e);
                    return e;
             })
        }


        patch(wprocess: Partial<H_InstantAction>): Promise<any> {
            const QUERY_FUNTCION = 'updateInstantActionById';
            const UPDATE = gql`
            mutation  ${QUERY_FUNTCION}($postMessage: UpdateInstantActionByIdInput!){
                ${QUERY_FUNTCION}(input: $postMessage) {
                        instantAction {
                            id,
                            status,
                            yardId,
                            createdAt,
                            toolId,
                            toolUuid,
                            error,
                            sender,
                            result
                            

                        }
                }
            }
            `;

            const patch = {...wprocess};
            delete patch['__typename'];
            const postMessage = { id: wprocess.id, instantActionPatch: patch };
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


        get(instantActionId: string ): Promise<any> {
            console.log("id", instantActionId)

            const QUERY_FUNTCION = 'instantActionById';
            const QUERY_STR = gql`
            query ${QUERY_FUNTCION}($instantActionId: BigInt! ){
                ${QUERY_FUNTCION}(id: $instantActionId) {
                    id,
                    status,
                    yardId,
                    createdAt,
                    toolId,
                    toolUuid,
                    error,
                    sender,
                    result
                }
            }
            `;


            return this._client.query({ query: QUERY_STR, variables: {instantActionId: parseInt(instantActionId)  } })
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

