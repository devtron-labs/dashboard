import {
    API_STATUS_CODES,
    ServerErrors,
    showError,
    TOAST_ACCESS_DENIED,
    ToastManager,
    ToastVariantType,
} from '@devtron-labs/devtron-fe-common-lib'

import { getCIMaterialList, triggerCINode } from '@Components/app/service'
import { handleSourceNotConfigured } from '@Components/ApplicationGroup/AppGroup.utils'
import { NO_TASKS_CONFIGURED_ERROR } from '@Config/constantMessaging'

import { GetCIMaterialsProps, TriggerBuildProps } from './types'

export const triggerBuild = async ({ payload, redirectToCIPipeline }: TriggerBuildProps) => {
    try {
        await triggerCINode(payload)
        ToastManager.showToast({
            variant: ToastVariantType.success,
            description: 'Pipeline Triggered',
        })
    } catch (errors) {
        if (errors.code === API_STATUS_CODES.PERMISSION_DENIED) {
            ToastManager.showToast({
                variant: ToastVariantType.notAuthorized,
                description: TOAST_ACCESS_DENIED.SUBTITLE,
            })
        } else if (
            errors instanceof ServerErrors &&
            Array.isArray(errors.errors) &&
            errors.code === API_STATUS_CODES.CONFLICT
        ) {
            errors.errors.map((err) =>
                ToastManager.showToast({
                    variant: ToastVariantType.error,
                    description: err.internalMessage,
                }),
            )
        } else {
            errors.errors = errors.errors.filter((error) => {
                const isNoTaskConfiguredError = redirectToCIPipeline && error.userMessage === NO_TASKS_CONFIGURED_ERROR

                if (isNoTaskConfiguredError) {
                    ToastManager.showToast({
                        variant: ToastVariantType.error,
                        title: 'Nothing to execute',
                        description: error.userMessage,
                        buttonProps: {
                            text: 'Edit Pipeline',
                            dataTestId: 'edit-pipeline-btn',
                            onClick: redirectToCIPipeline,
                        },
                    })
                }

                return !isNoTaskConfiguredError
            })

            if (errors.errors.length) {
                showError(errors)
            }
        }
        throw errors
    }
}

export const getCIMaterials = async ({
    ciNodeId,
    abortControllerRef,
    isCINodePresent,
    selectedWorkflow,
}: GetCIMaterialsProps) => {
    const { result: materialListResponse } = await getCIMaterialList(
        {
            pipelineId: ciNodeId,
        },
        abortControllerRef,
    )

    const configuredMaterialList = new Map<number, Set<number>>()
    if (isCINodePresent) {
        const gitMaterials = new Map<number, string[]>()
        materialListResponse?.forEach((material) => {
            gitMaterials[material.gitMaterialId] = [material.gitMaterialName.toLowerCase(), material.value]
        })

        configuredMaterialList[selectedWorkflow.name] = new Set<number>()

        handleSourceNotConfigured(
            configuredMaterialList,
            selectedWorkflow,
            materialListResponse || [],
            !gitMaterials[selectedWorkflow.ciConfiguredGitMaterialId],
        )
    }
    return materialListResponse
}
