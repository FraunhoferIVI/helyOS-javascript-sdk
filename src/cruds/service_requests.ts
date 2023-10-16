
import { ApolloClient } from "apollo-client";
import gql from "graphql-tag";

import { gqlJsonResponseHandler, gqlJsonResponseInstanceHandler, parseStringifiedJsonColumns, stringifyJsonFields } from "../helyos.helpers";
import { H_ServiceRequest, H_Service  } from '../helyos.models';

 /////////////////////////  Service Requests/////////////////////////
 export class SERVICEREQUESTS {
    public fetching: boolean;
    public lastListPromise: Promise<any>;
    private _client:  ApolloClient<any>;
    private _socket;

    constructor(client, socket) {
        this._client = client;
        this._socket = socket;
    }

        list(condition: Partial<H_ServiceRequest>, first=100, offset=0, orderBy='ID_DESC'): Promise<any> {
            const QUERY_FUNTCION = 'allServiceRequests';
            const QUERY_STR = gql`
            query ${QUERY_FUNTCION}($condition:  ServiceRequestCondition!, $orderBy:[ServiceRequestsOrderBy!], $first:Int, $offset: Int){
                ${QUERY_FUNTCION}(condition: $condition,  orderBy: $orderBy,  first:$first, offset:$offset ) {
                edges {
                    node {
                        assignmentDispatched
                        workProcessId
                        step
                        status
                        startAt
                        serviceUrl
                        serviceType
                        resultTimeout
                        dispatchedAt
                        resultAt
                        serviceQueueId
                        requestUid
                        processed
                        nodeId
                        nextRequestToDispatchUid
                        modifiedAt
                        isResultAssignment
                        id
                        fetched
                        dependOnRequests
                        createdAt
                        canceled
                        config

                    }
                }
                }
            }
            `;


            this.fetching = true;
            this.lastListPromise = this._client.query({ query: QUERY_STR,  variables: { condition, first,
                                                                                            orderBy: orderBy,
                                                                                            offset } })
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



        get(serviceRequestId: string ): Promise<H_Service> {

            const QUERY_FUNTCION = 'serviceRequestById';
            const QUERY_STR = gql`
            query ${QUERY_FUNTCION}($serviceRequestId:  BigInt! ){
                ${QUERY_FUNTCION}(id: $serviceRequestId) {
                    assignmentDispatched
                    context
                    workProcessId
                    step
                    status
                    startAt
                    serviceUrl
                    serviceType
                    resultTimeout
                    dispatchedAt
                    resultAt
                    resultTimeout
                    serviceQueueId
                    response
                    requestUid
                    request
                    processed
                    nodeId
                    nextRequestToDispatchUid
                    modifiedAt
                    isResultAssignment
                    id
                    fetched
                    dependOnRequests
                    createdAt
                    canceled
                    config
                  }
            }
            `;


           return this._client.query({ query: QUERY_STR, variables: {serviceRequestId: parseInt(serviceRequestId)  } })
                .then(response => {
                    const data = gqlJsonResponseHandler(response, QUERY_FUNTCION);
                    return data;
                })
                .catch(e => {
                    console.log(e);
                    return e;
             })

        }

        delete(serviceRequestId: string ): Promise<any> {
            const QUERY_FUNTCION = 'deleteServiceRequestById';
            const SHAPE_QUERY = gql`
            mutation ${QUERY_FUNTCION}($deletedServiceByIdInput :  serviceRequestByIdInput! ){
                ${QUERY_FUNTCION}(input: $deletedServiceByIdInput) {
                    deletedServiceId
                }
            }
            `;


            return this._client.query({ query: SHAPE_QUERY, variables: {deleteServiceRequestById: {id:parseInt(serviceRequestId,10) }} })
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