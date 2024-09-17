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

import Tippy from '@tippyjs/react'
import { Toggle } from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as FileCode } from '../../../assets/icons/ic-file-code.svg'
import { ReactComponent as ReadmeIcon } from '../../../assets/icons/ic-book-open.svg'
import { ReactComponent as CloseIcon } from '../../../assets/icons/ic-cross.svg'
import { ReactComponent as ViewVariablesIcon } from '../../../assets/icons/ic-view-variable-toggle.svg'
import { ReactComponent as CompareIcon } from '../../../assets/icons/ic-arrows-left-right.svg'
import { DeploymentConfigToolbarProps } from '../types'
import '../deploymentConfig.scss'

// TODO: Can move code into fe-common to remove code duplication
export default function DeploymentConfigToolbar({
    selectedTabIndex,
    handleTabSelection,
    noReadme,
    showReadme,
    handleReadMeClick,
    convertVariables,
    setConvertVariables,
    unableToParseYaml,
}: DeploymentConfigToolbarProps) {
    const getTabClassName = (index: number) =>
        `flex fs-12 lh-20 pb-8 dc__transparent dc__gap-4 cursor ${selectedTabIndex === index ? 'active-tab fw-6 cb-5' : 'fw-4 cn-9'}`

    const getTabIconClass = (index: number) => `icon-dim-16 dc__no-shrink ${selectedTabIndex === index ? 'scb-5' : 'scn-6'}`

    const changeTab = (e) => {
        handleTabSelection(Number(e.currentTarget.dataset.index))
    }

    const handleViewVariablesClick = () => {
        setConvertVariables(!convertVariables)
    }

    const tippyMsg = convertVariables ? 'Hide variables values' : 'Show variables values'

    return (
        <div className="config-toolbar-container flex dc__content-space bcn-0 pt-8 pl-16 pr-16 dc__border-bottom">
            {!noReadme && showReadme ? (
                <button type="button" className="dc__transparent flex left pb-8" onClick={handleReadMeClick}>
                    <CloseIcon className="icon-dim-16 mr-4 cursor" />
                    Readme
                </button>
            ) : (
                <div className="flexbox dc__gap-16 dc__align-items-center">
                    <button className={getTabClassName(1)} data-index={1} data-testid="values-tab" onClick={changeTab}>
                        <FileCode className={getTabIconClass(1)} />
                        Values
                    </button>

                    <button type="button" data-testid="compare-values-tab" onClick={changeTab} data-index={2} className={`dc__transparent flexbox dc__gap-4 ${getTabClassName(2)}`}>
                        <CompareIcon className={getTabIconClass(2)} />
                        Compare values
                    </button>
                </div>
            )}
            <div className="flexbox dc__content-space dc__align-items-center pb-8 dc__gap-14">
                {!noReadme && !showReadme && (
                    <ReadmeIcon className="icon-dim-16 scn-7 cursor" onClick={handleReadMeClick} />
                )}
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
                                disabled={unableToParseYaml}
                            />
                        </div>
                    </li>
                </Tippy>
            </div>
        </div>
    )
}
