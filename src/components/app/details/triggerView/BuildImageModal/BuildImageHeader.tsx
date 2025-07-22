import {
    Button,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    Icon,
} from '@devtron-labs/devtron-fe-common-lib'

import { BuildImageHeaderProps } from './types'

const BuildImageHeader = ({
    showWebhookModal,
    handleWebhookModalBack,
    pipelineName,
    isJobView,
    handleClose,
}: BuildImageHeaderProps) => (
    <div className="px-20 py-12 flexbox dc__content-space dc__align-items-center border__primary--bottom">
        {showWebhookModal ? (
            <div className="flexbox dc__gap-12" data-testid="build-deploy-pipeline-name-heading">
                <Button
                    dataTestId="webhook-back-button"
                    ariaLabel="Back"
                    icon={<Icon name="ic-arrow-right" color="N700" rotateBy={180} />}
                    variant={ButtonVariantType.borderLess}
                    size={ComponentSizeType.xs}
                    showAriaLabelInTippy={false}
                    style={ButtonStyleType.neutral}
                    onClick={handleWebhookModalBack}
                />

                <h2 className="m-0 fs-16 fw-6 lh-24 cn-9 flexbox">
                    <span className="dc__truncate dc__mxw-250">{pipelineName}</span>
                    <span className="fs-16">&nbsp;/ All received webhooks </span>
                </h2>
            </div>
        ) : (
            <h2 className="m-0 fs-16 fw-6 lh-24 cn-9 dc__truncate">
                {isJobView ? 'Pipeline' : 'Build Pipeline'} {pipelineName ? `: ${pipelineName}` : ''}
            </h2>
        )}

        <Button
            dataTestId="header-close-button"
            ariaLabel="Close"
            showAriaLabelInTippy={false}
            onClick={handleClose}
            variant={ButtonVariantType.borderLess}
            style={ButtonStyleType.negativeGrey}
            icon={<Icon name="ic-close-large" color={null} />}
            size={ComponentSizeType.xs}
        />
    </div>
)

export default BuildImageHeader
