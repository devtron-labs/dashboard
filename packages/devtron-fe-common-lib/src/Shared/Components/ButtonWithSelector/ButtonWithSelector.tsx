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

import { useState } from 'react'
import { ReactComponent as ICDropdown } from '../../../Assets/Icon/ic-chevron-down.svg'
import { PopupMenu } from '../../../Common'
import { ButtonWithSelectorProps } from './types'
import './buttonWithSelector.scss'
import { ButtonWithLoader } from '../ButtonWithLoader'

/**
 * Button With Selector
 * @param content Content to show in button
 * @param onClick Handler Function for button click
 * @param children Dropdown Content
 * @param className Other Classes to be applied
 *
 * @example
 * ```tsx
 * <ButtonWithSelector content='Create Job' onClick={() => {}} className=''>
 *  {dropdownOptions}
 * </ButtonWithSelector>
 * ```
 */
const ButtonWithSelector = ({
    content,
    onClick,
    children,
    className = '',
    popUpBodyClassName = '',
    showPopUp = true,
    disabled = false,
    isLoading = false,
}: ButtonWithSelectorProps) => {
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)

    return (
        <div className="flexbox bcb-5 br-4">
            <ButtonWithLoader
                isLoading={isLoading}
                rootClassName={`cta flex h-28 ${showPopUp ? 'dc__no-right-radius' : ''} dc__no-border-imp fs-12 fw-6 lh-20-imp ${className}`}
                type="button"
                onClick={onClick}
                disabled={isLoading || disabled}
            >
                {content}
            </ButtonWithLoader>
            {showPopUp && (
                <PopupMenu autoClose autoPosition onToggleCallback={setIsMenuOpen}>
                    <PopupMenu.Button
                        disabled={disabled}
                        rootClassName="flex dc__transparent p-0 w-28 bcb-5 dc__right-radius-4 dc__no-left-radius dc__no-top-border dc__no-bottom-border dc__no-right-border button-with-selector"
                    >
                        <ICDropdown
                            className="icon-dim-16 fcn-0 dc__no-shrink rotate"
                            style={{ ['--rotateBy' as any]: isMenuOpen ? '180deg' : '0deg' }}
                        />
                    </PopupMenu.Button>
                    <PopupMenu.Body rootClassName={`pt-4 pb-4 dc__border dc__overflow-hidden ${popUpBodyClassName}`}>
                        {children}
                    </PopupMenu.Body>
                </PopupMenu>
            )}
        </div>
    )
}

export default ButtonWithSelector
