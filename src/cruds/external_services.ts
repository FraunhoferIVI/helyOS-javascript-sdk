import { ApolloClient } from "apollo-client";
import gql from "graphql-tag";

import { gqlJsonResponseHandler, gqlJsonResponseInstanceHandler, parseStringifiedJsonColumns, stringifyJsonFields } from "../helyos.helpers";
import { H_Service } from '../helyos.models';
 
 
 /////////////////////////  External Services /////////////////////////
 export class EXTERNALSERVICES {
    public fetching: boolean;
    public lastListPromise;
    private _client:  ApolloClient<any>;
    private _socket;

    constructor(client, socket) {
        this._client = client;
        this._socket = socket;
    }

        list(condition: Partial<H_Service>): Promise<any> {
            const QUERY_FUNTCION = 'allServices';
            const QUERY_STR = gql`
            query ${QUERY_FUNTCION}($test: ServiceCondition!){
                ${QUERY_FUNTCION}(condition: $test, orderBy: MODIFIED_AT_DESC ) {
                edges {
                    node {
                    id,
                    name,
                    serviceType,
                    serviceUrl,
                    licenceKey,
                    class,
                    isDummy,
                    enabled,
                    config,
                    resultTimeout,
                    createdAt,
                    deletedAt,
                    modifiedAt,
                    requireMapData,
                    requireMissionAgentsData,
                    requireAgentsData
                    }
                }
                }
            }
            `;



            this.fetching = true;
            this.lastListPromise = this._client.query({ query: QUERY_STR, variables: { test: condition}  })
                .then(response => {
                    this.fetching = false;
                    return  gqlJsonResponseHandler(response, QUERY_FUNTCION);
                })
                .catch(e => {
                    console.log(e);
                    return e;
             })

            return this.lastListPromise;
        }



        create(service: Partial<H_Service>): Promise<any> {
            const QUERY_FUNTCION = 'createService';
            const CREATE = gql`
            mutation createService ($postMessage: CreateServiceInput!){
                createService(input: $postMessage) {
                        service {
                            id,
                            name,
                            serviceType,
                            serviceUrl,
                            licenceKey,
                            class,
                            isDummy,
                            enabled,
                            config,
                            resultTimeout,
                            createdAt,
                            deletedAt,
                            modifiedAt,
                            requireMapData,
                            requireMissionAgentsData,
                            requireAgentsData
                        }
                }
            }
            
            `;

            const postMessage = { clientMutationId: "not_used", service: service };
            console.log("postMessage",postMessage)
            return this._client.mutate({ mutation: CREATE, variables: { postMessage, service: service } })
                .then(response => {
                    return gqlJsonResponseInstanceHandler(response, QUERY_FUNTCION,'service' );
                })
                .catch(e => {
                    console.log(e);
                    return e;
             })
        }


        patch(data: Partial<H_Service>): Promise<any> {
            const QUERY_FUNTCION = 'updateServiceById';
            const UPDATE = gql`
            mutation  ${QUERY_FUNTCION}($postMessage: UpdateServiceByIdInput!){
                ${QUERY_FUNTCION}(input: $postMessage) {
                        service {
                            id,
                            name,
                            enabled,
                            isDummy,
                            serviceType,
                            serviceUrl,
                            licenceKey,
                            config,
                            resultTimeout,

                        }
                }
            }
            `;

            delete data['__typename'];
            const postMessage = { id: data.id, servicePatch: data };
            return this._client.mutate({ mutation: UPDATE, variables: { postMessage } })
                .then(response => {
                    console.log('create request', response);
                    return gqlJsonResponseInstanceHandler(response, QUERY_FUNTCION,'service' );
                })
                .catch(e => {
                    console.log(e);
                    return e;
             })
        }


        get(serviceId: string ): Promise<H_Service> {
            console.log("id", serviceId)

            const QUERY_FUNTCION = 'serviceById';
            const QUERY_STR = gql`
            query ${QUERY_FUNTCION}($serviceId:  BigInt! ){
                ${QUERY_FUNTCION}(id: $serviceId) {
                        id,
                        name,
                        serviceType,
                        serviceUrl,
                        licenceKey,
                        class,
                        isDummy,
                        enabled,
                        config,
                        createdAt,
                        deletedAt,
                        modifiedAt,
                        resultTimeout,
                        requireMapData,
                        requireMissionAgentsData,
                        requireAgentsData
                }
            }
            `;


            return this._client.query({ query: QUERY_STR, variables: {serviceId: parseInt(serviceId)  } })
                .then(response => {
                    const data = gqlJsonResponseHandler(response, QUERY_FUNTCION);
                    return data;
                })
                .catch(e => {
                    console.log(e);
                    return e;
             })

        }

        delete(serviceId: string ): Promise<any> {
            const QUERY_FUNTCION = 'deleteServiceById';
            const QUERY_STR = gql`
            mutation ${QUERY_FUNTCION}($deletedServiceByIdInput :  DeleteServiceByIdInput! ){
                ${QUERY_FUNTCION}(input: $deletedServiceByIdInput) {
                    deletedServiceId
                }
            }
            `;


            return this._client.query({ query: QUERY_STR, variables: {deletedServiceByIdInput: {id:parseInt(serviceId,10) }} })
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
