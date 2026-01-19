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

import { useHistory } from 'react-router-dom'

import {
    Button,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    Icon,
    useSearchString,
} from '@devtron-labs/devtron-fe-common-lib'

import { ConfigurationsTabTypes } from './constants'
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
                icon={<Icon name="ic-pencil" color={null} />}
                ariaLabel="Edit"
                style={ButtonStyleType.neutral}
            />
            <Button
                onClick={onClickDeleteRow}
                variant={ButtonVariantType.borderLess}
                size={ComponentSizeType.xs}
                dataTestId={`${modal}-config-delete-button`}
                icon={<Icon name="ic-delete" color={null} />}
                ariaLabel="Delete"
                style={ButtonStyleType.negativeGrey}
            />
        </div>
    </div>
)

export const ConfigurationRowActionButtonWrapper = ({
    row,
    deleteClickHandler,
    modal,
}: {
    row: any
    deleteClickHandler: (id: number, modal: ConfigurationsTabTypes) => () => void
    modal: ConfigurationsTabTypes
}) => {
    const { searchParams } = useSearchString()
    const history = useHistory()

    const onClickEditRow = () => () => {
        const newParams = {
            ...searchParams,
            configId: row.id,
            modal,
        }
        history.push({
            search: new URLSearchParams(newParams).toString(),
        })
    }

    return (
        <ConfigTableRowActionButton
            onClickEditRow={onClickEditRow()}
            onClickDeleteRow={deleteClickHandler(row.id, modal)}
            modal={modal}
        />
    )
}
