import { ApolloClient } from "apollo-client";
import gql from "graphql-tag";

import { gqlJsonResponseHandler } from "../helyos.helpers";
import { H_SystemLog } from '../helyos.models';

////////////////////////  GUIDELINES  /////////////////////////

export class SYSTEMLOGS  {
    public fetching: boolean;
    public lastListPromise: Promise<any>;
    private _client:  ApolloClient<any>;
    private _socket;

    constructor(client, socket) {
        this._client = client;
        this._socket = socket;
    }


    list(condition: Partial<H_SystemLog>, first=100, offset=0, orderBy='ID_DESC'): Promise<any> {
        const QUERY_FUNTCION = 'allSystemLogs';
        const STRING_QUERY = gql`
        query ${QUERY_FUNTCION}($condition: SystemLogCondition!, $orderBy:[SystemLogsOrderBy!], $first:Int, $offset: Int){
            ${QUERY_FUNTCION}(condition: $condition,  orderBy: $orderBy,  first:$first, offset:$offset) {
                edges {
                    node {
                        createdAt
                        collected
                        event
                        id
                        msg
                        logType
                        origin
                        serviceType
                        toolUuid
                        wprocId
                        yardId
                      }
                }   
            }
        }
        `;


        const self = this;
        this.fetching = true;
        this.lastListPromise = this._client.query({ query: STRING_QUERY, variables: { condition, first,
                                                                                 orderBy: orderBy,
                                                                                 offset } })
            .then(response => {
                this.fetching = false;
                const logs = gqlJsonResponseHandler(response, QUERY_FUNTCION);
                return logs;
                
            })
            .catch(e => {
                    console.log(e);
                    return e;
             });

        return this.lastListPromise;
    }



    create(systemLog: Partial<H_SystemLog>): Promise<any> { 
        const CREATE = gql`
        mutation createSystemLog ($postMessage: CreateSytemLogInput!){
            createSystemLog(input: $postMessage) {
                systemLog {
                    createdAt
                    collected
                    event
                    id
                    msg
                    logType
                    origin
                    serviceType
                    toolUuid
                    wprocId
                    yardId
                }
            }
        }
        
        `;

        delete systemLog.id;
        const postMessage = { clientMutationId: "not_used", systemLog: systemLog };
        return this._client.mutate({ mutation: CREATE, variables: { postMessage, systemLog: systemLog } })
            .then(response => {
                return response.data.createSystemLog.systemLog;
            })
            .catch(e => {
                    console.log(e);
                    return e;
             })
    }


    get(systemLogId: string ): Promise<H_SystemLog> {
        const QUERY_FUNTCION = 'systemLogById';
        const SHAPE_QUERY = gql`
        query ${QUERY_FUNTCION}($systemLogId: BigInt! ){
            ${QUERY_FUNTCION}(id: $systemLogId) {
                createdAt
                collected
                event
                id
                msg
                logType
                origin
                serviceType
                toolUuid
                wprocId
                yardId
                }
        }
        `;


        return this._client.query({ query: SHAPE_QUERY, variables: {systemLogId: parseInt(systemLogId)  } })
            .then(response => {
                const logs =  gqlJsonResponseHandler(response, QUERY_FUNTCION);
                return logs[0];
            })
            .catch(e => { 
                console.log(e);
                throw e;
            });

    }


  
}
