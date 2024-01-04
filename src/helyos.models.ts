import { bindContext } from "optimism";

// Helyos Models //

// These models are fixed to any application to be developed.
// Applicaction-specific models should be added in e.g. app.models.ts
// The methods to convert data format between models should be added in e.g. *-model-convertors.ts

export type Timestamp = number | string | Date;

export enum AgentClass {
    Vehicle = 'vehicle',    
    Assistant = 'assistant',
    Tool = 'tool'
}
export class H_Tools {
    id: number |  string;
    yardId: number;
    status: string;
    uuid: string;
    wpClearance: any;
    connectionStatus: string;
    name: string = 'Unnamed';
    code: string;
    agentType: string;
    agentClass: AgentClass;
    dataFormat: string; 
    sensorsDataFormat: string;
    geometryDataFormat: string;
    geometry: any;
    factsheet: any;
    createdAt: Date;
    modifiedAt: Date;
    toolPoseId: number | string;
    x?: number;
    y?: number;
    orientation?: number;
    orientations?: number[];
    sensors: any;
    msgPerSec: number;
    updtPerSec: number;
    picture: string;
    streamUrl: string;
    heartbeat: Date;
    verifySignature: boolean;
    allowAnonymousCheckin: boolean;
    rbmqUsername: string;
    publicKey: string;
    acknowledgeReservation: boolean;
    isActuator: boolean;
    protocol: 'AMQP' | 'MQTT';


/*
* Customize the default values depending on the agent class.
*/
    constructor(agentClass: AgentClass) {
        this.agentClass = agentClass;
        this.verifySignature = false; 
        this.protocol = 'AMQP';

        if (agentClass === AgentClass.Vehicle) {
            this.allowAnonymousCheckin = true;
            this.acknowledgeReservation = true; 
            this.isActuator = true;

        } else if (agentClass === AgentClass.Assistant) {
            this.allowAnonymousCheckin = false;
            this.acknowledgeReservation = false; 
            this.isActuator = false;
            this.dataFormat = 'none';

        } else if (agentClass === AgentClass.Tool) {
            this.allowAnonymousCheckin = true;
            this.acknowledgeReservation = false; 
            this.isActuator = false;
            this.dataFormat = 'none';
        }
    }
}
 
 
export class H_Agent extends H_Tools {}


export class H_AgentInterconnection {
    id: number;
    leaderId: number;
    followerId: number;
    connectionGeometry: any;
    createdAt: Date;    
}

export class ToolPose {
    id: number | string; 
    x: number;
    y: number;
    orientation: number;
    orientations?: number[];

}


export class H_Shape{
    id: number | string;
    geometry: {points: number[][], top:number, bottom:number};
    geometryType: string;
    data: any;
    type: string;
    createdAt: Date;
    modifiedAt: Date;
    deletedAt: Date;
    isObstacle: boolean;
    isPermanent: boolean;
    yardId: number | string;
}

export class H_MapObject{
    id: number | string;
    name: string;
    data: any;
    metadata: any;
    dataFormat: string;
    type: string;
    createdAt: Date;
    modifiedAt: Date;
    deletedAt: Date;
    yardId: number | string;
}


export class  H_UserAccount {
    id: number;
    userId: number;
    email: string;
    metadata: any;
    username: string;
    passwordHash: string;
    userRole: number;
    createdAt: Date;
    modifiedAt: Date;
}

export class  H_InstantAction {
    id: number;
    yardId: number;
    agentId: number;
    agentUuid: string;
    sender: string;
    command: string;
    status: string;
    error: string;
    createdAt: Date;
}
export class H_Yard {
    id: string | number;
    uid: string;
    name: string;
    dataFormat: string;
    description: string;
    yardType: string;
    lat: number;
    lon: number;
    alt: number;
    mapData: any;
    createdAt: Date;
    deletedAt: Date;
    modifiedAt: Date;
    pictureBase64: string;
    picturePos: any;
}

export interface GeoPoint {lat: number, lon: number, zoomLevel: number}

export class H_Service {
    id: string;
    name: string;
    enabled: boolean;
    serviceType: string;
    serviceUrl: string;
    isDummy: boolean;
    licenceKey: string;
    config: any;
    createdAt: Date;
    deletedAt: Date;
    modifiedAt: Date;
    resultTimeout: number;
    requireMapData: boolean;
    requireMissionAgentsData: boolean;
    requireAgentsData: boolean;
}

export class H_ServiceRequest {
    context: any;
    workProcessId: number;
    step: string;
    status:string;
    startAt: Date;
    serviceUrl: string;
    serviceType: string;
    serviceQueueId: string;
    response: any;
    requestUid: string;
    request: any;
    processed: boolean;
    nextRequestToDispatchUid: string;
    modifiedAt: Date;
    isResultAssignment: boolean;
    id: number;
    fetched: boolean;
    dependOnRequests: string;
    createdAt: Date;
    dispatchedAt: Date;
    resultAt: Date;
    canceled: boolean;
    config: any;

}

export class H_WorkProcess {
    id: string | number;
    yardId: number;
    missionQueueId: number;
    runOrder: number;
    agentIds: number[];
    status: string;
    createdAt: Date;
    modifiedAt: Date
    startedAt: Date
    endedAt: Date
    schedStartAt: Date
    schedEndAt: Date
    processType: string;
    workProcessTypeName: string;
    workProcessTypeId: string;
    description: MoveToTargetDescriptor | MoveFreeDescriptor | string;
    data: any;
    waitFreeAgent: boolean;
}

export class H_MissionQueue  {
    id: string | number;
    name: string;
    status: string;
    createdAt: Date;
    modifiedAt: Date
    startedAt: Date
    endedAt: Date
    schedStartAt: Date
    schedEndAt: Date
    description: string;
    stopOnFailure: boolean;
}

export class H_WorkProcessType {
    id: string | number;
    name: string;
    description: string;
    numMaxAgents: number;
    dispatchOrder: string[][];
    settings: any = {};
    extraParams: any;
}

export class H_WorkProcessServicePlan {
    id: string | number;
    workProcessTypeId: string | number;
    step: string;
    requestOrder: number;
    agent: number;
    serviceType: string;
    waitDependenciesAssignments: boolean;
    serviceConfig: any;
    dependsOnSteps: string[];
    isResultAssignment: boolean;

}

export class MoveToTargetDescriptor  {
    agentId: string | number;
    targetId?: string | number;
    targetType?: string;
} 

export class MoveFreeDescriptor  {
    agentId: string | number;
    x: number;
    y: number;
    orientation: number;
    orientations?: number[];

} 

export class H_Target {
    id: string | number;
    targetName: string;
    x: number;
    y: number;
    orientation: number;
    targetType: string;
    anchor: string;
    createdAt: Date;
    deletedAt: Date;
    yardId: string | number;
}


export class H_Guideline {
    id: string | number;
    name: string;
    startX: number;
    startY: number;
    startOrientation: number;
    type: string;
    geometry: any;
    geometryType: string;
    data: string;
    dataType: string;
    createdAt: Date;
    deletedAt: Date;
    yardId: string | number;
}

export class H_SystemLog {
    id: string | number;
    createdAt: Date;
    wprocId?: number;
    agentUuid?: string;
    serviceType?: string;
    event: string;
    origin: string;
    logType: string;
    collected: boolean;
    msg: string;
}

interface H_ActionMessageData {
    api_version: number;
    messages: any[];
    response_url: string;
    steps: any[];
}

export class H_Action {
    id: string | number;
    data: H_ActionMessageData;
    creaeteAt: Date;
}


export class H_Assignment {
    id: string | number;
    yardId: number;
    data: any;
    workProcessId: number;
    agentId: number;
    status: string;
    startTimeStamp: string;
    error: string;
    createdAt: Date;
    modifiedAt: Date;
    dependOnAssignments:number[];
    nextAssignments: number[];
    context: {assignmentId: number, status: string, result: any}[];
    result: any
}

