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
    handleNavigateToMaterialListView,
    children,
    title,
}: DeployImageHeaderProps) => (
    <div className="px-20 py-12 flexbox dc__content-space dc__align-items-center border__primary--bottom">
        <div className="flexbox dc__gap-8 dc__align-items-center flex-wrap">
            {handleNavigateToMaterialListView && (
                <Button
                    dataTestId="cd-trigger-back-button"
                    ariaLabel="Navigate to list view"
                    showAriaLabelInTippy={false}
                    variant={ButtonVariantType.borderLess}
                    style={ButtonStyleType.neutral}
                    icon={<Icon name="ic-arrow-right" rotateBy={180} color={null} />}
                    onClick={handleNavigateToMaterialListView}
                    size={ComponentSizeType.small}
                />
            )}

            <h2 className="m-0 fs-16 fw-4 lh-24 cn-9 dc__truncate">
                {title ||
                    getCDModalHeaderText({
                        isRollbackTrigger,
                        stageType,
                        envName,
                        isVirtualEnvironment,
                    })}
            </h2>

            {children}
        </div>

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
