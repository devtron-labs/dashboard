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

import { Button, ButtonVariantType, ComponentSizeType, useSearchString } from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as Add } from '@Icons/ic-add.svg'

import { getTabText } from './notifications.util'
import { AddConfigurationButtonProps } from './types'

export const AddConfigurationButton = ({ activeTab }: AddConfigurationButtonProps) => {
    const { searchParams } = useSearchString()
    const history = useHistory()

    const handleAddClick = () => {
        const newParams = {
            ...searchParams,
            modal: activeTab,
            configId: '0',
        }
        history.push({
            search: new URLSearchParams(newParams).toString(),
        })
    }

    return (
        <Button
            onClick={handleAddClick}
            variant={ButtonVariantType.primary}
            size={ComponentSizeType.small}
            dataTestId={`${activeTab}-add-button`}
            startIcon={<Add />}
            text={`Add ${getTabText(activeTab)}`}
        />
    )
}
