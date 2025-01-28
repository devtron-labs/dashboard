import { Trash } from '@Components/common'
import { ReactComponent as Edit } from '@Icons/ic-pencil.svg'
import { Button, ButtonStyleType, ButtonVariantType, ComponentSizeType } from '@devtron-labs/devtron-fe-common-lib'
import { ConfigTableRowActionButtonProps } from './types'

export const ConfigTableRowActionButton = ({
    onClickEditRow,
    onClickDeleteRow,
    modal,
}: ConfigTableRowActionButtonProps) => (
    <div className="dc__visible-hover--child">
        <div className="flex right dc__gap-8 dc__no-shrink">
            <Button
                onClick={onClickEditRow}
                variant={ButtonVariantType.borderLess}
                size={ComponentSizeType.xs}
                dataTestId={`${modal}-config-edit-button`}
                icon={<Edit />}
                ariaLabel="Edit"
                style={ButtonStyleType.neutral}
            />
            <Button
                onClick={onClickDeleteRow}
                variant={ButtonVariantType.borderLess}
                size={ComponentSizeType.xs}
                dataTestId={`${modal}-config-delete-button`}
                icon={<Trash />}
                ariaLabel="Delete"
                style={ButtonStyleType.negativeGrey}
            />
        </div>
    </div>
)
