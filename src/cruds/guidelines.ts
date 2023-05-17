import { ApolloClient } from "apollo-client";
import gql from "graphql-tag";

import { gqlJsonResponseHandler, gqlJsonResponseInstanceHandler, parseStringifiedJsonColumns, stringifyJsonFields } from "../helyos.helpers";
import { H_Guideline } from '../helyos.models';

////////////////////////  GUIDELINES  /////////////////////////

export class GUIDELINE  {
    public fecthing: boolean;
    public getPromise: Promise<any>;
    public getActionPromise: Promise<any>;
    private _client:  ApolloClient<any>;
    private _socket;

    constructor(client, socket) {
        this._client = client;
        this._socket = socket;
    }


    list(condition: Partial<H_Guideline>): Promise<any> {
        const QUERY_FUNTCION = 'allGuidelines';
        const STRING_QUERY = gql`
        query ${QUERY_FUNTCION}($condition: GuidelineCondition!){
            ${QUERY_FUNTCION}(condition: $condition) {
                edges {
                    node {
                        id,
                        startX,
                        startY,
                        startOrientation,
                        type,
                        geometry,
                        data,
                        geometryType,
                        dataType,
                        createdAt,
                        deletedAt,
                        name,
                        yardId,
                    }
                }   
            }
        }
        `;

        if (this.fecthing) { return this.getPromise }

        const self = this;        
        this.getPromise = this._client.query({ query: STRING_QUERY, variables: { condition: condition } })
            .then(response => {
                self.fecthing = false;
                const guidelines = gqlJsonResponseHandler(response, QUERY_FUNTCION);
                return parseStringifiedJsonColumns(guidelines, ['data', 'geometry']);
                
            })
            .catch(e => {
                    console.log(e);
                    return e;
             });

        return this.getPromise;
    }

    listRecent(since: number): Promise<any> {
        const QUERY_FUNTCION = 'allGuidelines';
        const TOOL_QUERY = gql`
        query ${QUERY_FUNTCION}($test: GuidelineCondition!){
            ${QUERY_FUNTCION}(condition: $test) {
                edges {
                    node {
                        id,
                        startX,
                        startY,
                        startOrientation,
                        type,
                        geometry,
                        data,
                        geometryType,
                        dataType,
                        createdAt,
                        deletedAt,
                        name,
                        yardId,
                    }
                }   
            }
        }
        `;

        if (this.fecthing) { return this.getPromise }

        const localTime = new Date(since);
        const timestampSeconds = since / 1000 - localTime.getTimezoneOffset() * 60;
        const self = this;        
        this.getPromise = this._client.query({ query: TOOL_QUERY, variables: { test: {} } })
            .then(response => {
                self.fecthing = false;
                const guidelines = gqlJsonResponseHandler(response, QUERY_FUNTCION);
                return parseStringifiedJsonColumns(guidelines, ['data', 'geometry']);
                
            })
            .catch(e => {
                    console.log(e);
                    return e;
             });

        return this.getPromise;
    }


    create(guideline: Partial<H_Guideline>): Promise<any> {
        const CREATE = gql`
        mutation createGuideline ($postMessage: CreateGuidelineInput!){
            createGuideline(input: $postMessage) {
                guideline {
                    id,
                    startX,
                    startY,
                    startOrientation,
                    type,
                    geometry,
                    data,
                    geometryType,
                    dataType,
                    createdAt,
                    deletedAt,
                    name,
                    yardId,
                }
            }
        }
        
        `;

        let postData = {... guideline};
        delete postData.id;
        stringifyJsonFields(postData, ['data', 'geometry']);
        const postMessage = { clientMutationId: "not_used", guideline: postData };
        console.log("postMessage",postMessage)
        return this._client.mutate({ mutation: CREATE, variables: { postMessage, guideline: postData } })
            .then(response => {
                return response.data.createGuideline.guideline;
            })
            .catch(e => {
                    console.log(e);
                    return e;
             })
    }


    get(guidelineId: string ): Promise<H_Guideline> {
        const QUERY_FUNTCION = 'guidelineById';
        const SHAPE_QUERY = gql`
        query ${QUERY_FUNTCION}($guidelineId: BigInt! ){
            ${QUERY_FUNTCION}(id: $guidelineId) {
                    id,
                    startX,
                    startY,
                    startOrientation,
                    type,
                    geometry,
                    data,
                    geometryType,
                    dataType,
                    createdAt,
                    deletedAt,
                    name,
                    yardId,
                }
        }
        `;


        this.getActionPromise = this._client.query({ query: SHAPE_QUERY, variables: {guidelineId: parseInt(guidelineId)  } })
            .then(response => {
                const guideline =  gqlJsonResponseHandler(response, QUERY_FUNTCION);
                return parseStringifiedJsonColumns([guideline], ['data','geometry'])[0];
            })
            .catch(e => { 
                console.log(e);
                throw e;
            });

        return this.getActionPromise;
    }


    patch(guideline: H_Guideline): Promise<any> {
        const UPDATE = gql`
        mutation updateGuidelineById ($postMessage: UpdateGuidelineByIdInput!){
            updateGuidelineById(input: $postMessage) {
                    guideline {
                        id,
                        startX,
                        startY,
                        startOrientation,
                        type,
                        geometry,
                        data,
                        geometryType,
                        dataType,
                        createdAt,
                        deletedAt,
                        name,
                        yardId,
                    }
            }
        }
        `;

        const patch = {...guideline};
        delete patch['__typename'];
        stringifyJsonFields(patch, ['geometry', 'data']);

        const postMessage = { id: guideline.id, guidelinePatch: patch };

        return this._client.mutate({ mutation: UPDATE, variables: { postMessage, guideline: patch } })
            .then(response => {
                console.log('create request', response);
                return response;
            })
            .catch(e => {
                    console.log(e);
                    return e;
             })
    }

    delete(id): Promise<any> {
        const QUERY_FUNTCION = 'deleteGuidelineById';
        const SHAPE_QUERY = gql`
        mutation ${QUERY_FUNTCION}($deletedGuidelineById:  DeleteGuidelineByIdInput! ){
            ${QUERY_FUNTCION}(input: $deletedGuidelineById) {
                deletedGuidelineId
            }
        }
        `;

        return  this._client.query({ query: SHAPE_QUERY, variables: {deletedGuidelineById: {id:parseInt(id,10) }} })
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
