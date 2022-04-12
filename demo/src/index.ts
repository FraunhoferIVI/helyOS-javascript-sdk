import { HelyosServices } from 'helyosjs-sdk';


function createNewMission() {
   console.log("==> Creating drive mission...");
   return helyosService.workProcess.create({
                            toolIds: [1],
                            yardId: 1,
                            workProcessTypeName: 'driving',
                            data: {x:-24945.117347564425,y:12894.566793421798,
                                   anchor:"front","tool_id":1,"_settings":{},
                                   orientation:1507.1,"orientations":[1507.1],
                                   schedStartAt:"2022-04-11T12:53:36.902Z", 
                                   workProcessTypeName:"driving"} as any,
                            status: 'dispatched',
    });
}

function trackVehicle() {
   console.log("==> Tracking position...\n");
   helyosService.socket.on('new_tool_poses',(updates: any)=>{
   const agentData = updates.filter(( agent:any) => agent.toolId === 1);
    console.log(agentData);
   });

   helyosService.socket.on('change_work_processes',(updates:any)=>{
   const wprocessStatus = updates.map((wprocess:any) => wprocess.status);
    console.log(wprocessStatus);
    if (wprocessStatus.includes('succeeded')) {
        process.exit();
    }
   });

}



const helyosService = new HelyosServices('http://localhost', {socketPort:'5002', gqlPort:'5000'});
const username = 'admin@trucktrix.com';
const password = 'admin';

helyosService.login(username, password)
.then( response => helyosService.connect())
.then( connected => {
    console.log("==> Connected to helyOS")
    createNewMission()
    .then(() => trackVehicle())
});





