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
import { TabGroup, Toggle } from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as FileCode } from '@Icons/ic-file-code.svg'
import { ReactComponent as ReadmeIcon } from '@Icons/ic-book-open.svg'
import { ReactComponent as CloseIcon } from '@Icons/ic-cross.svg'
import { ReactComponent as ViewVariablesIcon } from '@Icons/ic-view-variable-toggle.svg'
import { ReactComponent as CompareIcon } from '@Icons/ic-arrows-left-right.svg'
import { DeploymentConfigToolbarProps } from './types'

const DeploymentConfigToolbar = ({
    selectedTabIndex,
    handleTabSelection,
    noReadme,
    showReadme,
    handleReadMeClick,
    convertVariables,
    setConvertVariables,
    unableToParseYaml,
}: DeploymentConfigToolbarProps) => {
    const changeTab = (e) => {
        handleTabSelection(Number(e.currentTarget.dataset.index))
    }

    const handleViewVariablesClick = () => {
        setConvertVariables(!convertVariables)
    }

    const tippyMsg = convertVariables ? 'Hide variables values' : 'Show variables values'

    return (
        <div className="flex dc__content-space bcn-0 pl-16 pr-16 dc__border-bottom">
            {!noReadme && showReadme ? (
                <button type="button" className="dc__transparent flex left pb-8" onClick={handleReadMeClick}>
                    <CloseIcon className="icon-dim-16 mr-4 cursor" />
                    Readme
                </button>
            ) : (
                <div className="flexbox dc__gap-16 dc__align-items-center">
                    <TabGroup
                        tabs={[
                            {
                                id: 'edit-dt-values',
                                label: 'Values',
                                icon: FileCode,
                                tabType: 'button',
                                active: selectedTabIndex === 1,
                                iconType: 'stroke',
                                props: {
                                    onClick: changeTab,
                                    'data-index': 1,
                                    'data-testid': 'values-tab',
                                },
                            },
                            {
                                id: 'compare-dt-values',
                                label: 'Compare values',
                                icon: CompareIcon,
                                tabType: 'button',
                                active: selectedTabIndex === 2,
                                iconType: 'stroke',
                                props: {
                                    onClick: changeTab,
                                    'data-index': 2,
                                    'data-testid': 'compare-values-tab',
                                },
                            },
                        ]}
                        alignActiveBorderWithContainer
                    />
                </div>
            )}
            <div className="flexbox dc__content-space dc__align-items-center dc__gap-14">
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

export default DeploymentConfigToolbar
