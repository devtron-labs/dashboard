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

import { components, MenuProps, ValueContainerProps, ClearIndicatorProps, ControlProps } from 'react-select'
import { ReactComponent as SearchIcon } from '@Icons/ic-search.svg'
import { ReactComponent as ICCross } from '@Icons/ic-cross.svg'
import {
    Button,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    Progressing,
    stopPropagation,
} from '@devtron-labs/devtron-fe-common-lib'
import { cloneElement } from 'react'

export const TabsMenu = (props: MenuProps<unknown>) => {
    const { options, children } = props

    return (
        <components.Menu {...props}>
            <div className="tab-search-select__open-tabs fs-12 fw-6 dc__no-text-transform cn-9 m-0 pt-4 pb-4 pr-10 pl-10">
                Open tabs ({options.length})
            </div>
            {children}
        </components.Menu>
    )
}

export const noMatchingTabs = () => 'No matching tabs'

export const timerTransition = (): JSX.Element => (
    <div className="flex dc__gap-8">
        <Progressing size={18} />
        <span>Syncing...</span>
    </div>
)

export const SearchValueContainer = (props: ValueContainerProps) => {
    const { selectProps, children } = props

    return (
        <components.ValueContainer {...props}>
            <div className="flex left dc__position-abs w-100 pl-12">
                <span className="flex icon-dim-20">
                    <SearchIcon className="kind-search-icon icon-dim-16" />
                </span>
                {!selectProps.inputValue && (
                    <span className="cn-5 dc__ellipsis-right ml-8">{selectProps.placeholder}</span>
                )}
            </div>
            {cloneElement(children[1])}
        </components.ValueContainer>
    )
}

export const SearchClearIndicator = (props: ClearIndicatorProps) => {
    const {
        selectProps: { onBlur },
    } = props

    const handleButtonClick = () => {
        onBlur(null)
    }

    return (
        <components.ClearIndicator {...props}>
            <Button
                icon={<ICCross />}
                onClick={handleButtonClick}
                dataTestId="clear-dynamic-tabs-menu-search"
                size={ComponentSizeType.xs}
                variant={ButtonVariantType.borderLess}
                showAriaLabelInTippy={false}
                ariaLabel=""
                style={ButtonStyleType.negativeGrey}
            />
        </components.ClearIndicator>
    )
}

export const SearchControl = (props: ControlProps) => {
    const { children } = props

    return (
        <components.Control {...props}>
            <div className="w-100 flexbox" onClick={stopPropagation}>
                {children}
            </div>
        </components.Control>
    )
}
