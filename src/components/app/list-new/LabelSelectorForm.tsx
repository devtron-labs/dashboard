import { useState } from 'react'

import {
    Button,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    DynamicDataTable,
    DynamicDataTableCellErrorType,
    DynamicDataTableProps,
    ToastManager,
    ToastVariantType,
} from '@devtron-labs/devtron-fe-common-lib'

import {
    DEFAULT_LABEL_SELECTOR_OPERATOR,
    LABEL_OPERATORS_WITHOUT_VALUE,
    LABEL_SELECTOR_HEADER_CONFIG,
} from './Constants'
import {
    AppListFilterLabelOperatorType,
    AppListFilterLabelTableHeaderType,
    AppListFilterLabelType,
    LabelSelectorFormProps,
} from './types'
import { getEmptyLabelSelector, getSelectorRowConfig, getSelectorsErrorState } from './utils'

const LabelSelectorForm = ({ closePopover, initialLabels, onApply }: LabelSelectorFormProps) => {
    const [selectors, setSelectors] = useState<AppListFilterLabelType[]>(() =>
        initialLabels.length ? initialLabels : [getEmptyLabelSelector()],
    )
    const [cellError, setCellError] = useState<DynamicDataTableCellErrorType<AppListFilterLabelTableHeaderType>>({})
    const selectorRows: DynamicDataTableProps<AppListFilterLabelTableHeaderType>['rows'] =
        selectors.map(getSelectorRowConfig)

    const handleRowAdd: DynamicDataTableProps<AppListFilterLabelTableHeaderType>['onRowAdd'] = () => {
        const updatedSelectors: typeof selectors = [getEmptyLabelSelector(), ...selectors]
        setSelectors(updatedSelectors)
    }

    const handleRowEdit: DynamicDataTableProps<AppListFilterLabelTableHeaderType>['onRowEdit'] = (
        row,
        headerKey,
        value,
    ) => {
        const updatedSelectors: typeof initialLabels = selectors.map((selector) => {
            if (selector.id === row.id) {
                const updatedSelector = { ...selector }
                switch (headerKey) {
                    case AppListFilterLabelTableHeaderType.KEY:
                        updatedSelector.key = value || ''
                        break
                    case AppListFilterLabelTableHeaderType.VALUE:
                        updatedSelector.value = value || ''
                        break
                    case AppListFilterLabelTableHeaderType.OPERATOR: {
                        const operator = (value as AppListFilterLabelOperatorType) || DEFAULT_LABEL_SELECTOR_OPERATOR
                        if (LABEL_OPERATORS_WITHOUT_VALUE.includes(operator)) {
                            delete updatedSelector.value
                        }
                        updatedSelector.operator = operator

                        break
                    }
                    default:
                        break
                }
                return updatedSelector
            }
            return selector
        })
        setSelectors(updatedSelectors)
        setCellError(getSelectorsErrorState(updatedSelectors))
    }

    const handleRowDelete: DynamicDataTableProps<AppListFilterLabelTableHeaderType>['onRowDelete'] = (deletedRow) => {
        const isLastRow = selectors.length === 1

        const updatedSelectors: typeof initialLabels = isLastRow
            ? [
                  {
                      id: deletedRow.id as string,
                      key: '',
                      value: '',
                      operator: DEFAULT_LABEL_SELECTOR_OPERATOR,
                  } satisfies (typeof initialLabels)[number],
              ]
            : selectors.filter((selector) => selector.id !== deletedRow.id)

        setSelectors(updatedSelectors)
        setCellError(getSelectorsErrorState(updatedSelectors))
    }

    const handleApply = () => {
        const errors = getSelectorsErrorState(selectors)
        setCellError(errors)

        if (Object.keys(errors).length) {
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: 'Please fix the errors before applying.',
            })
            return
        }

        onApply(selectors)
        closePopover()
    }

    return (
        <div className="flexbox-col dc__gap-16 p-16">
            <div className="flexbox-col">
                <h2 className="m-0 cn-9 fs-14 fw-6 lh-20">Filter by tags</h2>
                <p className="m-0 cn-7 fs-12 fw-4 lh-1-5">Multiple tag filters are applied using AND logic</p>
            </div>

            <DynamicDataTable<AppListFilterLabelTableHeaderType>
                headers={LABEL_SELECTOR_HEADER_CONFIG}
                rows={selectorRows}
                onRowAdd={handleRowAdd}
                onRowEdit={handleRowEdit}
                onRowDelete={handleRowDelete}
                shouldAutoFocusOnMount={false}
                cellError={cellError}
            />

            <div className="flexbox dc__content-end dc__gap-8">
                <Button
                    dataTestId="label-selector-form-cancel"
                    text="Cancel"
                    onClick={closePopover}
                    size={ComponentSizeType.medium}
                    variant={ButtonVariantType.secondary}
                    style={ButtonStyleType.neutral}
                />

                <Button
                    dataTestId="label-selector-form-apply"
                    text="Apply"
                    onClick={handleApply}
                    size={ComponentSizeType.medium}
                />
            </div>
        </div>
    )
}

export default LabelSelectorForm
