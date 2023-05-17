import { ApolloClient } from "apollo-client";
import gql from "graphql-tag";

import { gqlJsonResponseHandler, gqlJsonResponseInstanceHandler, parseStringifiedJsonColumns, stringifyJsonFields } from "../helyos.helpers";
import { H_Yard  } from '../helyos.models';

 /////////////////////////  YARD /////////////////////////

 export class YARD {
    public getYardsPromise;
    public getActionPromise;
    public yardsFecthing: boolean;
    private _client:  ApolloClient<any>;
    private _socket;

    constructor(client, socket) {
        this._client = client;
        this._socket = socket;
    }

    list(condition: Partial<H_Yard>={}): Promise<H_Yard[]> {
        const QUERY_FUNTCION = 'allYards';
        const TOOL_QUERY = gql`
        query ${QUERY_FUNTCION}($condition: YardCondition!){
            ${QUERY_FUNTCION}(condition: $condition) {
                edges {
                    node {
                        id,
                        uid,
                        name,
                        description,
                        yardType,
                        dataFormat,
                        mapData,
                        source,
                        lat,
                        lon,
                        alt,
                        createdAt,
                        deletedAt,
                        modifiedAt,
                        pictureBase64,
                        picturePos,
                    }
                }   
            }
        }
        `;

        if (this.yardsFecthing) { return this.getYardsPromise }


        this.yardsFecthing = true;
        const self = this;
        this.getYardsPromise= this._client.query({ query: TOOL_QUERY, variables:  { condition: condition } })
            .then(response => {
                self.yardsFecthing =  false;
                return gqlJsonResponseHandler(response, QUERY_FUNTCION);
            })
            .catch(e => {
                    console.log(e);
                    return e;
             });

        return this.getYardsPromise;
    }



    create(yard: Partial<H_Yard>): Promise<any> {
        const CREATE = gql`
        mutation createYard ($postMessage: CreateYardInput!){
            createYard(input: $postMessage) {
                yard {
                    id,
                    uid,
                    name,
                    description,
                    yardType,
                    dataFormat,
                    mapData,
                    source,
                    lat,
                    lon,
                    alt,
                    createdAt,
                    deletedAt,
                    modifiedAt,
                    pictureBase64,
                    picturePos,
                }
            }
        }
        
        `;

        const postMessage = { clientMutationId: "not_used", yard: yard };
        console.log("postMessage",postMessage)
        return this._client.mutate({ mutation: CREATE, variables: { postMessage, yard: yard } })
                .then(response => {
                    return response.data.createYard.yard;
                })
                .catch(e => {
                    console.log(e);
                    return e;
             })

    }





    patch(yard: Partial<H_Yard>): Promise<any> {
        const QUERY_FUNTCION = 'updateYardById';
        const TOOL_UPDATE = gql`
        mutation updateYardById ($postMessage: UpdateYardByIdInput!){
            updateYardById(input: $postMessage) {
                    yard {
                        id,
                        uid,
                        name,
                        yardType,
                        dataFormat,
                        mapData,
                        description,
                        source,
                        lat,
                        lon,
                        alt,
                        createdAt,
                        deletedAt,
                        modifiedAt,
                        pictureBase64,
                        picturePos,
                    }
            }
        }
        `;

        delete yard['__typename'];
        const postMessage = { id: yard.id, yardPatch: yard };
        return  this._client.mutate({ mutation: TOOL_UPDATE, variables: { postMessage, yard: yard } })
            .then(response => {
                console.log('update request response', response);
                return gqlJsonResponseInstanceHandler(response, QUERY_FUNTCION,'yard' );
            })
            .catch(e => {
                    console.log(e);
                    return e;
             })
    }


    
    get(yardId: string ): Promise<H_Yard> {
        const QUERY_FUNTCION = 'yardById';
        const SHAPE_QUERY = gql`
        query ${QUERY_FUNTCION}($yardId: BigInt! ){
            ${QUERY_FUNTCION}(id: $yardId) {
                id,
                uid,
                name,
                description,
                yardType,
                dataFormat,
                mapData,
                source,
                lat,
                lon,
                alt,
                createdAt,
                deletedAt,
                modifiedAt,
                pictureBase64,
                picturePos,
            }
        }
        `;


        this.getActionPromise = this._client.query({ query: SHAPE_QUERY, variables: {yardId: parseInt(yardId)  } })
            .then(response => {
                const data = gqlJsonResponseHandler(response, QUERY_FUNTCION);
                return data;
            })
            .catch(e => {
                    console.log(e);
                    return e;
             })

        return this.getActionPromise;
    }

    delete(id): Promise<any> {
        const QUERY_FUNTCION = 'deleteYardById';
        const SHAPE_QUERY = gql`
        mutation ${QUERY_FUNTCION}($deletedYardById:  DeleteYardByIdInput! ){
            ${QUERY_FUNTCION}(input: $deletedYardById) {
                deletedYardId
            }
        }
        `;

        return  this._client.query({ query: SHAPE_QUERY, variables: {deletedYardById: {id:parseInt(id,10) }} })
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

