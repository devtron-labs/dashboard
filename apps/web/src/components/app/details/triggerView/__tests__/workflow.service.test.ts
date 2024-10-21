/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { processWorkflow } from '../workflow.service'
import { WorkflowTrigger, WorkflowCreate } from '../config'
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
} from '../__mocks__/workflow.mock'
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
} from '../__mocks__/workflow.sequential.mock'
import { CdPipelineResult, CiPipelineResult, WorkflowResult } from '../types'

describe('workflow service tests', () => {
    test('process workflows no PRECD, no POSTCD', () => {
        expect(
            processWorkflow(
                workflow.result as WorkflowResult,
                ciConfigResp.result as CiPipelineResult,
                cdConfigResp.result as CdPipelineResult,
                [],
                WorkflowTrigger,
                WorkflowTrigger.workflow,
            ).workflows,
        ).toStrictEqual(workflowsTrigger)
        expect(
            processWorkflow(
                workflow.result as WorkflowResult,
                ciConfigResp.result as CiPipelineResult,
                cdConfigResp.result as CdPipelineResult,
                [],
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
                [],
                WorkflowTrigger,
                WorkflowTrigger.workflow,
            ).workflows,
        ).toStrictEqual(workflowsTriggerPreCDResp)
        expect(
            processWorkflow(
                workflow.result as WorkflowResult,
                ciConfigResp.result as CiPipelineResult,
                cdConfigPreResp.result as CdPipelineResult,
                [],
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
                [],
                WorkflowTrigger,
                WorkflowTrigger.workflow,
            ).workflows,
        ).toStrictEqual(workflowsTriggerPostCD)
        expect(
            processWorkflow(
                workflow.result as WorkflowResult,
                ciConfigResp.result as CiPipelineResult,
                cdConfigPostResp.result as CdPipelineResult,
                [],
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
                [],
                WorkflowTrigger,
                WorkflowTrigger.workflow,
            ).workflows,
        ).toStrictEqual(workflowsTriggerPrePostCD)
        expect(
            processWorkflow(
                workflow.result as WorkflowResult,
                ciConfigResp.result as CiPipelineResult,
                cdConfigPrePostResp.result as CdPipelineResult,
                [],
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
                [],
                WorkflowTrigger,
                WorkflowTrigger.workflow,
            ).workflows,
        ).toStrictEqual(workflowsTriggerWithSequential)
        expect(
            processWorkflow(
                workflowWithSequential.result as WorkflowResult,
                ciConfigResp.result as CiPipelineResult,
                cdConfigResp.result as CdPipelineResult,
                [],
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
                [],
                WorkflowTrigger,
                WorkflowTrigger.workflow,
            ).workflows,
        ).toStrictEqual(workflowsTriggerPreCDRespWithSequential)
        expect(
            processWorkflow(
                workflowWithSequential.result as WorkflowResult,
                ciConfigResp.result as CiPipelineResult,
                cdConfigPreResp.result as CdPipelineResult,
                [],
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
                [],
                WorkflowTrigger,
                WorkflowTrigger.workflow,
            ).workflows,
        ).toStrictEqual(workflowsTriggerPostCDWithSequential)
        expect(
            processWorkflow(
                workflowWithSequential.result as WorkflowResult,
                ciConfigResp.result as CiPipelineResult,
                cdConfigPostResp.result as CdPipelineResult,
                [],
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
                [],
                WorkflowTrigger,
                WorkflowTrigger.workflow,
            ).workflows,
        ).toStrictEqual(workflowsTriggerPrePostCDWithSequential)
        expect(
            processWorkflow(
                workflowWithSequential.result as WorkflowResult,
                ciConfigResp.result as CiPipelineResult,
                cdConfigPrePostResp.result as CdPipelineResult,
                [],
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
                [],
                WorkflowTrigger,
                WorkflowTrigger.workflow,
            ).workflows,
        ).toStrictEqual(workflowsTriggerPrePostCDWithPrePostSequential)
        expect(
            processWorkflow(
                workflowWithSequential.result as WorkflowResult,
                ciConfigResp.result as CiPipelineResult,
                cdConfigPrePostRespWithPrePostSequential.result as CdPipelineResult,
                [],
                WorkflowCreate,
                WorkflowCreate.workflow,
            ).workflows,
        ).toStrictEqual(workflowsCreatePrePostCDWithPrePostSequential)
    })
})
