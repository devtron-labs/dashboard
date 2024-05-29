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

import React, { Fragment, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router'
import Tippy from '@tippyjs/react'
import { Toggle, YAMLStringify } from '@devtron-labs/devtron-fe-common-lib'
import CodeEditor from '../../../../CodeEditor/CodeEditor'
import { DeploymentHistorySingleValue } from '../cd.type'
import { DeploymentHistoryParamsType, DeploymentTemplateHistoryType } from './types'
import { ReactComponent as Info } from '../../../../../assets/icons/ic-info-filled.svg'
import { ReactComponent as ViewVariablesIcon } from '../../../../../assets/icons/ic-view-variable-toggle.svg'
import { DEPLOYMENT_HISTORY_CONFIGURATION_LIST_MAP, MODES } from '../../../../../config'

export default function DeploymentHistoryDiffView({
    currentConfiguration,
    baseTemplateConfiguration,
    previousConfigAvailable,
    isUnpublished,
    isDeleteDraft,
    rootClassName,
}: DeploymentTemplateHistoryType) {
    const { historyComponent, historyComponentName } = useParams<DeploymentHistoryParamsType>()
    const ref = useRef(null)
    const [codeEditorHeight, setCodeEditorHeight] = useState('')
    const { innerHeight } = window

    const [convertVariables, setConvertVariables] = useState(false)

    useEffect(() => {
        if (ref.current) {
            const dynamicHeight = ref.current?.clientHeight + 255 + (!previousConfigAvailable ? 55 : 0)
            setCodeEditorHeight(`${innerHeight - dynamicHeight < 400 ? 400 : innerHeight - dynamicHeight}px`)
        }
    }, [ref.current?.clientHeight])

    const getTheme = () => {
        if (isDeleteDraft) {
            return 'delete-draft'
        }
        if (isUnpublished) {
            return 'unpublished'
        }
        return null
    }

    // check if variable snapshot is {} or not
    const isVariablesAvailable: boolean =
        Object.keys(baseTemplateConfiguration?.codeEditorValue?.variableSnapshot || {}).length !== 0 ||
        Object.keys(currentConfiguration?.codeEditorValue?.variableSnapshot || {}).length !== 0

    const editorValuesRHS = convertVariables
        ? baseTemplateConfiguration?.codeEditorValue?.resolvedValue
        : baseTemplateConfiguration?.codeEditorValue?.value

    const editorValuesLHS = convertVariables
        ? currentConfiguration?.codeEditorValue?.resolvedValue
        : currentConfiguration?.codeEditorValue?.value

    const renderDeploymentDiffViaCodeEditor = () => {
        return (
            <CodeEditor
                value={
                    !baseTemplateConfiguration?.codeEditorValue?.value || isDeleteDraft
                        ? ''
                        : YAMLStringify(JSON.parse(editorValuesRHS))
                }
                defaultValue={
                    !currentConfiguration?.codeEditorValue?.value || isUnpublished
                        ? ''
                        : YAMLStringify(JSON.parse(editorValuesLHS))
                }
                height={codeEditorHeight}
                diffView={previousConfigAvailable && true}
                readOnly
                noParsing
                mode={MODES.YAML}
                theme={getTheme()}
            />
        )
    }

    const handleShowVariablesClick = () => {
        setConvertVariables(!convertVariables)
    }

    const tippyMsg = convertVariables ? 'Hide variables values' : 'Show variables values'

    const renderDetailedValue = (
        parentClassName: string,
        singleValue: DeploymentHistorySingleValue,
        dataTestId: string,
    ) => {
        return (
            <div className={parentClassName}>
                <div className="cn-6 pt-8 pl-16 pr-16 lh-16" data-testid={dataTestId}>
                    {singleValue.displayName}
                </div>
                <div className="cn-9 fs-13 pb-8 pl-16 pr-16 lh-20 mh-28">{singleValue.value}</div>
            </div>
        )
    }

    return (
        <div>
            {!previousConfigAvailable && (
                <div className="bcb-1 eb-2 pt-8 pb-8 br-4 flexbox pl-4 cn-9 fs-13 mt-16 mb-16 mr-20 ml-20">
                    <Info className="mr-8 ml-14 icon-dim-20" />
                    <span className="lh-20">
                        {
                            DEPLOYMENT_HISTORY_CONFIGURATION_LIST_MAP[historyComponent.replace('-', '_').toUpperCase()]
                                ?.DISPLAY_NAME
                        }
                        {historyComponentName ? ` “${historyComponentName}”` : ''} was added in this deployment. There
                        is no previous instance to compare with.
                    </span>
                </div>
            )}
            <div
                className={`en-2 bw-1 br-4 bcn-0 mt-16 mb-16 mr-20 ml-20 pt-2 pb-2 ${
                    previousConfigAvailable ? 'deployment-diff__upper' : ''
                } ${rootClassName ?? ''}`}
                ref={ref}
                data-testid={`configuration-link-${
                    previousConfigAvailable ? 'previous-deployment' : 'no-previous-deployment'
                }`}
            >
                {baseTemplateConfiguration &&
                    Object.keys({ ...currentConfiguration?.values, ...baseTemplateConfiguration.values }).map(
                        (configKey, index) => {
                            const currentValue = currentConfiguration?.values?.[configKey]
                            const baseValue = baseTemplateConfiguration.values[configKey]
                            const changeBGColor = previousConfigAvailable && currentValue?.value !== baseValue?.value
                            return (
                                <Fragment key={`deployment-history-diff-view-${index}`}>
                                    {!isUnpublished && currentValue?.value ? (
                                        renderDetailedValue(
                                            !isDeleteDraft && changeBGColor ? 'code-editor-red-diff' : '',
                                            currentValue,
                                            `configuration-deployment-template-heading-${index}`,
                                        )
                                    ) : (
                                        <div />
                                    )}
                                    {!isDeleteDraft && baseValue?.value ? (
                                        renderDetailedValue(
                                            changeBGColor ? 'code-editor-green-diff' : '',
                                            baseValue,
                                            `configuration-deployment-template-heading-${index}`,
                                        )
                                    ) : (
                                        <div className={isDeleteDraft ? 'code-editor-red-diff' : ''} />
                                    )}
                                </Fragment>
                            )
                        },
                    )}
            </div>

            {(currentConfiguration?.codeEditorValue?.value || baseTemplateConfiguration?.codeEditorValue?.value) && (
                <div className="en-2 bw-1 br-4 mr-20 ml-20 mb-20">
                    <div
                        className="code-editor-header-value pl-16 pr-16 pt-12 pb-12 fs-13 fw-6 cn-9 bcn-0 dc__top-radius-4 dc__border-bottom"
                        data-testid="configuration-link-comparison-body-heading"
                    >
                        <span>{baseTemplateConfiguration?.codeEditorValue?.['displayName']}</span>
                        {isVariablesAvailable && (
                            <Tippy content={tippyMsg} placement="bottom-start" animation="shift-away" arrow={false}>
                                <li className="flex left dc_width-max-content cursor">
                                    <div className="w-40 h-20">
                                        <Toggle
                                            selected={convertVariables}
                                            color="var(--B500)"
                                            onSelect={handleShowVariablesClick}
                                            Icon={ViewVariablesIcon}
                                        />
                                    </div>
                                </li>
                            </Tippy>
                        )}
                    </div>

                    {renderDeploymentDiffViaCodeEditor()}
                </div>
            )}
        </div>
    )
}
