import { processWorkflow } from './workflow.service'
import { WorkflowTrigger, WorkflowCreate } from './config'
import {
    ciConfigResp,
    cdConfigResp,
    cdConfigPreResp,
    cdConfigPostResp,
    cdConfigPrePostResp,
    workflow,
    workflowsCreate,
    workflowsTrigger,
    workflowsTriggerPreCDResp,
    workflowsCreatePreCDResp,
    workflowsTriggerPostCD,
    workflowsCreatePostCD,
    workflowsTriggerPrePostCD,
    workflowsCreatePrePostCD,
    cdConfigPrePostRespWithPrePostSequential,
} from './workflow.data'

import {
    workflowsCreatePostCDWithSequential,
    workflowsCreatePreCDRespWithSequential,
    workflowsCreatePrePostCDWithSequential,
    workflowsCreateWithSequential,
    workflowsTriggerPostCDWithSequential,
    workflowsTriggerPreCDRespWithSequential,
    workflowsTriggerPrePostCDWithSequential,
    workflowsTriggerWithSequential,
    workflowWithSequential,
    workflowsTriggerPrePostCDWithPrePostSequential,
    workflowsCreatePrePostCDWithPrePostSequential,
} from './workflow.sequential.data'
import { CdPipelineResult, CiPipelineResult, WorkflowResult } from './types'

test('process workflows no PRECD, no POSTCD', () => {
    expect(
        processWorkflow(
            workflow.result as WorkflowResult,
            ciConfigResp.result as CiPipelineResult,
            cdConfigResp.result as CdPipelineResult,
            WorkflowTrigger,
            WorkflowTrigger.workflow,
        ).workflows,
    ).toStrictEqual(workflowsTrigger)
    expect(
        processWorkflow(
            workflow.result as WorkflowResult,
            ciConfigResp.result as CiPipelineResult,
            cdConfigResp.result as CdPipelineResult,
            WorkflowCreate,
            WorkflowCreate.workflow,
        ).workflows,
    ).toStrictEqual(workflowsCreate)
})

test('process workflows PRECD, no POSTCD', () => {
    expect(
        processWorkflow(
            workflow.result as WorkflowResult,
            ciConfigResp.result as CiPipelineResult,
            cdConfigPreResp.result as CdPipelineResult,
            WorkflowTrigger,
            WorkflowTrigger.workflow,
        ).workflows,
    ).toStrictEqual(workflowsTriggerPreCDResp)
    expect(
        processWorkflow(
            workflow.result as WorkflowResult,
            ciConfigResp.result as CiPipelineResult,
            cdConfigPreResp.result as CdPipelineResult,
            WorkflowCreate,
            WorkflowCreate.workflow,
        ).workflows,
    ).toStrictEqual(workflowsCreatePreCDResp)
})

test('process workflows no PRECD, POSTCD', () => {
    expect(
        processWorkflow(
            workflow.result as WorkflowResult,
            ciConfigResp.result as CiPipelineResult,
            cdConfigPostResp.result as CdPipelineResult,
            WorkflowTrigger,
            WorkflowTrigger.workflow,
        ).workflows,
    ).toStrictEqual(workflowsTriggerPostCD)
    expect(
        processWorkflow(
            workflow.result as WorkflowResult,
            ciConfigResp.result as CiPipelineResult,
            cdConfigPostResp.result as CdPipelineResult,
            WorkflowCreate,
            WorkflowCreate.workflow,
        ).workflows,
    ).toStrictEqual(workflowsCreatePostCD)
})

test('process workflows PRECD, POSTCD', () => {
    expect(
        processWorkflow(
            workflow.result as WorkflowResult,
            ciConfigResp.result as CiPipelineResult,
            cdConfigPrePostResp.result as CdPipelineResult,
            WorkflowTrigger,
            WorkflowTrigger.workflow,
        ).workflows,
    ).toStrictEqual(workflowsTriggerPrePostCD)
    expect(
        processWorkflow(
            workflow.result as WorkflowResult,
            ciConfigResp.result as CiPipelineResult,
            cdConfigPrePostResp.result as CdPipelineResult,
            WorkflowCreate,
            WorkflowCreate.workflow,
        ).workflows,
    ).toStrictEqual(workflowsCreatePrePostCD)
})

test('process workflows sequential no PRECD, no POSTCD', () => {
    expect(
        processWorkflow(
            workflowWithSequential.result as WorkflowResult,
            ciConfigResp.result as CiPipelineResult,
            cdConfigResp.result as CdPipelineResult,
            WorkflowTrigger,
            WorkflowTrigger.workflow,
        ).workflows,
    ).toStrictEqual(workflowsTriggerWithSequential)
    expect(
        processWorkflow(
            workflowWithSequential.result as WorkflowResult,
            ciConfigResp.result as CiPipelineResult,
            cdConfigResp.result as CdPipelineResult,
            WorkflowCreate,
            WorkflowCreate.workflow,
        ).workflows,
    ).toStrictEqual(workflowsCreateWithSequential)
})

test('process workflows sequeqntial PRECD, no POSTCD', () => {
    expect(
        processWorkflow(
            workflowWithSequential.result as WorkflowResult,
            ciConfigResp.result as CiPipelineResult,
            cdConfigPreResp.result as CdPipelineResult,
            WorkflowTrigger,
            WorkflowTrigger.workflow,
        ).workflows,
    ).toStrictEqual(workflowsTriggerPreCDRespWithSequential)
    expect(
        processWorkflow(
            workflowWithSequential.result as WorkflowResult,
            ciConfigResp.result as CiPipelineResult,
            cdConfigPreResp.result as CdPipelineResult,
            WorkflowCreate,
            WorkflowCreate.workflow,
        ).workflows,
    ).toStrictEqual(workflowsCreatePreCDRespWithSequential)
})

test('process workflows sequential no PRECD, POSTCD', () => {
    expect(
        processWorkflow(
            workflowWithSequential.result as WorkflowResult,
            ciConfigResp.result as CiPipelineResult,
            cdConfigPostResp.result as CdPipelineResult,
            WorkflowTrigger,
            WorkflowTrigger.workflow,
        ).workflows,
    ).toStrictEqual(workflowsTriggerPostCDWithSequential)
    expect(
        processWorkflow(
            workflowWithSequential.result as WorkflowResult,
            ciConfigResp.result as CiPipelineResult,
            cdConfigPostResp.result as CdPipelineResult,
            WorkflowCreate,
            WorkflowCreate.workflow,
        ).workflows,
    ).toStrictEqual(workflowsCreatePostCDWithSequential)
})

test('process workflows sequential PRECD, POSTCD', () => {
    expect(
        processWorkflow(
            workflowWithSequential.result as WorkflowResult,
            ciConfigResp.result as CiPipelineResult,
            cdConfigPrePostResp.result as CdPipelineResult,
            WorkflowTrigger,
            WorkflowTrigger.workflow,
        ).workflows,
    ).toStrictEqual(workflowsTriggerPrePostCDWithSequential)
    expect(
        processWorkflow(
            workflowWithSequential.result as WorkflowResult,
            ciConfigResp.result as CiPipelineResult,
            cdConfigPrePostResp.result as CdPipelineResult,
            WorkflowCreate,
            WorkflowCreate.workflow,
        ).workflows,
    ).toStrictEqual(workflowsCreatePrePostCDWithSequential)
})

test('process workflows pre and post sequential PRECD, POSTCD', () => {
    expect(
        processWorkflow(
            workflowWithSequential.result as WorkflowResult,
            ciConfigResp.result as CiPipelineResult,
            cdConfigPrePostRespWithPrePostSequential.result as CdPipelineResult,
            WorkflowTrigger,
            WorkflowTrigger.workflow,
        ).workflows,
    ).toStrictEqual(workflowsTriggerPrePostCDWithPrePostSequential)
    expect(
        processWorkflow(
            workflowWithSequential.result as WorkflowResult,
            ciConfigResp.result as CiPipelineResult,
            cdConfigPrePostRespWithPrePostSequential.result as CdPipelineResult,
            WorkflowCreate,
            WorkflowCreate.workflow,
        ).workflows,
    ).toStrictEqual(workflowsCreatePrePostCDWithPrePostSequential)
})
