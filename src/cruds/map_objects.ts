import gql from "graphql-tag";
import { ApolloClient, DefaultOptions } from "apollo-client";
import { H_MapObject} from '../helyos.models';
import { gqlJsonResponseHandler, parseStringifiedJsonColumns, stringifyJsonFields } from "../helyos.helpers";


/////////////////////////  YARD-MAPOBJECTS /////////////////////////

export class MAPOBJECTS {
    public mapObjectFecthing: boolean;
    public getMapObjectsPromise: Promise<any>;
    private _client:  ApolloClient<any>;
    private _socket;

    constructor(client, socket) {
        this._client = client;
        this._socket = socket;
    }

    list(condition: Partial<H_MapObject>): Promise<any> {
        const QUERY_FUNTCION = 'allMapObjects';
        const QUERY_STR = gql`
        query ${QUERY_FUNTCION}($condition: MapObjectCondition!){
            ${QUERY_FUNTCION}(condition: $condition) {
              edges {
                node {
                  id,
                  name,
                  data,
                  metadata,
                  dataFormat,
                  type,
                  createdAt,
                  modifiedAt,
                  deletedAt,
                  yardId,
                }
              }
            }
        }
        `;

        this.mapObjectFecthing = true;
        this.getMapObjectsPromise = this._client.query({ query: QUERY_STR, variables: { condition: condition } })
            .then(response => {
                this.mapObjectFecthing = false;
                const mapObjects = gqlJsonResponseHandler(response, QUERY_FUNTCION);
                return parseStringifiedJsonColumns(mapObjects, ['metadata', 'data']);
            })
            .catch(e => {
                    console.log(e);
                    return e;
             })

        return this.getMapObjectsPromise;
    }


    listRecent(since: number): Promise<any> {
        const QUERY_FUNTCION = 'recentmapObjects';
        const QUERY_STR = gql`
        query ${QUERY_FUNTCION}($testTime: Float!){
            ${QUERY_FUNTCION}(testTime: $testTime) {
              edges {
                node {
                    id,
                    name,
                    data,
                    metadata,
                    dataFormat,
                    type,
                    createdAt,
                    modifiedAt,
                    deletedAt,
                    yardId,
                }
              }
            }
        }
        `;

        const localTime = new Date(since);
        const timestampSeconds = since / 1000 - localTime.getTimezoneOffset() * 60;

        if (this.mapObjectFecthing) { return this.getMapObjectsPromise }

        this.mapObjectFecthing = true;
        this.getMapObjectsPromise = this._client.query({ query: QUERY_STR, variables: { testTime: timestampSeconds } })
            .then(response => {
                this.mapObjectFecthing = false;
                console.log("update time from gql", timestampSeconds);
                const mapObjects = gqlJsonResponseHandler(response, QUERY_FUNTCION);
                return parseStringifiedJsonColumns(mapObjects, ['metadata', 'data']);
            })
            .catch(e => {
                    console.log(e);
                    return e;
             })

        return this.getMapObjectsPromise;
    }



    createMany(mapObjects: Partial<H_MapObject>[]): Promise<any> {
        const promise_list = mapObjects.map(s => this.create(s).then(r=>r[0])); 
        return Promise.all(promise_list);
    }


    create(mapObject: Partial<H_MapObject>): Promise<any> {
        const QUERY_FUNTCION = 'createMapObject';
        const MAPOBJECT_CREATE = gql`
        mutation ${QUERY_FUNTCION}($postMessage: CreateMapObjectInput!){
            ${QUERY_FUNTCION}(input: $postMessage) {
                    mapObject {
                       id,
                       name,
                       data,
                        metadata,
                        dataFormat,
                        type,
                        createdAt,
                        modifiedAt,
                        deletedAt,
                        yardId,
                    }
            }
        }
        
        `;

        let postData = {... mapObject};
        delete postData.id;
        delete postData['__typename'];

        stringifyJsonFields(postData, ['metadata', 'data']);

        const postMessage = { clientMutationId: "not_used", mapObject: postData };
        return this._client.mutate({ mutation: MAPOBJECT_CREATE, variables: { postMessage, mapObject: postData } })
            .then(response => {
                return [response.data[QUERY_FUNTCION].mapObject];  // 30.09.2020: I don't remember why I am returning an one-element array here. Carlos
            })
            .catch(e => console.log("postMapObject called by" + this.create.caller, e))
    }


    get(mapObjectId: string ): Promise<H_MapObject> {
        console.log("id", mapObjectId)

        const QUERY_FUNTCION = 'mapObjectById';
        const QUERY_STR = gql`
        query ${QUERY_FUNTCION}($mapObjectId:  BigInt! ){
            ${QUERY_FUNTCION}(id: $mapObjectId) {
                    id,
                    name,
                    data,
                    metadata,
                    dataFormat,
                    type,
                    createdAt,
                    modifiedAt,
                    deletedAt,
                    yardId,
                }
        }
        `;


        return this._client.query({ query: QUERY_STR, variables: {mapObjectId: parseInt(mapObjectId)  } })
            .then(response => {
                const mapObject = gqlJsonResponseHandler(response, QUERY_FUNTCION);
                return parseStringifiedJsonColumns([mapObject], ['metadata', 'data'])[0];

            })
            .catch(e => {
                    console.log(e);
                    return e;
             })

    }



    patch(mapObject: H_MapObject): Promise<any> {
        const MAPOBJECT_UPDATE = gql`
        mutation updateMapObjectById ($postMessage: UpdateMapObjectByIdInput!){
            updateMapObjectById(input: $postMessage) {
                    mapObject {
                        id,
                        name,
                        data,
                        metadata,
                        dataFormat,
                        type,
                        createdAt,
                        modifiedAt,
                        deletedAt,
                        yardId,
                    }
            }
        }
        `;

        const patch = {...mapObject};
        delete patch['__typename'];
        stringifyJsonFields(patch, ['metadata', 'data']);

        const postMessage = { id: mapObject.id, mapObjectPatch: patch };

        return this._client.mutate({ mutation: MAPOBJECT_UPDATE, variables: { postMessage, mapObject: patch } })
            .then(response => {
                console.log('create request', response);
                return response;
            })
            .catch(e => {
                    console.log(e);
                    return e;
             })
    }


    markAllDeleted(yardId): Promise<any> {
            const MAPOBJECT_UPDATE = gql`
            mutation markDeletedAllMapObjectsOfYard ($yardObj: MarkDeletedAllMapObjectsOfYardInput!){
                markDeletedAllMapObjectsOfYard(input: $yardObj) {
                        mapObjects {
                            id,   
                        }
                }
            }
            `;
            const dataNow = new Date().toUTCString();
            return this._client.mutate({ mutation: MAPOBJECT_UPDATE, variables: { yardObj: {'yardIdInput': yardId} } })
                .then(response => {
                    console.log('edit-delete request', response);
                    return response.data
                })
                .catch(e => {
                    console.log(e);
                    return e;
             })
    }


    markDeleted(mapObjectId): Promise<any> {
        const MAPOBJECT_UPDATE = gql`
        mutation updateMapObjectById ($postMessage: UpdateMapObjectByIdInput!){
            updateMapObjectById(input: $postMessage) {
                    mapObject {
                        id,
                        name,
                        data,
                        createdAt,
                        modifiedAt,
                        deletedAt,

                    }
            }
        }
        `;
        const dataNow = new Date().toUTCString();
        const postMessage = { id: mapObjectId, mapObjectPatch: { id: mapObjectId, deletedAt: dataNow } };
        return this._client.mutate({ mutation: MAPOBJECT_UPDATE, variables: { postMessage } })
            .then(response => {
                console.log('edit-delete request', response);
                return response.data.updateMapObjectById.mapObject;
            })
            .catch(e => {
                    console.log(e);
                    return e;
             })
    }

    delete(mapObjectId): Promise<any> {
        const QUERY_FUNTCION = 'deleteMapObjectById';
        const QUERY_STR = gql`
        mutation ${QUERY_FUNTCION}($deletedMapObjectById :  DeleteMapObjectByIdInput! ){
            ${QUERY_FUNTCION}(input: $deletedMapObjectById) {
                deletedMapObjectId
            }
        }
        `;

        return  this._client.query({ query: QUERY_STR, variables: {deletedMapObjectById: {id:parseInt(mapObjectId,10) }} })
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


