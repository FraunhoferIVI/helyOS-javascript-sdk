import { ApolloClient } from "apollo-client";
import gql from "graphql-tag";

import { gqlJsonResponseHandler, gqlJsonResponseInstanceHandler, parseStringifiedJsonColumns, stringifyJsonFields } from "../helyos.helpers";
import { H_UserAccount  } from '../helyos.models';

 /////////////////////////  USERACCOUNT /////////////////////////

 export class USERACCOUNT {
    public getUserAccountsPromise;
    public getActionPromise;
    public userAccountsFecthing: boolean;
    private _client:  ApolloClient<any>;
    private _socket;

    constructor(client, socket) {
        this._client = client;
        this._socket = socket;
    }

    list(condition: Partial<H_UserAccount>={}): Promise<H_UserAccount[]> {
        const QUERY_FUNTCION = 'allUserAccounts';
        const TOOL_QUERY = gql`
        query ${QUERY_FUNTCION}($condition: UserAccountCondition!){
            ${QUERY_FUNTCION}(condition: $condition) {
                edges {
                    node {
                        id,
                        userId,
                        username,
                        metadata,
                        email,
                        userRole,
                        passwordHash,
                        description,
                        createdAt

                    }
                }   
            }
        }
        `;

        if (this.userAccountsFecthing) { return this.getUserAccountsPromise }


        this.userAccountsFecthing = true;
        const self = this;
        this.getUserAccountsPromise= this._client.query({ query: TOOL_QUERY, variables:  { condition: condition } })
            .then(response => {
                self.userAccountsFecthing =  false;
                return gqlJsonResponseHandler(response, QUERY_FUNTCION);
            })
            .catch(e => {
                    console.log(e);
                    return e;
             });

        return this.getUserAccountsPromise;
    }



    create(userAccount: Partial<H_UserAccount>): Promise<any> {
        const CREATE = gql`
        mutation createUserAccount ($postMessage: CreateUserAccountInput!){
            createUserAccount(input: $postMessage) {
                userAccount {
                    id,
                    userId,
                    username,
                    metadata,
                    email,
                    userRole,
                    passwordHash,
                    description
                }
            }
        }
        
        `;

        stringifyJsonFields(userAccount, ['metadata']);
        const postMessage = { clientMutationId: "not_used", userAccount: userAccount };
        console.log("postMessage",postMessage)
        return this._client.mutate({ mutation: CREATE, variables: { postMessage, userAccount: userAccount } })
                .then(response => {
                    return response.data.createUserAccount.userAccount;
                })
                .catch(e => {
                    console.log(e);
                    return e;
             })

    }





    patch(userAccount: Partial<H_UserAccount>): Promise<any> {
        const QUERY_FUNTCION = 'updateUserAccountById';
        const TOOL_UPDATE = gql`
        mutation updateUserAccountById ($postMessage: UpdateUserAccountByIdInput!){
            updateUserAccountById(input: $postMessage) {
                userAccount {
                        id,
                        userId,
                        username,
                        email,
                        metadata,
                        userRole,
                        passwordHash,
                        description,
                        createdAt
                    }
            }
        }
        `;

        delete userAccount['__typename'];
        stringifyJsonFields(userAccount, ['metadata']);

        const postMessage = { id: userAccount.id, userAccountPatch: userAccount };
        return  this._client.mutate({ mutation: TOOL_UPDATE, variables: { postMessage, userAccount: userAccount } })
            .then(response => {
                console.log('update request response', response);
                return gqlJsonResponseInstanceHandler(response, QUERY_FUNTCION,'userAccount' );
            })
            .catch(e => {
                    console.log(e);
                    return e;
             })
    }


    
    get(userAccountId: string ): Promise<H_UserAccount> {
        const QUERY_FUNTCION = 'userAccountById';
        const SHAPE_QUERY = gql`
        query ${QUERY_FUNTCION}($userAccountId: BigInt! ){
            ${QUERY_FUNTCION}(id: $userAccountId) {
                id,
                userId,
                username,
                email,
                metadata,
                userRole,
                passwordHash,
                description,
                createdAt
            }
        }
        `;


        this.getActionPromise = this._client.query({ query: SHAPE_QUERY, variables: {userAccountId: parseInt(userAccountId)  } })
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
        const QUERY_FUNTCION = 'deleteUserAccountById';
        const SHAPE_QUERY = gql`
        mutation ${QUERY_FUNTCION}($deleteduserAccountById:  DeleteUserAccountByIdInput! ){
            ${QUERY_FUNTCION}(input: $deleteduserAccountById) {
                deletedUserAccountId
            }
        }
        `;

        return  this._client.query({ query: SHAPE_QUERY, variables: {deleteduserAccountById: {id:parseInt(id,10) }} })
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

