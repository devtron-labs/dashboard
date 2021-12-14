import { getWorkflows, processWorkflow, WorkflowResult, CiPipelineResult, CdPipelineResult } from './workflow.service';
import { WorkflowTrigger, WorkflowCreate } from './config';
import {
    ciConfigResp, cdConfigResp, cdConfigPreResp, cdConfigPostResp, cdConfigPrePostResp, workflow,
    workflowsCreate, workflowsTrigger,
    workflowsTriggerPreCDResp, workflowsCreatePreCDResp,
    workflowsTriggerPostCD, workflowsCreatePostCD,
    workflowsTriggerPrePostCD, workflowsCreatePrePostCD,
    workflows2Resp, ciConfigWithLinkedCIResp, cdConfig2Resp, workflows2Trigger
} from './workflow.data';

import {
    workflowWithSequential
} from './workflow.sequential.data';

//Test Cases for PRECD and POSTCD
test('workflows no PRECD, no POSTCD', () => {
    expect(getWorkflows(workflow, ciConfigResp, cdConfigResp.result, WorkflowTrigger, WorkflowTrigger.workflow).workflows).toStrictEqual(workflowsCreate);
    expect(getWorkflows(workflow, ciConfigResp, cdConfigResp.result, WorkflowCreate, WorkflowCreate.workflow).workflows).toStrictEqual(workflowsTrigger);
})

test('workflows PRECD, no POSTCD', () => {
    expect(getWorkflows(workflow, ciConfigResp, cdConfigPreResp.result, WorkflowTrigger, WorkflowTrigger.workflow).workflows).toStrictEqual(workflowsTriggerPreCDResp);
    expect(getWorkflows(workflow, ciConfigResp, cdConfigPreResp.result, WorkflowCreate, WorkflowCreate.workflow).workflows).toStrictEqual(workflowsCreatePreCDResp);
})

test('workflows no PRECD, POSTCD', () => {
    expect(getWorkflows(workflow, ciConfigResp, cdConfigPostResp.result, WorkflowTrigger, WorkflowTrigger.workflow).workflows).toStrictEqual(workflowsTriggerPostCD);
    expect(getWorkflows(workflow, ciConfigResp, cdConfigPostResp.result, WorkflowCreate, WorkflowCreate.workflow).workflows).toStrictEqual(workflowsCreatePostCD);
})

test('workflows PRECD, POSTCD', () => {
    expect(getWorkflows(workflow, ciConfigResp, cdConfigPrePostResp.result, WorkflowTrigger, WorkflowTrigger.workflow).workflows).toStrictEqual(workflowsTriggerPrePostCD);
    expect(getWorkflows(workflow, ciConfigResp, cdConfigPrePostResp.result, WorkflowCreate, WorkflowCreate.workflow).workflows).toStrictEqual(workflowsCreatePrePostCD);
})

// test('LInked CI', () => {
//     expect(getWorkflows(workflows2Resp, ciConfigWithLinkedCIResp, cdConfig2Resp, WorkflowTrigger, WorkflowTrigger.workflow).workflows).toStrictEqual(workflows2Trigger);
// })

test('workflows process', () => {
    let out = processWorkflow(workflowWithSequential.result as WorkflowResult, ciConfigResp.result as CiPipelineResult, cdConfigResp.result as CdPipelineResult, WorkflowTrigger, WorkflowTrigger.workflow)
    console.log(out);
})