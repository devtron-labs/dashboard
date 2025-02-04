/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
