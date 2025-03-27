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

import {
    AppSelectorNoOptionsMessage as appSelectorNoOptionsMessage,
    ComponentSizeType,
    InfoBlock,
    SelectPicker,
    SelectPickerProps,
} from '@devtron-labs/devtron-fe-common-lib'
import { appListOptions } from '@Components/AppSelector/AppSelectorUtil'
import { useState } from 'react'
import { AppToCloneSelectorProps } from './types'

const AppToCloneSelector = ({ isJobView, error, handleCloneIdChange }: AppToCloneSelectorProps) => {
    const [inputValue, setInputValue] = useState('')
    const [areOptionsLoading, setAreOptionsLoading] = useState(false)
    const [options, setOptions] = useState([])

    const onInputChange: SelectPickerProps['onInputChange'] = async (val) => {
        setInputValue(val)
        setAreOptionsLoading(true)
        const fetchedOptions = await appListOptions(val, isJobView)
        setAreOptionsLoading(false)
        setOptions(fetchedOptions)
    }

    const onChange = (selectedClonedApp) => {
        handleCloneIdChange(selectedClonedApp.value)
    }

    const noOptionsMessage: SelectPickerProps['noOptionsMessage'] = () =>
        appSelectorNoOptionsMessage({
            inputValue,
        })

    return (
        <>
            <SelectPicker
                label={`Select an ${isJobView ? 'job' : 'app'} to clone`}
                inputId={`${isJobView ? 'job' : 'app'}-name-for-clone`}
                options={options}
                onChange={onChange}
                placeholder={`Select ${isJobView ? 'job' : 'app'}`}
                inputValue={inputValue}
                onInputChange={onInputChange}
                isLoading={areOptionsLoading}
                noOptionsMessage={noOptionsMessage}
                error={error}
                size={ComponentSizeType.large}
            />
            <InfoBlock
                heading="Important:"
                description={
                    isJobView
                        ? 'Do not forget to modify git repositories and corresponding branches to be used for each Job Pipeline if required.'
                        : 'Do not forget to modify git repositories, corresponding branches and container registries to be used for each CI Pipeline if required.'
                }
            />
        </>
    )
}

export default AppToCloneSelector
