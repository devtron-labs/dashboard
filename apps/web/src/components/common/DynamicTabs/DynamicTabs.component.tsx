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

import { components, MenuProps } from 'react-select'
import { Progressing } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as DropDown } from '../../../assets/icons/ic-arrow-left.svg'
import { MoreButtonWrapperProps } from './Types'

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

export const MoreButtonWrapper = ({
    children,
    isMenuOpen,
    onClose,
    toggleMenu,
    tabPopupMenuRef,
}: MoreButtonWrapperProps) => (
    <div className="more-tabs-wrapper dc__position-rel flex">
        <button
            type="button"
            className="more-tabs-option p-0 flexbox dc__overflow-hidden flex-align-center ml-8 bcn-0 dc__border br-4"
            onClick={toggleMenu}
            ref={tabPopupMenuRef}
            aria-label="More tabs"
        >
            <DropDown
                className={`rotate icon-dim-20 p-2 pointer ${isMenuOpen ? 'fcn-9' : 'fcn-7'}`}
                style={{ ['--rotateBy' as string]: isMenuOpen ? '90deg' : '-90deg' }}
            />
        </button>
        {isMenuOpen && (
            <>
                <div className="more-tabs__menu-wrapper bcn-0 mt-12 dc__position-abs w-300 dc__top-26">{children}</div>
                <div className="more-tabs__blanket dc__position-fixed" onClick={onClose} />
            </>
        )}
    </div>
)

export const noMatchingTabs = () => 'No matching tabs'

export const timerTransition = (): JSX.Element => (
    <div className="ml-12 mr-4 flex dc__gap-8">
        <Progressing size={18} />
        <span>Syncing...</span>
    </div>
)
