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

import React from 'react'
import ReactGA from 'react-ga4'
import { ReactComponent as FileCode } from '../../../assets/icons/ic-file-code.svg'
import { ReactComponent as CompareIcon } from '../../../assets/icons/ic-arrows-left-right.svg'
import { ReactComponent as ReadmeIcon } from '../../../assets/icons/ic-book-open.svg'
import { ReactComponent as CloseIcon } from '../../../assets/icons/ic-cross.svg'
import { ReactComponent as Dropdown } from '../../../assets/icons/ic-chevron-down.svg'
import { ReactComponent as ViewVariablesIcon } from '../../../assets/icons/ic-view-variable-toggle.svg'
import { DeploymentConfigToolbarProps } from '../types'
import '../deploymentConfig.scss'
import { DropdownItem } from './DeploymentTemplateView.component'
import Tippy from '@tippyjs/react'
import { PopupMenu, Toggle } from '@devtron-labs/devtron-fe-common-lib'

export default function DeploymentConfigToolbar({
    selectedTabIndex,
    handleTabSelection,
    noReadme,
    showReadme,
    handleReadMeClick,
    isValues,
    setIsValues,
    convertVariables,
    setConvertVariables,
}: DeploymentConfigToolbarProps) {
    const getTabClassName = (index: number) =>
        `flex fs-12 lh-20 pb-8 cursor ${selectedTabIndex === index ? 'active-tab fw-6 cb-5' : 'fw-4 cn-9'}`

    const getTabIconClass = (index: number) => `icon-dim-16 mr-4 ${selectedTabIndex === index ? 'scb-5' : 'scn-6'}`

    const changeTab = (e) => {
        handleTabSelection(Number(e.currentTarget.dataset.index))
    }

    const handleOptionClick = (newValue) => {
        setIsValues(newValue)
        /* NOTE: switch to compare tab */
        handleTabSelection(2)
        setConvertVariables(false)
    }

    const handleViewVariablesClick = () => {
        setConvertVariables(!convertVariables)
    }

    const handleCompareManifestClicked = () => {
        ReactGA.event({
            category: 'Deployment Template',
            action: 'Compare manifest clicked',
        })
        handleOptionClick(false)
    }

    const renderDropdownContainer = () => (
        <div
            className="flex-col white-background dc__position-abs bcn-0 w-204 h-72  dc__border-radius-4-imp dc__left-0 dc__border dc__zi-20 config-toolbar-dropdown-shadow"
            style={{ left: '-75px' }}
        >
            <div className="pt-4 pb-4 pl-0 pr-0">
                <DropdownItem
                    label="Compare Values"
                    onClick={() => handleOptionClick(true)}
                    index={1}
                    isValues={isValues}
                />
                <DropdownItem
                    label="Compare generated manifest"
                    onClick={handleCompareManifestClicked}
                    index={2}
                    isValues={isValues}
                />
            </div>
        </div>
    )

    const tippyMsg = convertVariables ? 'Hide variables values' : 'Show variables values'

    const handleCompareValuesButtonClick = (e) => {
        ReactGA.event({
            category: 'Deployment Template',
            action: 'Compare values clicked'
        })
        changeTab(e)
    }

    return (
        <div className="config-toolbar-container flex dc__content-space bcn-0 pt-8 pl-16 pr-16 dc__border-bottom">
            {!noReadme && showReadme ? (
                <div className="flex left pb-8">
                    <CloseIcon className="icon-dim-16 mr-4 cursor" onClick={handleReadMeClick} />
                    Readme
                </div>
            ) : (
                <div className="flex left">
                    <ol className="flex left dc__column-gap-16 m-0 p-0 dc__list-style-none">
                        <li className={getTabClassName(1)} data-index={1} data-testid="values-tab" onClick={changeTab}>
                            <FileCode className={getTabIconClass(1)} />
                            Values
                        </li>
                        <li
                            className={`${getTabClassName(2)} dc__position-rel`}
                            data-index={2}
                            data-testid="compare-values-tab"
                            onClick={handleCompareValuesButtonClick}
                        >
                            <CompareIcon className={getTabIconClass(2)} />
                            Compare&nbsp;
                            <PopupMenu autoClose>
                                <PopupMenu.Button rootClassName="flexbox flex-align-center" isKebab>
                                    <span style={{ color: 'black' }}>
                                        &nbsp;
                                        {`${isValues ? 'Values' : 'Manifest'}`}
                                    </span>

                                    <Dropdown className="icon-dim-16 ml-4 cursor" data-testid="dropdown-icon" />
                                </PopupMenu.Button>
                                <PopupMenu.Body autoWidth>{renderDropdownContainer()}</PopupMenu.Body>
                            </PopupMenu>
                        </li>
                    </ol>
                </div>
            )}
            <div className="flexbox dc__content-space dc__align-items-center pb-8 dc__gap-14">
                {!noReadme && !showReadme && (
                    <ReadmeIcon className="icon-dim-16 scn-7 cursor" onClick={handleReadMeClick} />
                )}
                {isValues && (
                    <Tippy
                        content={tippyMsg}
                        placement="bottom-start"
                        animation="shift-away"
                        className="default-tt"
                        arrow={false}
                    >
                        <li className="flex left dc_width-max-content cursor">
                            <div className="w-40 h-20">
                                <Toggle
                                    selected={convertVariables}
                                    color="var(--B500)"
                                    onSelect={handleViewVariablesClick}
                                    Icon={ViewVariablesIcon}
                                />
                            </div>
                        </li>
                    </Tippy>
                )}
            </div>
        </div>
    )
}
