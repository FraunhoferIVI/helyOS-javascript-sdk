import { ApolloClient } from "apollo-client";
import gql from "graphql-tag";

import { gqlJsonResponseHandler, gqlJsonResponseInstanceHandler, parseStringifiedJsonColumns, stringifyJsonFields } from "../helyos.helpers";
import { H_Assignment } from '../helyos.models';




 /////////////////////////  ASSIGNMENTS /////////////////////////

 export class ASSIGNMENT {
    public assignmentFecthing: boolean;
    public getAssignmentsPromise: Promise<any>;
    private _client:  ApolloClient<any>;
    private _socket;

    constructor(client, socket) {
        this._client = client;
        this._socket = socket;
    }

    list(condition: Partial<H_Assignment>): Promise<any> {
        const QUERY_FUNTCION = 'allAssignments';
        const QUERY_STR = gql`
        query ${QUERY_FUNTCION}($condition: AssignmentCondition!){
            ${QUERY_FUNTCION}(condition: $condition) {
            edges {
                node {
                    id
                    yardId
                    workProcessId
                    toolId
                    status
                    startTimeStamp
                    dependOnAssignments
                    nextAssignments
                    error
                    createdAt
                    modifiedAt
                }
            }
            }
        }
        `;

        this.assignmentFecthing = true;
        this.getAssignmentsPromise = this._client.query({ query: QUERY_STR, variables: { condition: condition } })
            .then(response => {
                this.assignmentFecthing = false;
                const assignments = gqlJsonResponseHandler(response, QUERY_FUNTCION);
                return parseStringifiedJsonColumns(assignments, ['data', 'context']);
            })
            .catch(e => {
                    console.log(e);
                    return e;
             })

        return this.getAssignmentsPromise;
    }



    createMany(assignments: Partial<H_Assignment>[]): Promise<any> {
        const promise_list = assignments.map(s => this.create(s).then(r=>r[0])); // 30.09.2020: I don't remember why I am returning an one-element array in create(). Carlos
        return Promise.all(promise_list);
    }


    create(assignment: Partial<H_Assignment>): Promise<any> {
        const QUERY_FUNTCION = 'createAssignment';
        const SHAPE_CREATE = gql`
        mutation ${QUERY_FUNTCION}($postMessage: CreateAssignmentInput!){
            ${QUERY_FUNTCION}(input: $postMessage) {
                    assignment {
                        id
                        yardId
                        data 
                        workProcessId
                        toolId
                        status
                        startTimeStamp
                        dependOnAssignments
                        nextAssignments
                        context
                        result
                        error
                        createdAt
                        modifiedAt
                    }
            }
        }
        
        `;

        let postData = {... assignment};
        delete postData.id;
        delete postData['__typename'];

        stringifyJsonFields(postData, ['data', 'context']);

        const postMessage = { clientMutationId: "not_used", assignment: postData };
        return this._client.mutate({ mutation: SHAPE_CREATE, variables: { postMessage, assignment: postData } })
            .then(response => {
                return [response.data[QUERY_FUNTCION].assignment];  // 30.09.2020: I don't remember why I am returning an one-element array here. Carlos
            })
            .catch(e => console.log("postAssignment called by" + this.create.caller, e))
    }


    get(assignmentId: string ): Promise<H_Assignment> {
        console.log("id", assignmentId)

        const QUERY_FUNTCION = 'assignmentById';
        const QUERY_STR = gql`
        query ${QUERY_FUNTCION}($assignmentId:  BigInt! ){
            ${QUERY_FUNTCION}(id: $assignmentId) {
                id
                yardId
                data 
                workProcessId
                toolId
                status
                startTimeStamp
                dependOnAssignments
                nextAssignments
                context
                result
                error
                createdAt
                modifiedAt
                }
        }
        `;


        return this._client.query({ query: QUERY_STR, variables: {assignmentId: parseInt(assignmentId)  } })
            .then(response => {
                const assignment = gqlJsonResponseHandler(response, QUERY_FUNTCION);
                return parseStringifiedJsonColumns([assignment], ['data', 'context'])[0];

            })
            .catch(e => {
                    console.log(e);
                    return e;
             })

    }



    patch(assignment: H_Assignment): Promise<any> {
        const SHAPE_UPDATE = gql`
        mutation updateAssignmentById ($postMessage: UpdateAssignmentByIdInput!){
            updateAssignmentById(input: $postMessage) {
                    assignment {
                        id
                        yardId
                        data 
                        workProcessId
                        toolId
                        status
                        startTimeStamp
                        dependOnAssignments
                        nextAssignments
                        context
                        result
                        error
                        createdAt
                        modifiedAt
                    }
            }
        }
        `;

        const patch = {...assignment};
        delete patch['__typename'];
        stringifyJsonFields(patch, [ 'data', 'context']);

        const postMessage = { id: assignment.id, assignmentPatch: patch };

        return this._client.mutate({ mutation: SHAPE_UPDATE, variables: { postMessage, assignment: patch } })
            .then(response => {
                console.log('create request', response);
                return response;
            })
            .catch(e => {
                    console.log(e);
                    return e;
             })
    }



    delete(assignmentId): Promise<any> {
        const QUERY_FUNTCION = 'deleteAssignmentById';
        const QUERY_STR = gql`
        mutation ${QUERY_FUNTCION}($deletedAssignmentById :  DeleteAssignmentByIdInput! ){
            ${QUERY_FUNTCION}(input: $deletedAssignmentById) {
                deletedAssignmentId
            }
        }
        `;

        return  this._client.query({ query: QUERY_STR, variables: {deletedAssignmentById: {id:parseInt(assignmentId,10) }} })
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

