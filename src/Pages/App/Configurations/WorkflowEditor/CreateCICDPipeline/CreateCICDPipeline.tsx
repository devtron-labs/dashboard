import { useEffect, useState } from 'react'

import { APIResponseHandler, GenericModal, Icon, TriggerType, useAsync } from '@devtron-labs/devtron-fe-common-lib'

import { CDStepperContent } from './CDStepperContent'
import { CICDStepper } from './CICDStepper'
import { CIStepperContent } from './CIStepperContent'
import { getCICDPipelineInitData } from './service'
import { CICDStepperProps, CreateCICDPipelineData, CreateCICDPipelineFormError, CreateCICDPipelineProps } from './types'

import './createCICDPipeline.scss'

const FooterInfo = () => (
    <div className="flex dc__gap-8">
        <Icon name="ic-info-outline" color="N700" size={20} />
        <p className="m-0 fs-13 lh-20 fw-4 cn-9">You can add additional configurations after creating the workflow.</p>
    </div>
)

export const CreateCICDPipeline = ({ open, onClose, appId }: CreateCICDPipelineProps) => {
    // STATES
    const [ciCdPipeline, setCiCdPipeline] = useState<CreateCICDPipelineData>({
        materials: [],
        gitHost: null,
        webhookEvents: [],
        ciPipelineSourceTypeOptions: [],
        webhookConditionList: [],
        triggerType: TriggerType.Manual,
        scanEnabled: false,
        workflowCacheConfig: null,
        isBlobStorageConfigured: false,
    })
    const [ciCdPipelineFormError, setCiCdPipelineFormError] = useState<CreateCICDPipelineFormError>({})

    // ASYNC CALLS
    const [isCiCdPipelineLoading, ciCdPipelineRes, ciCdPipelineErr, reloadCiCdPipeline] = useAsync(
        () => getCICDPipelineInitData(appId),
        [open],
        open,
    )

    useEffect(() => {
        if (!isCiCdPipelineLoading && ciCdPipelineRes) {
            setCiCdPipeline(ciCdPipelineRes)
        }
    }, [isCiCdPipelineLoading, ciCdPipelineRes])

    const { materials, webhookConditionList, gitHost, webhookEvents, ciPipelineSourceTypeOptions, ciPipelineEditable } =
        ciCdPipeline

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
                />
            ),
        },
        {
            id: 'deploy',
            icon: 'ic-deploy-color',
            title: 'Select environment to deploy',
            content: <CDStepperContent />,
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
                            dataTestId: 'ci-cd-pipeline-create-workflow-button',
                            text: 'Create Workflow',
                        },
                    }}
                />
            )}
        </GenericModal>
    )
}
