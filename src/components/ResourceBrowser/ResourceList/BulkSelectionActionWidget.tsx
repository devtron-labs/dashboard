import {
    DraggableButton,
    DraggablePositionVariant,
    DraggableWrapper,
    Tooltip,
} from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as ICClose } from '@Icons/ic-close.svg'
import { ReactComponent as ICTrash } from '@Icons/ic-delete-interactive.svg'
import { ReactComponent as ICRestart } from '@Icons/ic-arrow-clockwise.svg'
import { BulkSelectionActionWidgetProps } from '../Types'

const BulkSelectionActionWidget = ({
    count,
    handleOpenBulkDeleteModal,
    handleClearBulkSelection,
    showBulkRestartOption,
    parentRef,
    handleOpenRestartWorkloadModal,
}: BulkSelectionActionWidgetProps) => (
    <DraggableWrapper
        dragSelector=".drag-selector"
        positionVariant={DraggablePositionVariant.PARENT_BOTTOM_CENTER}
        zIndex="calc(var(--modal-index) - 1)"
        parentRef={parentRef}
    >
        <div className="flex dc__gap-8 pt-12 pb-12 pr-12 pl-12 bulk-selection-widget br-8">
            <DraggableButton dragClassName="drag-selector" />
            <div className="fs-13 lh-20 fw-6 flex dc__gap-12">
                <span className="flex dc__gap-2 bcb-5 cn-0 br-4 pr-6 pl-6">{count}</span>
                <span className="cn-9">Selected</span>
            </div>
            <div className="dc__divider h-16" />
            <div className="flex dc__gap-8">
                {showBulkRestartOption && (
                    <>
                        <Tooltip className="default-tt" arrow={false} placement="top" content="Restart workload(s)">
                            <button
                                type="button"
                                className="dc__transparent flex p-0 icon-delete"
                                onClick={handleOpenRestartWorkloadModal}
                                aria-label="Restart selected workloads"
                            >
                                <ICRestart className="scn-6 icon-dim-28 p-6 dc__no-shrink" />
                            </button>
                        </Tooltip>
                        <div className="dc__divider h-16" />
                    </>
                )}
                <Tooltip className="default-tt" arrow={false} placement="top" content="Delete resources(s)">
                    <button
                        type="button"
                        className="dc__transparent flex p-0 icon-delete"
                        onClick={handleOpenBulkDeleteModal}
                        aria-label="Delete selected resources"
                    >
                        <ICTrash className="scn-6 icon-dim-28 p-6 dc__no-shrink" />
                    </button>
                </Tooltip>
                <div className="dc__divider h-16" />
                <Tooltip className="default-tt" arrow={false} placement="top" content="Clear Selection(s)">
                    <button
                        type="button"
                        className="dc__transparent flex p-0"
                        onClick={handleClearBulkSelection}
                        aria-label="Clear bulk selection"
                    >
                        <ICClose className="fcn-6 icon-dim-28 p-6 dc__no-shrink" />
                    </button>
                </Tooltip>
            </div>
        </div>
    </DraggableWrapper>
)

export default BulkSelectionActionWidget
