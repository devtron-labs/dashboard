import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'

import {
    APIResponseHandler,
    ButtonStyleType,
    ComponentSizeType,
    DeploymentAppTypes,
    GenericModal,
    Icon,
    saveCDPipeline,
    ServerErrors,
    showError,
    ToastManager,
    ToastVariantType,
    useAsync,
} from '@devtron-labs/devtron-fe-common-lib'

import { saveCIPipeline } from '@Components/ciPipeline/ciPipeline.service'
import { CIPipelineBuildType } from '@Components/ciPipeline/types'
import { getConfigureGitOpsCredentialsButtonProps } from '@Components/workflowEditor/ConfigureGitopsInfoBlock'

import { CDStepperContent } from './CDStepperContent'
import { CICDStepper } from './CICDStepper'
import { CIStepperContent } from './CIStepperContent'
import { CREATE_CI_CD_PIPELINE_TOAST_MESSAGES } from './constants'
import { getCICDPipelineInitData } from './service'
import { CICDStepperProps, CreateCICDPipelineData, CreateCICDPipelineFormError, CreateCICDPipelineProps } from './types'
import {
    getCiCdPipelineDefaultState,
    getCiCdPipelineFormErrorDefaultState,
    getSaveCDPipelinesPayload,
    getSaveCIPipelineMaterialsPayload,
    validateCreateCICDPipelineData,
} from './utils'

import './createCICDPipeline.scss'

const FooterInfo = () => (
    <div className="flex dc__gap-8">
        <Icon name="ic-info-outline" color="N700" size={20} />
        <p className="m-0 fs-13 lh-20 fw-4 cn-9">You can add additional configurations after creating the workflow.</p>
    </div>
)

export const CreateCICDPipeline = ({
    open,
    onClose,
    appId,
    getWorkflows,
    noGitOpsModuleInstalledAndConfigured,
    isGitOpsInstalledButNotConfigured,
    isGitOpsRepoNotConfigured,
    envIds,
}: CreateCICDPipelineProps) => {
    // STATES
    const [ciCdPipelineFormError, setCiCdPipelineFormError] = useState<CreateCICDPipelineFormError>(
        getCiCdPipelineFormErrorDefaultState,
    )
    const [isCreatingWorkflow, setIsCreatingWorkflow] = useState(false)
    const [cdNodeCreateError, setCdNodeCreateError] = useState<ServerErrors | null>(null)

    // REFS
    const ciPipelineResRef = useRef<{ appWorkflowId: number; id: number } | null>(null)

    // ASYNC CALLS
    const [isCiCdPipelineLoading, ciCdPipelineRes, ciCdPipelineErr, reloadCiCdPipeline, setter] = useAsync(
        () => getCICDPipelineInitData(appId),
        [open],
        open,
    )

    const ciCdPipeline = ciCdPipelineRes ?? getCiCdPipelineDefaultState()
    const setCiCdPipeline = setter as Dispatch<SetStateAction<CreateCICDPipelineData>>

    const { ci, cd } = ciCdPipeline
    const { materials, webhookConditionList, ciPipelineSourceTypeOptions, scanEnabled, isSecurityModuleInstalled } = ci
    const { deploymentAppType } = cd

    // HANDLERS
    const createWorkflow = async ({ shouldCreateCINode }: { shouldCreateCINode: boolean }) => {
        if (shouldCreateCINode) {
            const scanValidation = !window._env_.FORCE_SECURITY_SCANNING || !isSecurityModuleInstalled || scanEnabled
            if (!scanValidation) {
                ToastManager.showToast({
                    variant: ToastVariantType.error,
                    description: CREATE_CI_CD_PIPELINE_TOAST_MESSAGES.SCAN_VALIDATION_FAILED,
                })
                return
            }
        }

        if (deploymentAppType === DeploymentAppTypes.GITOPS && isGitOpsInstalledButNotConfigured) {
            ToastManager.showToast({
                variant: ToastVariantType.error,
                title: 'GitOps credentials not configured',
                description: 'GitOps credentials is required to deploy applications via GitOps',
                buttonProps: getConfigureGitOpsCredentialsButtonProps({
                    size: ComponentSizeType.small,
                    style: ButtonStyleType.neutral,
                }),
            })

            return
        }

        // if (checkForGitOpsRepoNotConfigured()) {
        //     return
        // }

        const { ciCdPipelineFormError: updatedCiCdPipelineFormError, isValid } = validateCreateCICDPipelineData(
            ciCdPipeline,
            envIds,
        )

        setCiCdPipelineFormError(updatedCiCdPipelineFormError)
        if (!isValid) {
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: CREATE_CI_CD_PIPELINE_TOAST_MESSAGES.FORM_VALIDATION_FAILED,
            })
            return
        }

        setIsCreatingWorkflow(true)
        setCdNodeCreateError(null)

        try {
            const materialsPayload = getSaveCIPipelineMaterialsPayload(materials)
            if (shouldCreateCINode) {
                const res = await saveCIPipeline(
                    {
                        ...ciCdPipeline.ci,
                        materials: materialsPayload,
                        scanEnabled: isSecurityModuleInstalled ? scanEnabled : false,
                    },
                    {
                        pipelineType: CIPipelineBuildType.CI_BUILD,
                    },
                    materialsPayload,
                    +appId,
                    0,
                    false,
                    webhookConditionList,
                    ciPipelineSourceTypeOptions,
                    null,
                    false,
                )

                ciPipelineResRef.current = {
                    id: res.ciPipeline.id,
                    appWorkflowId: res.appWorkflowId,
                }
            }

            const [cdNodeRes] = await Promise.allSettled([
                saveCDPipeline(
                    {
                        appId: +appId,
                        pipelines: getSaveCDPipelinesPayload({
                            cd,
                            appWorkflowId: ciPipelineResRef.current.appWorkflowId,
                            ciPipelineId: ciPipelineResRef.current.id,
                        }),
                    },
                    { isTemplateView: false },
                ),
            ])

            setIsCreatingWorkflow(false)
            await getWorkflows()

            if (cdNodeRes.status === 'rejected') {
                setCdNodeCreateError(cdNodeRes.reason)

                if (!shouldCreateCINode) {
                    if (cdNodeRes.reason.code === 409) {
                        // setReloadNoGitOpsRepoConfiguredModal(true)
                    } else {
                        showError(cdNodeRes.reason)
                    }
                } else {
                    ToastManager.showToast({
                        variant: ToastVariantType.warn,
                        title: 'Partial failed',
                        description: CREATE_CI_CD_PIPELINE_TOAST_MESSAGES.CREATE_CI_SUCCESS_CD_FAILED,
                    })
                }
            } else if (cdNodeRes.status === 'fulfilled' && cdNodeRes.value) {
                ToastManager.showToast({
                    variant: ToastVariantType.success,
                    description: CREATE_CI_CD_PIPELINE_TOAST_MESSAGES.CREATE_WORKFLOW_SUCCESS,
                })
                onClose()
            }
        } catch {
            setIsCreatingWorkflow(false)
            ToastManager.showToast({
                variant: ToastVariantType.error,
                title: 'Failed',
                description: CREATE_CI_CD_PIPELINE_TOAST_MESSAGES.CREATE_WORKFLOW_FAILED,
            })
        }
    }

    const handleCreateWorkflow = () =>
        cdNodeCreateError ? createWorkflow({ shouldCreateCINode: false }) : createWorkflow({ shouldCreateCINode: true })

    // RESET
    const resetStateToDefault = () => {
        setCiCdPipeline(getCiCdPipelineDefaultState)
        setCiCdPipelineFormError(getCiCdPipelineFormErrorDefaultState)
        setIsCreatingWorkflow(false)
        setCdNodeCreateError(null)
        ciPipelineResRef.current = null
    }

    useEffect(() => {
        if (!open) {
            resetStateToDefault()
        }
    }, [open])

    // CONFIGS
    const stepperConfig: CICDStepperProps['config'] = [
        {
            id: 'build',
            icon: 'ic-build-color',
            title: 'Build and deploy from source code',
            content: (
                <CIStepperContent
                    ciCdPipeline={ciCdPipeline}
                    setCiCdPipeline={setCiCdPipeline}
                    ciCdPipelineFormError={ciCdPipelineFormError}
                    setCiCdPipelineFormError={setCiCdPipelineFormError}
                    isCreatingWorkflow={isCreatingWorkflow}
                    cdNodeCreateError={cdNodeCreateError}
                />
            ),
        },
        {
            id: 'deploy',
            icon: 'ic-deploy-color',
            title: 'Select environment to deploy',
            content: (
                <CDStepperContent
                    ciCdPipeline={ciCdPipeline}
                    setCiCdPipeline={setCiCdPipeline}
                    ciCdPipelineFormError={ciCdPipelineFormError}
                    setCiCdPipelineFormError={setCiCdPipelineFormError}
                    isCreatingWorkflow={isCreatingWorkflow}
                    cdNodeCreateError={cdNodeCreateError}
                    noGitOpsModuleInstalledAndConfigured={noGitOpsModuleInstalledAndConfigured}
                    isGitOpsInstalledButNotConfigured={isGitOpsInstalledButNotConfigured}
                    isGitOpsRepoNotConfigured={isGitOpsRepoNotConfigured}
                    envIds={envIds}
                    onRetry={handleCreateWorkflow}
                />
            ),
        },
    ]

    return (
        <GenericModal name="create-ci-cd-pipeline-modal" open={open} width={800} onClose={onClose} onEscape={onClose}>
            <GenericModal.Header title="Build and deploy from source code" />
            <GenericModal.Body>
                <div className="flex ci-cd-pipeline px-20 py-16 dc__overflow-auto">
                    <APIResponseHandler
                        isLoading={isCiCdPipelineLoading}
                        progressingProps={{ pageLoader: true }}
                        error={ciCdPipelineErr}
                        errorScreenManagerProps={{ code: ciCdPipelineErr?.code, reload: reloadCiCdPipeline }}
                    >
                        <CICDStepper config={stepperConfig} />
                    </APIResponseHandler>
                </div>
            </GenericModal.Body>
            {!isCiCdPipelineLoading && !ciCdPipelineErr && (
                <GenericModal.Footer
                    leftSideElement={<FooterInfo />}
                    buttonConfig={{
                        primaryButton: {
                            dataTestId: 'ci-cd-workflow-create-button',
                            startIcon: cdNodeCreateError ? <Icon name="ic-arrow-clockwise" color={null} /> : null,
                            text: cdNodeCreateError ? 'Retry' : 'Create Workflow',
                            isLoading: isCreatingWorkflow,
                            onClick: handleCreateWorkflow,
                        },
                    }}
                />
            )}
        </GenericModal>
    )
}
