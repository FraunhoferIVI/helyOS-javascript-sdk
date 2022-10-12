import gql from "graphql-tag";
import { ApolloClient, DefaultOptions } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";
import { setContext } from 'apollo-link-context';
import { H_Shape, H_Target, H_WorkProcess, H_Tools, H_Yard, H_Action, GeoPoint, Timestamp, H_Service, 
        H_WorkProcessType, H_WorkProcessServicePlan, H_Guideline, H_Assignment, H_ServiceRequest, H_SystemLog, H_UserAccount } from './helyos.models';
import * as io from 'socket.io-client'
import { SHAPES } from "./cruds/shapes";
import { TOOLS } from "./cruds/agents";
import { YARD } from "./cruds/yards";
import { ASSIGNMENT } from "./cruds/assignments";
import { WORKPROCESS } from "./cruds/wprocess";
import { WORKPROCESS_TYPE } from "./cruds/wprocess_types";
import { WORKPROCESS_SERVICE_PLAN } from "./cruds/wprocess_service_matrix";
import { EXTERNALSERVICES } from "./cruds/external_services";
import { GUIDELINE } from "./cruds/guidelines";
import { SERVICEREQUESTS } from "./cruds/service_requests";
import { TARGET } from "./cruds/targets";
import fetch from "node-fetch";
import { SYSTEMLOGS } from "./cruds/system_logs";
import { USERACCOUNT } from "./cruds/userAccounts";


const UTMConverter = require('utm-converter');

const socketOptions = {
    transports : ['websocket'],
}


///////////////////////// GraphQL Setup/////////////////////////

const defaultOptions: DefaultOptions = {
    watchQuery: {
        fetchPolicy: 'network-only', //   'network-only' | 'no-cache'
        errorPolicy: 'ignore',
    },
    query: {
        fetchPolicy: 'no-cache',
        errorPolicy: 'all',
    },
}


export { H_Shape, H_ServiceRequest, H_Assignment, H_Target, H_WorkProcess, H_WorkProcessServicePlan,  H_WorkProcessType,
         H_Tools, H_Yard, H_Action, GeoPoint, H_Service, H_Guideline, H_SystemLog, H_UserAccount, Timestamp };




/////////////////////// GraphQL SERVICES /////////////////////////
export class HelyosServices {
    userAccounts: USERACCOUNT;
    shapes: SHAPES;
    tools: TOOLS;
    target: TARGET;
    yard: YARD;
    systemLogs: SYSTEMLOGS;
    assignments: ASSIGNMENT;
    workProcess: WORKPROCESS;
    workProcessServicePlan: WORKPROCESS_SERVICE_PLAN;
    workProcessType: WORKPROCESS_TYPE;
    extServices: EXTERNALSERVICES;
    guidelines: GUIDELINE;
    servciceRequests: SERVICEREQUESTS;

    public connectionId: number;
    public connected: boolean = false;
    public socket;
    public token;
    private _httpLink: HttpLink; 
    private _client: ApolloClient<any>;
    public ports: any;
    public url: string;
    public username: string;

    constructor(url:string, ports:{socketPort:string, gqlPort: string}, token=null) {
        this.url = url;
        this.ports = ports;
        this._httpLink = new HttpLink({
            uri: `${url}:${ports.gqlPort}/graphql`, fetch
        });

        const authLink = setContext((_, { headers }) => {
            if (!this.token){
                return {...headers};
            }

            return {
                headers: {
                    ...headers,
                    authorization: this.token ? `Bearer ${this.token}` : "",
                } 
            }
        });

        this.set_client(authLink);
    }


    private set_client(authLink) {
        this._client = new ApolloClient({
            link: authLink.concat(this._httpLink),
            cache: new InMemoryCache(),
            defaultOptions: defaultOptions,
        });
        
        if (this.connected) {
            this.userAccounts = new USERACCOUNT(this._client, this.socket);
            this.shapes = new SHAPES(this._client, this.socket);
            this.tools = new TOOLS(this._client, this.socket);
            this.workProcess = new WORKPROCESS(this._client, this.socket);
            this.workProcessServicePlan = new WORKPROCESS_SERVICE_PLAN(this._client, this.socket);
            this.systemLogs = new SYSTEMLOGS(this._client, this.socket);
            this.workProcessType = new WORKPROCESS_TYPE(this._client, this.socket);
            this.target = new TARGET(this._client, this.socket);
            this.yard = new YARD(this._client, this.socket);
            this.extServices = new EXTERNALSERVICES(this._client, this.socket);
            this.guidelines = new GUIDELINE(this._client, this.socket);
            this.assignments = new ASSIGNMENT(this._client, this.socket);
            this.servciceRequests = new SERVICEREQUESTS(this._client, this.socket);

        } else {
            console.log('web socket is not connected; check websocket url and port or try to login (username, password) again.')
        }
    }


    connect() : Promise <any> {
        const self = this;
        const socketOptions = {
            transports : ['websocket'],
        }

        this.socket =  io.connect( `${this.url}:${this.ports.socketPort}/`,socketOptions);
        const promise = new Promise((resolve, reject) => {
            const self2 = self;
            self.socket.on('connect', () =>{
                                self2.connectionId= self.socket.io.engine.id;
                                self2.connected = true;
                                const authLink = setContext((_, { headers }) => {
                                    return {
                                        headers: {
                                            ...headers,
                                            authorization: this.token ? `Bearer ${this.token}` : "",
                                        } 
                                    }
                                });
                                self2.set_client(authLink);
                                resolve (true)
            });
        });

        return promise;
    }

    register(name, username, password, adminPassword): Promise <any> {
        const QUERY_FUNTCION = 'registerUser';
        const GQL_REQUEST = gql`
        mutation ${QUERY_FUNTCION}($postMessage: RegisterUserInput!){
            ${QUERY_FUNTCION}(input: $postMessage) { 
            user {
                id,
                createdAt,
                }
            }
        }
        `;

        const postMessage = { clientMutationId: "not_used", ...{name, username, password, adminPassword} };
        console.log("postMessage",postMessage)
        return this._client.mutate({ mutation: GQL_REQUEST, variables: { postMessage, ...{name, username, password, adminPassword} } })
            .then(response => {
                return response.data[QUERY_FUNTCION].user;
            })
            .catch(e => console.log(e));
    }

 
    login(username: string, password: string): Promise <any> {
        const QUERY_FUNTCION = 'authenticate';
        const GQL_REQUEST = gql`
        mutation ${QUERY_FUNTCION}($postMessage: AuthenticateInput!){
            ${QUERY_FUNTCION}(input: $postMessage) { 
                jwtToken
            }
        }
        `;
        
        const postMessage = { clientMutationId: "not_used", ...{username, password} };
        console.log("postMessage",postMessage)
        return this._client.mutate({ mutation: GQL_REQUEST, variables: { postMessage, ...{username, password} } })
            .then(response => {
                if (response.data[QUERY_FUNTCION].jwtToken) {
                    this.token = response.data[QUERY_FUNTCION].jwtToken;
                    this.username = username;
                }
                return response.data[QUERY_FUNTCION];
            })
            .catch(e => console.log(e));

    }


    adminGetUserAuthToken(username: string): Promise <any> {
        const QUERY_FUNTCION = 'adminGetUserAuthtoken';
        const GQL_REQUEST = gql`
        mutation ${QUERY_FUNTCION}($postMessage: AdminGetUserAuthtokenInput!){
            ${QUERY_FUNTCION}(input: $postMessage) { 
                jwtToken
            }
        }
        `;
        const postMessage = { clientMutationId: "not_used", ...{username} };
        console.log("postMessage",postMessage)
        return this._client.mutate({ mutation: GQL_REQUEST, variables: { postMessage, ...{username} } })
            .then(response => {
                return response.data[QUERY_FUNTCION];
            })
            .catch(e => console.log(e));
    }
     
    changePassword(username: string, password: string, newPassowrd: string): Promise <any> {
        const QUERY_FUNTCION = 'changePassword';
        const GQL_REQUEST = gql`
        mutation ${QUERY_FUNTCION}($postMessage: ChangePasswordInput!){
            ${QUERY_FUNTCION}(input: $postMessage) { 
                jwtToken
            }
        }
        `;
        
        const postMessage = { clientMutationId: "not_used", ...{username, password, newPassowrd} };
        console.log("postMessage",postMessage)
        return this._client.mutate({ mutation: GQL_REQUEST, variables: { postMessage, ...{username, password, newPassowrd} } })
            .then(response => {
                if (response.data[QUERY_FUNTCION].jwtToken) {
                    this.token = response.data[QUERY_FUNTCION].jwtToken;
                    this.username = username;
                }
                return response.data[QUERY_FUNTCION];
            })
            .catch(e => console.log(e));

    }

    adminChangePassword(username: string, password: string): Promise <any> {
        const QUERY_FUNTCION = 'adminChangePassword';
        const GQL_REQUEST = gql`
        mutation ${QUERY_FUNTCION}($postMessage: AdminChangePasswordInput!){
            ${QUERY_FUNTCION}(input: $postMessage) { 
                integer
            }
        }
        `;
        
        const postMessage = { clientMutationId: "not_used", ...{username, password} };
        console.log("postMessage",postMessage)
        return this._client.mutate({ mutation: GQL_REQUEST, variables: { postMessage, ...{username, password} } })
            .then(response => {
                return response.data[QUERY_FUNTCION];
            })
            .catch(e => console.log(e));
    }


    logout(username: string = null): Promise <any> {
        const QUERY_FUNTCION = 'logout';
        const GQL_REQUEST = gql`
        mutation ${QUERY_FUNTCION}($postMessage: LogoutInput!){
            ${QUERY_FUNTCION}(input: $postMessage) { 
                jwtToken
            }
        }
        `;

        if (!username){
            username = this.username;
        }
        const postMessage = { clientMutationId: "not_used", ...{username} };
        console.log("postMessage",postMessage)
        return this._client.mutate({ mutation: GQL_REQUEST, variables: { postMessage, ...{username} } })
            .then(response => {
                if (response.data[QUERY_FUNTCION].jwtToken) {
                    this.token = null;
                }
                return{msg:'token invalidated'};
            })
            .catch(e => console.log(e));

    }


    convertMMtoLatLng(originLat: number,  originLon: number, shapePoints: number[][]) {
        const converter = new UTMConverter();
        const originUTM = converter.toUtm({coord: [originLon, originLat]});

        const latlngShapePoints = shapePoints.map(point => {
            const utmObj = {coord:{x: point[0]/1000 , y: point[1]/1000}, zone: originUTM.zone};
            utmObj.coord.x += originUTM.coord.x;
            utmObj.coord.y += originUTM.coord.y;
            const latlngPoint = converter.toWgs(utmObj);
            return [latlngPoint.coord.latitude, latlngPoint.coord.longitude];
        } );
        return latlngShapePoints;
    }

    convertLatLngToMM(originLat:number , originLon:number , shapeLatLngPoints: number[][]) {
        const converter = new UTMConverter();
        const originUTM = converter.toUtm({coord: [originLon, originLat]});
        const originXY = [originUTM.coord.x, originUTM.coord.y];

        const points = shapeLatLngPoints.map(latlng => {
            const utmPoint = converter.toUtm( {coord: [latlng[1], latlng[0]], zone:originUTM.zone });
            const xyPoint = [utmPoint.coord.x, utmPoint.coord.y];
            return [(xyPoint[0] - originXY[0])*1000, (xyPoint[1] - originXY[1])*1000 ];
        } );
        return points;
    }




}
