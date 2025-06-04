import { useEffect, useState } from 'react'

import {
    APIResponseHandler,
    GenericModal,
    Icon,
    ServerErrors,
    showError,
    ToastManager,
    ToastVariantType,
    useAsync,
} from '@devtron-labs/devtron-fe-common-lib'

import { saveCIPipeline } from '@Components/ciPipeline/ciPipeline.service'
import { CIPipelineBuildType } from '@Components/ciPipeline/types'

import { CDStepperContent } from './CDStepperContent'
import { CICDStepper } from './CICDStepper'
import { CIStepperContent } from './CIStepperContent'
import { CREATE_CI_CD_PIPELINE_TOAST_MESSAGES } from './constants'
import { getCICDPipelineInitData } from './service'
import { CICDStepperProps, CreateCICDPipelineData, CreateCICDPipelineFormError, CreateCICDPipelineProps } from './types'
import { getCiCdPipelineDefaultState, getSaveCIPipelineMaterialsPayload, validateCreateCICDPipelineData } from './utils'

import './createCICDPipeline.scss'

const FooterInfo = () => (
    <div className="flex dc__gap-8">
        <Icon name="ic-info-outline" color="N700" size={20} />
        <p className="m-0 fs-13 lh-20 fw-4 cn-9">You can add additional configurations after creating the workflow.</p>
    </div>
)

export const CreateCICDPipeline = ({ open, onClose, appId, workflowId, getWorkflows }: CreateCICDPipelineProps) => {
    // STATES
    const [ciCdPipeline, setCiCdPipeline] = useState<CreateCICDPipelineData>(getCiCdPipelineDefaultState)
    const [ciCdPipelineFormError, setCiCdPipelineFormError] = useState<CreateCICDPipelineFormError>({})
    const [isCreatingWorkflow, setIsCreatingWorkflow] = useState(false)
    const [cdNodeCreateError, setCdNodeCreateError] = useState<ServerErrors | null>(null)

    // ASYNC CALLS
    const [isCiCdPipelineLoading, ciCdPipelineRes, ciCdPipelineErr, reloadCiCdPipeline] = useAsync(
        () => getCICDPipelineInitData(appId),
        [open],
        open,
    )

    const resetStateToDefault = () => {
        setCiCdPipeline(getCiCdPipelineDefaultState)
        setCiCdPipelineFormError({})
        setIsCreatingWorkflow(false)
        setCdNodeCreateError(null)
    }

    useEffect(() => {
        if (!open) {
            resetStateToDefault()
        }
    }, [open])

    useEffect(() => {
        if (!isCiCdPipelineLoading && ciCdPipelineRes) {
            setCiCdPipeline(ciCdPipelineRes)
        }
    }, [isCiCdPipelineLoading, ciCdPipelineRes])

    const {
        materials,
        webhookConditionList,
        gitHost,
        webhookEvents,
        ciPipelineSourceTypeOptions,
        ciPipelineEditable,
        scanEnabled,
        isSecurityModuleInstalled,
    } = ciCdPipeline

    // HANDLERS
    const saveCDPipeline = () =>
        // TODO: Integrate
        Promise.allSettled([
            new Promise((_, reject) => {
                setTimeout(() => reject(new Error('cd node failed')), 2000)
            }),
        ])

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

        const { ciCdPipelineFormError: updatedCiCdPipelineFormError, isValid } =
            validateCreateCICDPipelineData(ciCdPipeline)

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
                await saveCIPipeline(
                    {
                        ...ciCdPipeline,
                        materials: materialsPayload,
                        scanEnabled: isSecurityModuleInstalled ? scanEnabled : false,
                    },
                    {
                        pipelineType: CIPipelineBuildType.CI_BUILD,
                    },
                    materialsPayload,
                    +appId,
                    workflowId,
                    false,
                    webhookConditionList,
                    ciPipelineSourceTypeOptions,
                    null,
                    false,
                )
            }
            const [cdNodeRes] = await saveCDPipeline()

            setIsCreatingWorkflow(false)
            await getWorkflows()

            if (cdNodeRes.status === 'rejected') {
                setCdNodeCreateError(cdNodeRes.reason)

                if (!shouldCreateCINode) {
                    showError(cdNodeRes.reason)
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

    const handleCreateWorkflow = () => createWorkflow({ shouldCreateCINode: true })

    const handleRetryCreateWorkflow = () => createWorkflow({ shouldCreateCINode: false })

    // CONFIGS
    const stepperConfig: CICDStepperProps['config'] = [
        {
            id: 'build',
            icon: 'ic-build-color',
            title: 'Build and deploy from source code',
            content: (
                <CIStepperContent
                    materials={materials}
                    ciPipelineSourceTypeOptions={ciPipelineSourceTypeOptions}
                    gitHost={gitHost}
                    webhookEvents={webhookEvents}
                    webhookConditionList={webhookConditionList}
                    ciPipelineEditable={ciPipelineEditable}
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
                    ciCdPipelineFormError={ciCdPipelineFormError}
                    setCiCdPipelineFormError={setCiCdPipelineFormError}
                    isCreatingWorkflow={isCreatingWorkflow}
                    cdNodeCreateError={cdNodeCreateError}
                    onRetry={handleRetryCreateWorkflow}
                />
            ),
        },
    ]

    return (
        <GenericModal name="create-ci-cd-pipeline-modal" open={open} width={800} onClose={onClose} onEscape={onClose}>
            <GenericModal.Header title="Build and deploy from source code" />
            <GenericModal.Body>
                <div className="ci-cd-pipeline px-20 py-16 dc__overflow-auto">
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
                            onClick: cdNodeCreateError ? handleRetryCreateWorkflow : handleCreateWorkflow,
                        },
                    }}
                />
            )}
        </GenericModal>
    )
}
