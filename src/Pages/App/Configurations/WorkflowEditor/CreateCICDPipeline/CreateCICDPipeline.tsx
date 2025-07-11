import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'

import {
    API_STATUS_CODES,
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
import NoGitOpsRepoConfiguredWarning, {
    ReloadNoGitOpsRepoConfiguredModal,
} from '@Components/workflowEditor/NoGitOpsRepoConfiguredWarning'

import { checkForGitOpsRepoNotConfigured } from '../utils'
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
    isTemplateView,
    reloadAppConfig,
}: CreateCICDPipelineProps) => {
    // STATES
    const [ciCdPipelineFormError, setCiCdPipelineFormError] = useState<CreateCICDPipelineFormError>(
        getCiCdPipelineFormErrorDefaultState,
    )
    const [isCreatingWorkflow, setIsCreatingWorkflow] = useState(false)
    const [cdNodeCreateError, setCdNodeCreateError] = useState<ServerErrors | null>(null)
    const [reloadNoGitOpsRepoConfiguredModal, setReloadNoGitOpsRepoConfiguredModal] = useState(false)
    const [gitOpsRepoConfiguredWarning, setGitOpsRepoConfiguredWarning] = useState<{ show: boolean; text: string }>({
        show: false,
        text: '',
    })

    // REFS
    const ciPipelineResRef = useRef<{ appWorkflowId: number; id: number } | null>(null)

    // ASYNC CALLS
    const [isCiCdPipelineLoading, ciCdPipelineRes, ciCdPipelineErr, reloadCiCdPipeline, setter] = useAsync(
        () => getCICDPipelineInitData(appId, isTemplateView),
        [open, isTemplateView],
        open,
    )

    const ciCdPipeline = ciCdPipelineRes ?? getCiCdPipelineDefaultState()
    const setCiCdPipeline = setter as Dispatch<SetStateAction<CreateCICDPipelineData>>

    const { ci, cd } = ciCdPipeline
    const { materials, webhookConditionList, ciPipelineSourceTypeOptions, scanEnabled, isSecurityModuleInstalled } = ci
    const { deploymentAppType, selectedEnvironment } = cd

    // HANDLERS
    const handleOnEscape = () => {
        onClose()
    }

    const handleReloadNoGitOpsRepoConfiguredModalClose = () => {
        setReloadNoGitOpsRepoConfiguredModal(false)
    }

    const handleNoGitOpsRepoConfiguredWarningClose = () => {
        setGitOpsRepoConfiguredWarning({ show: false, text: '' })
    }

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

        if (deploymentAppType === DeploymentAppTypes.ARGO && isGitOpsInstalledButNotConfigured) {
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

        if (
            checkForGitOpsRepoNotConfigured({
                allowedDeploymentTypes: selectedEnvironment?.allowedDeploymentTypes,
                deploymentAppType: deploymentAppType as DeploymentAppTypes,
                environmentName: selectedEnvironment?.name,
                isGitOpsRepoNotConfigured,
                isTemplateView,
                noGitOpsModuleInstalledAndConfigured,
                setGitOpsRepoConfiguredWarning,
            })
        ) {
            return
        }

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
                        name: '',
                        active: true,
                        ciMaterial: [],
                        dockerArgs: {},
                        externalCiConfig: {},
                        id: 0,
                        isExternal: false,
                        isManual: false,
                        linkedCount: 0,
                        scanEnabled: false,
                        environmentId: 0,
                        customTag: {
                            tagPattern: '',
                            counterX: '',
                        },
                    },
                    materialsPayload,
                    +appId,
                    0,
                    false,
                    webhookConditionList,
                    ciPipelineSourceTypeOptions,
                    null,
                    isTemplateView,
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
                    { isTemplateView },
                ),
            ])

            setIsCreatingWorkflow(false)

            if (cdNodeRes.status === 'rejected') {
                setCdNodeCreateError(cdNodeRes.reason)

                if (!shouldCreateCINode) {
                    if (cdNodeRes.reason.code === API_STATUS_CODES.CONFLICT) {
                        setReloadNoGitOpsRepoConfiguredModal(true)
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
                getWorkflows()
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

    const handleCreateWorkflow = () => createWorkflow({ shouldCreateCINode: !cdNodeCreateError })

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
            title: 'Select code source to build image',
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
                    appId={appId}
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
                    setReloadNoGitOpsRepoConfiguredModal={setReloadNoGitOpsRepoConfiguredModal}
                />
            ),
        },
    ]

    return (
        <>
            <GenericModal
                name="create-ci-cd-pipeline-modal"
                open={open}
                width={800}
                onClose={onClose}
                onEscape={handleOnEscape}
            >
                <GenericModal.Header title="Build and deploy from source code" />
                <GenericModal.Body>
                    <div className="flex ci-cd-pipeline px-20 py-16 bg__secondary dc__overflow-auto">
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

            {reloadNoGitOpsRepoConfiguredModal && (
                <ReloadNoGitOpsRepoConfiguredModal
                    closePopup={handleReloadNoGitOpsRepoConfiguredModalClose}
                    reload={reloadAppConfig}
                />
            )}

            {gitOpsRepoConfiguredWarning.show && (
                <NoGitOpsRepoConfiguredWarning
                    closePopup={handleNoGitOpsRepoConfiguredWarningClose}
                    appId={+appId}
                    text={gitOpsRepoConfiguredWarning.text}
                    reload={reloadAppConfig}
                />
            )}
        </>
    )
}
