import { HelyosServices } from 'helyosjs-sdk';


const helyosService = new HelyosServices('http://localhost', {socketPort:'5002', gqlPort:'5000'});
const username = 'admin';
const password = 'admin';

helyosService.login(username, password)
.then( response => helyosService.connect())
.then( connected => {
    console.log("==> Connected to helyOS")
    createNewMission()
    .then(() => trackVehicle())
});


function createNewMission() {
   console.log("==> Creating drive mission...");

    const trucktrixPathPlannerRequest = {   x:-24945.117347564425,    // request data for trucktrix path planner microservice.
                                            y:12894.566793421798,
                                            anchor:"front",
                                            orientation:1507.1, 
                                            orientations:[1507.1],
                                            tool_id:1,
                                            _settings:{},
                                            schedStartAt:"2022-04-11T12:53:36.902Z"
                                        };


   return helyosService.workProcess.create({
                            toolIds: [1],    // tool is the agent.  'toolID'  is the database id. This is NOT the agent uuid. 
                            yardId: 1,       // the yard where the tool (agent) has checked in.
                            workProcessTypeName: 'driving',           // name of the mission recipe as defined in helyOS dashboard
                            data: trucktrixPathPlannerRequest as any, // this data format depends on the microservice.
                            status: 'dispatched',                     // status = 'draft' will save the mission but no dispatch it.
    });
}

function trackVehicle() {
   console.log("==> Tracking agent position and assignment status...\n");

   helyosService.socket.on('new_tool_poses',(updates: any)=>{
   const agentData = updates.filter(( agent:any) => agent.toolId === 1);
    console.log(agentData);
   });

   helyosService.socket.on('change_work_processes',(updates:any)=>{
   const wprocessStatus = updates.map((wprocess:any) => wprocess.status);
    console.log(wprocessStatus);
    if (wprocessStatus.includes('succeeded') || wprocessStatus.includes('failed') ) {
        process.exit();
    }
   });

}








