import {
    Button,
    ButtonComponentType,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    DraggableButton,
    DraggablePositionVariant,
    DraggableWrapper,
    Icon,
} from '@devtron-labs/devtron-fe-common-lib'

import { importComponentFromFELibrary } from '@Components/common'

import { ClusterBulkSelectionActionWidgetProps } from './types'

const KubeConfigButton = importComponentFromFELibrary('KubeConfigButton', null, 'function')

export const ClusterBulkSelectionActionWidget = ({
    parentRef,
    count,
    handleClearBulkSelection,
}: ClusterBulkSelectionActionWidgetProps) => (
    <DraggableWrapper
        dragSelector=".drag-selector"
        positionVariant={DraggablePositionVariant.PARENT_BOTTOM_CENTER}
        zIndex="calc(var(--modal-index) - 1)"
        parentRef={parentRef}
    >
        <div className="dc__separated-flexbox dc__separated-flexbox--gap-8 pt-12 pb-12 pr-12 pl-12 bulk-selection-widget br-8">
            <div className="flexbox dc__gap-8">
                <DraggableButton dragClassName="drag-selector" />

                <div className="fs-13 lh-20 fw-6 flex dc__gap-12">
                    <span className="flex dc__gap-2 bcb-5 cn-0 br-4 pr-6 pl-6">{count}</span>
                    <span className="cn-9">Selected</span>
                </div>
            </div>

            {KubeConfigButton && <KubeConfigButton isPrimaryButton />}

            <Button
                icon={<Icon name="ic-close-large" color={null} />}
                dataTestId="rb-bulk-action__action-widget--close"
                component={ButtonComponentType.button}
                style={ButtonStyleType.negativeGrey}
                variant={ButtonVariantType.borderLess}
                ariaLabel="Clear selection(s)"
                size={ComponentSizeType.small}
                onClick={handleClearBulkSelection}
                showAriaLabelInTippy
            />
        </div>
    </DraggableWrapper>
)
