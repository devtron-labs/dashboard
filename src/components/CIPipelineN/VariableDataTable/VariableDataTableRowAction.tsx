import { useState } from 'react'

import { TippyCustomized, TippyTheme } from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as ICSlidersVertical } from '@Icons/ic-sliders-vertical.svg'

import { VariableDataTableActionType, VariableDataTableRowActionProps } from './types'
import { getValidatedChoices } from './utils'

import { AddChoicesOverlay } from './AddChoicesOverlay'

export const VariableDataTableRowAction = ({
    handleRowUpdateAction,
    onClose,
    row,
}: VariableDataTableRowActionProps) => {
    const { data, customState, id } = row
    const [visible, setVisible] = useState(false)

    const handleClose = () => {
        const { choices, isValid } = getValidatedChoices(customState.choices)
        handleRowUpdateAction({
            actionType: VariableDataTableActionType.UPDATE_CHOICES,
            rowId: row.id,
            headerKey: null,
            actionValue: () => choices,
        })
        if (isValid) {
            setVisible(false)
            onClose()
        }
    }

    const handleAction = () => {
        if (visible) {
            handleClose()
        } else {
            setVisible(true)
        }
    }

    return (
        <TippyCustomized
            theme={TippyTheme.white}
            className="w-300"
            placement="left"
            visible={visible}
            interactive
            heading={data.variable.value}
            showCloseButton
            onClose={handleClose}
            additionalContent={
                <AddChoicesOverlay
                    choices={customState.choices}
                    blockCustomValue={customState.blockCustomValue}
                    askValueAtRuntime={customState.askValueAtRuntime}
                    rowId={id}
                    handleRowUpdateAction={handleRowUpdateAction}
                />
            }
            appendTo={document.getElementById('visible-modal')}
        >
            <button
                className="dc__transparent h-100 flex top py-10 px-8 dc__hover-n50"
                type="button"
                aria-label="row-config-button"
                onClick={handleAction}
            >
                <ICSlidersVertical className="icon-dim-16" />
            </button>
        </TippyCustomized>
    )
}
