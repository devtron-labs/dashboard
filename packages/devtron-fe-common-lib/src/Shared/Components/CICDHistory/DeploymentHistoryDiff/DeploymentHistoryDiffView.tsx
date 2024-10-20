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

import { useParams } from 'react-router-dom'
import { Fragment, useMemo, useState } from 'react'
import Tippy from '@tippyjs/react'
import { yamlComparatorBySortOrder } from '@Shared/Helpers'
import { MODES, Toggle, YAMLStringify } from '../../../../Common'
import { DeploymentHistoryParamsType } from './types'
import { DeploymentHistorySingleValue, DeploymentTemplateHistoryType } from '../types'
import CodeEditor from '../../../../Common/CodeEditor/CodeEditor'
import { DEPLOYMENT_HISTORY_CONFIGURATION_LIST_MAP } from '../../../constants'
import { ReactComponent as Info } from '../../../../Assets/Icon/ic-info-filled.svg'
import { ReactComponent as ViewVariablesIcon } from '../../../../Assets/Icon/ic-view-variable-toggle.svg'
import './styles.scss'

const DeploymentHistoryDiffView = ({
    currentConfiguration,
    baseTemplateConfiguration,
    previousConfigAvailable,
    isUnpublished,
    isDeleteDraft,
    rootClassName,
    comparisonBodyClassName,
    sortOrder = null,
}: DeploymentTemplateHistoryType) => {
    const { historyComponent, historyComponentName } = useParams<DeploymentHistoryParamsType>()

    const [convertVariables, setConvertVariables] = useState(false)

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

    const editorValuesRHS = useMemo(() => {
        if (!baseTemplateConfiguration?.codeEditorValue?.value || isDeleteDraft) {
            return ''
        }

        const editorValue = convertVariables
            ? baseTemplateConfiguration?.codeEditorValue?.resolvedValue
            : baseTemplateConfiguration?.codeEditorValue?.value

        return YAMLStringify(JSON.parse(editorValue), {
            sortMapEntries: (a, b) => yamlComparatorBySortOrder(a, b, sortOrder),
        })
    }, [convertVariables, baseTemplateConfiguration, sortOrder, isDeleteDraft])

    const editorValuesLHS = useMemo(() => {
        if (!currentConfiguration?.codeEditorValue?.value || isUnpublished) {
            return ''
        }

        const editorValue = convertVariables
            ? currentConfiguration?.codeEditorValue?.resolvedValue
            : currentConfiguration?.codeEditorValue?.value

        return YAMLStringify(JSON.parse(editorValue), {
            sortMapEntries: (a, b) => yamlComparatorBySortOrder(a, b, sortOrder),
        })
    }, [convertVariables, currentConfiguration, sortOrder, isUnpublished])

    const renderDeploymentDiffViaCodeEditor = () => (
        <CodeEditor
            value={editorValuesRHS}
            defaultValue={editorValuesLHS}
            adjustEditorHeightToContent
            disableSearch
            diffView={previousConfigAvailable && true}
            readOnly
            noParsing
            mode={MODES.YAML}
            theme={getTheme()}
        />
    )

    const handleShowVariablesClick = () => {
        setConvertVariables(!convertVariables)
    }

    const tippyMsg = convertVariables ? 'Hide variables values' : 'Show variables values'

    const renderDetailedValue = (
        parentClassName: string,
        singleValue: DeploymentHistorySingleValue,
        dataTestId: string,
    ) => (
        <div className={parentClassName}>
            <div className="cn-6 pt-8 pl-16 pr-16 lh-16" data-testid={dataTestId}>
                {singleValue.displayName}
            </div>
            <div className="cn-9 fs-13 pb-8 pl-16 pr-16 lh-20 mh-28">{singleValue.value}</div>
        </div>
    )

    return (
        <div className="deployment-history-diff-view">
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
                                // eslint-disable-next-line react/no-array-index-key
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
                <div className={`en-2 bw-1 br-4 mr-20 ml-20 mb-20 ${comparisonBodyClassName || ''}`}>
                    <div
                        className="code-editor-header-value pl-16 pr-16 pt-12 pb-12 fs-13 fw-6 cn-9 bcn-0 dc__top-radius-4 dc__border-bottom"
                        data-testid="configuration-link-comparison-body-heading"
                    >
                        <span>{baseTemplateConfiguration?.codeEditorValue?.displayName}</span>
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

export default DeploymentHistoryDiffView
