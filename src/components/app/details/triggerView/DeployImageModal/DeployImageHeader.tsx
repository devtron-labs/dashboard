import {
    Button,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    Icon,
} from '@devtron-labs/devtron-fe-common-lib'

import { DeployImageHeaderProps } from './types'
import { getCDModalHeaderText } from './utils'

const DeployImageHeader = ({
    envName,
    handleClose,
    stageType,
    isRollbackTrigger,
    isVirtualEnvironment,
}: DeployImageHeaderProps) => (
    <div className="px-20 py-12 flexbox dc__content-space dc__align-items-center border__primary--bottom">
        <h2 className="m-0 fs-16 fw-4 lh-24 cn-9 dc__truncate">
            {getCDModalHeaderText({
                isRollbackTrigger,
                stageType,
                envName,
                isVirtualEnvironment,
            })}
        </h2>

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

export default DeployImageHeader
