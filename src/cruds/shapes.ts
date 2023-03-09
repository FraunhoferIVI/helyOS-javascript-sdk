import gql from "graphql-tag";
import { ApolloClient, DefaultOptions } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";
import { setContext } from 'apollo-link-context';
import { H_Shape} from '../helyos.models';
import * as io from 'socket.io-client'
import CheapRuler from "cheap-ruler";
import { gqlJsonResponseHandler, parseStringifiedJsonColumns, stringifyJsonFields } from "../helyos.helpers";


/////////////////////////  YARD-SHAPES /////////////////////////

export class SHAPES {
    public shapeFecthing: boolean;
    public getShapesPromise: Promise<any>;
    private _client:  ApolloClient<any>;
    private _socket;

    constructor(client, socket) {
        this._client = client;
        this._socket = socket;
    }

    list(condition: Partial<H_Shape>): Promise<any> {
        const QUERY_FUNTCION = 'allShapes';
        const QUERY_STR = gql`
        query ${QUERY_FUNTCION}($condition: ShapeCondition!){
            ${QUERY_FUNTCION}(condition: $condition) {
              edges {
                node {
                  id,
                  data,
                  geometry,
                  geometryType,
                  type,
                  dataFormat,
                  data,
                  createdAt,
                  modifiedAt,
                  deletedAt,
                  isObstacle,
                  isPermanent,
                  yardId,
                }
              }
            }
        }
        `;

        this.shapeFecthing = true;
        this.getShapesPromise = this._client.query({ query: QUERY_STR, variables: { condition: condition } })
            .then(response => {
                this.shapeFecthing = false;
                const shapes = gqlJsonResponseHandler(response, QUERY_FUNTCION);
                return parseStringifiedJsonColumns(shapes, ['geometry', 'data']);
            })
            .catch(e => console.log(e))

        return this.getShapesPromise;
    }


    listRecent(since: number): Promise<any> {
        const QUERY_FUNTCION = 'recentshapes';
        const QUERY_STR = gql`
        query ${QUERY_FUNTCION}($testTime: Float!){
            ${QUERY_FUNTCION}(testTime: $testTime) {
              edges {
                node {
                  id,
                  data,
                  geometry,
                  geometryType,
                  dataFormat,
                  type,
                  data,
                  createdAt,
                  modifiedAt,
                  deletedAt,
                  isObstacle,
                  isPermanent,
                  yardId,
                }
              }
            }
        }
        `;

        const localTime = new Date(since);
        const timestampSeconds = since / 1000 - localTime.getTimezoneOffset() * 60;

        if (this.shapeFecthing) { return this.getShapesPromise }

        this.shapeFecthing = true;
        this.getShapesPromise = this._client.query({ query: QUERY_STR, variables: { testTime: timestampSeconds } })
            .then(response => {
                this.shapeFecthing = false;
                console.log("update time from gql", timestampSeconds);
                const shapes = gqlJsonResponseHandler(response, QUERY_FUNTCION);
                return parseStringifiedJsonColumns(shapes, ['geometry', 'data']);
            })
            .catch(e => console.log(e))

        return this.getShapesPromise;
    }



    createMany(shapes: Partial<H_Shape>[]): Promise<any> {
        const promise_list = shapes.map(s => this.create(s).then(r=>r[0])); 
        return Promise.all(promise_list);
    }


    create(shape: Partial<H_Shape>): Promise<any> {
        const QUERY_FUNTCION = 'createShape';
        const SHAPE_CREATE = gql`
        mutation ${QUERY_FUNTCION}($postMessage: CreateShapeInput!){
            ${QUERY_FUNTCION}(input: $postMessage) {
                    shape {
                        id,
                        data,
                        createdAt,
                        modifiedAt,
                        geometry,
                        data,
                        geometryType,
                        type,
                        deletedAt,
                        isObstacle,
                        isPermanent,
                        yardId,
                    }
            }
        }
        
        `;

        let postData = {... shape};
        delete postData.id;
        delete postData['__typename'];

        stringifyJsonFields(postData, ['geometry', 'data']);

        const postMessage = { clientMutationId: "not_used", shape: postData };
        return this._client.mutate({ mutation: SHAPE_CREATE, variables: { postMessage, shape: postData } })
            .then(response => {
                return [response.data[QUERY_FUNTCION].shape];  // 30.09.2020: I don't remember why I am returning an one-element array here. Carlos
            })
            .catch(e => console.log("postShape called by" + this.create.caller, e))
    }


    get(shapeId: string ): Promise<H_Shape> {
        console.log("id", shapeId)

        const QUERY_FUNTCION = 'shapeById';
        const QUERY_STR = gql`
        query ${QUERY_FUNTCION}($shapeId:  BigInt! ){
            ${QUERY_FUNTCION}(id: $shapeId) {
                    id,
                    data,
                    createdAt,
                    modifiedAt,
                    geometry,
                    dataFormat,
                    data,
                    geometryType,
                    type,
                    deletedAt,
                    isObstacle,
                    isPermanent,
                    yardId,
                }
        }
        `;


        return this._client.query({ query: QUERY_STR, variables: {shapeId: parseInt(shapeId)  } })
            .then(response => {
                const shape = gqlJsonResponseHandler(response, QUERY_FUNTCION);
                return parseStringifiedJsonColumns([shape], ['geometry', 'data'])[0];

            })
            .catch(e => console.log(e))

    }



    patch(shape: H_Shape): Promise<any> {
        const SHAPE_UPDATE = gql`
        mutation updateShapeById ($postMessage: UpdateShapeByIdInput!){
            updateShapeById(input: $postMessage) {
                    shape {
                        id,
                        data,
                        createdAt,
                        modifiedAt,
                        geometry,
                          dataFormat,
                        data,
                        geometryType,
                        type,
                        isObstacle,
                        deletedAt,
                        yardId,
                    }
            }
        }
        `;

        const patch = {...shape};
        delete patch['__typename'];
        stringifyJsonFields(patch, ['geometry', 'data']);

        const postMessage = { id: shape.id, shapePatch: patch };

        return this._client.mutate({ mutation: SHAPE_UPDATE, variables: { postMessage, shape: patch } })
            .then(response => {
                console.log('create request', response);
                return response;
            })
            .catch(e => console.log(e))
    }


    markAllDeleted(yardId): Promise<any> {
            const SHAPE_UPDATE = gql`
            mutation markDeletedAllShapesOfYard ($yardObj: MarkDeletedAllShapesOfYardInput!){
                markDeletedAllShapesOfYard(input: $yardObj) {
                        shapes {
                            id,   
                        }
                }
            }
            `;
            const dataNow = new Date().toUTCString();
            return this._client.mutate({ mutation: SHAPE_UPDATE, variables: { yardObj: {'yardIdInput': yardId} } })
                .then(response => {
                    console.log('edit-delete request', response);
                    return response.data
                })
                .catch(e => console.log(e))
    }


    markDeleted(shapeId): Promise<any> {
        const SHAPE_UPDATE = gql`
        mutation updateShapeById ($postMessage: UpdateShapeByIdInput!){
            updateShapeById(input: $postMessage) {
                    shape {
                        id,
                        data,
                        isObstacle,
                        createdAt,
                        modifiedAt,
                        deletedAt,

                    }
            }
        }
        `;
        const dataNow = new Date().toUTCString();
        const postMessage = { id: shapeId, shapePatch: { id: shapeId, deletedAt: dataNow } };
        return this._client.mutate({ mutation: SHAPE_UPDATE, variables: { postMessage } })
            .then(response => {
                console.log('edit-delete request', response);
                return response.data.updateShapeById.shape;
            })
            .catch(e => console.log(e))
    }

    delete(shapeId): Promise<any> {
        const QUERY_FUNTCION = 'deleteShapeById';
        const QUERY_STR = gql`
        mutation ${QUERY_FUNTCION}($deletedShapeById :  DeleteShapeByIdInput! ){
            ${QUERY_FUNTCION}(input: $deletedShapeById) {
                deletedShapeId
            }
        }
        `;

        return  this._client.query({ query: QUERY_STR, variables: {deletedShapeById: {id:parseInt(shapeId,10) }} })
            .then(response => {
                const data = gqlJsonResponseHandler(response, QUERY_FUNTCION);
                return data;
            })
            .catch(e => console.log(e))

    }

}


