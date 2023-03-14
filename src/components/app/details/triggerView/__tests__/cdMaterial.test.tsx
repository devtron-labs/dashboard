import React from "react";
import { render, act, screen, fireEvent, getByTestId, getAllByTestId, findByTestId, getByText } from "@testing-library/react";
import { CDMaterial } from "../cdMaterial";
import { BrowserRouter } from "react-router-dom";
import { CDMaterialProps, CDMaterialType, DeploymentNodeType } from "../types";
import TriggerView from "../TriggerView";
jest.mock('../workflow.service', ()=> ({
    getTriggerWorkflows: () => Promise.resolve({
        code: 200,
        status: "OK",
        result: {
            appId: 374,
            appName: 'prakash-1mar',
            workflows: [
                {
                    id: 399,
                    name: 'wf-374-m1nn',
                    appId: 374,
                    tree: [
                        {
                            id: 629,
                            appWorkflowId: 399,
                            type: 'CI_PIPELINE',
                            componentId: 393,
                            deploymentAppDeleteRequest: false,
                            parentId: 0,
                            parentType: '',
                        },
                        {
                            id: 173,
                            appWorkflowId: 92,
                            type: 'CD_PIPELINE',
                            componentId: 79,
                            parentId: 96,
                            parentType: 'CI_PIPELINE',
                        },
                    ],
                },
                {
                    id: 400,
                    name: 'wf-374-hb8c',
                    appId: 374,
                    tree: [
                        {
                            id: 195,
                            appWorkflowId: 93,
                            type: 'CI_PIPELINE',
                            componentId: 106,
                            parentId: 0,
                            parentType: '',
                        },
                        {
                            id: 196,
                            appWorkflowId: 93,
                            type: 'CD_PIPELINE',
                            componentId: 92,
                            parentId: 106,
                            parentType: 'CI_PIPELINE',
                        },
                        {
                            id: 200,
                            appWorkflowId: 93,
                            type: 'CD_PIPELINE',
                            componentId: 94,
                            parentId: 106,
                            parentType: 'CI_PIPELINE',
                        },
                    ],
                },
            ],
        },

    })
}))

describe('Trigger View components working without breaking',()=>{
//     const material: CDMaterialType = {
//         id: "",
//         materialInfo: [],
//         tab: "SECURITY",
//         scanEnabled: false,
//         scanned: false,
//         vulnerabilitiesLoading: false,
//         lastExecution: "",
//         vulnerabilities: [],
//         vulnerable: false,
//         deployedTime: "",
//         buildTime: "",
//         image: "",
//         isSelected: false,
//         showSourceInfo: false,
//         latest: false
//     }
    // const cdMaterialProps : CDMaterialProps = {
    //     appId:374,
    //     pipelineId:313,
    //     stageType:DeploymentNodeType.CD,
    //     material:[],
    //     materialType:"inputMaterialList",
    //     envName:"envtest10",
    //     isLoading:false,
    //     changeTab:()=>{},
    //     triggerDeploy:()=>{},
    //     onClickRollbackMaterial:()=>{},
    //     closeCDModal:()=>{},
    //     selectImage:()=>{},
    //     toggleSourceInfo:()=>{},
    //     parentPipelineId:"394",
    //     parentPipelineType:"CI_PIPELINE",
    //     parentEnvironmentName:undefined,
    // }
    beforeAll(()=>{
        render(<TriggerView />,{
            wrapper: BrowserRouter
        })
    })
    beforeEach(()=>{
        render(
            <CDMaterial
                appId={374}
                pipelineId={313}
                stageType={DeploymentNodeType.CD}
                material={[]}
                materialType={"inputMaterialList"}
                envName={"envtest10"}
                isLoading={false}
                changeTab={() => { } }
                triggerDeploy={() => { } }
                onClickRollbackMaterial={() => { } }
                closeCDModal={() => { } }
                selectImage={() => { } }
                toggleSourceInfo={() => { } }
                parentPipelineId={"394"}
                parentPipelineType={"CI_PIPELINE"}
                parentEnvironmentName={undefined} />
        )
    })
    // // afterEach(() => {
    // //     jest.resetAllMocks()
    // // })

    // it('afd',async () => {
    //     const selectImageButton = screen.getByText('Select Image')
    //     fireEvent.click(selectImageButton)
    //     expect(screen.findByText('Last saved config')).toBeInTheDocument
        
    // })
    it('cd material modal open without breaking',async () => {
        const { container, getByText } = render(<TriggerView />,{
            wrapper: BrowserRouter
        })

        const selectImagebutton = container.querySelector('.workflow-node__deploy-btn') as HTMLElement
        expect(selectImagebutton).toBeInTheDocument
        fireEvent.click(selectImagebutton)
    
        // const { getByTestId } = render(
        //     <CDMaterial material={[]} isLoading={false} materialType={""} envName={""} stageType={DeploymentNodeType.CD} triggerDeploy={function (stageType: DeploymentNodeType, _appId: number, deploymentWithConfig?: string | undefined, wfrId?: number | undefined): void {
        //         throw new Error("Function not implemented.");
        //     } } selectImage={function (index: number, materialType: string, selectedCDDetail?: { id: number; type: DeploymentNodeType; } | undefined): void {
        //         throw new Error("Function not implemented.");
        //     } } toggleSourceInfo={function (materialIndex: number, selectedCDDetail?: { id: number; type: DeploymentNodeType; } | undefined): void {
        //         throw new Error("Function not implemented.");
        //     } } closeCDModal={function (e: any): void {
        //         throw new Error("Function not implemented.");
        //     } }></CDMaterial>
        // )
        expect(screen.findByText('Deploy')).toBeInTheDocument
        expect(screen.findByText('Image not available')).toBeInTheDocument
    })

    // it('Select Image/Rollback Modal appeared properly without breaking',async () => {
    //     expect(screen.getByText('Select Image')).toBeInTheDocument
    // })
})