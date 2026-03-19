import {adminService} from "./admin.service.js"

export class adminController {
    private adminservice:adminService;
    constructor(){
        this.adminservice=new adminService();
    }
    async AssignProfessional = ()=>{

    }
    
}