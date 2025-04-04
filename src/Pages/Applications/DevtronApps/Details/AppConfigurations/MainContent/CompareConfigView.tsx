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

import { importComponentFromFELibrary } from '@Components/common'
import { ReactComponent as ICFileEdit } from '@Icons/ic-file-edit.svg'
import { DeploymentHistoryDiffView, ErrorScreenManager } from '@devtron-labs/devtron-fe-common-lib'
import { CompareConfigViewProps } from './types'
import { getCompareViewHistoryDiffConfigProps } from './utils'

const CompareFromApprovalSelector = importComponentFromFELibrary('CompareFromApprovalSelector', null, 'function')

const CompareConfigView = ({
    compareFromSelectedOptionValue,
    handleCompareFromOptionSelection,
    isApprovalView,
    currentEditorConfig,
    currentEditorTemplate,
    publishedEditorConfig,
    publishedEditorTemplate,
    selectedChartVersion,
    draftChartVersion,
    isDeleteOverrideView,
    editorKey = `${compareFromSelectedOptionValue || 'compare'}-draft-editor-key`,
    className = '',
    errorInfo,
    handleErrorReload,
    displayName,
}: CompareConfigViewProps) => (
    <div className={`flexbox-col ${className ?? ''}`}>
        <div className="dc__grid-half bg__primary dc__position-sticky dc__top-0 dc__zi-10">
            <div className="dc__border-right px-12 py-6 dc__border-bottom">
                <span className="cn-9 fs-12 fw-6 lh-20">Comparing with Published</span>
            </div>

            <div className="px-12 py-6 dc__gap-8 dc__border-bottom flexbox dc__align-items-center">
                {CompareFromApprovalSelector && isApprovalView ? (
                    <CompareFromApprovalSelector
                        selectedOptionValue={compareFromSelectedOptionValue}
                        handleCompareFromOptionSelection={handleCompareFromOptionSelection}
                        draftChartVersion={draftChartVersion || ''}
                        currentEditorChartVersion={selectedChartVersion || ''}
                        isDeleteOverrideView={isDeleteOverrideView}
                    />
                ) : (
                    <>
                        <ICFileEdit className="scn-9 icon-dim-16 dc__no-shrink" />
                        <span className="cn-9 fs-12 fw-6 lh-20">Unsaved draft</span>
                    </>
                )}
            </div>
        </div>

        {errorInfo ? (
            <div className="flex flex-grow-1">
                <ErrorScreenManager code={errorInfo.code} reload={handleErrorReload} />
            </div>
        ) : (
            <div className="p-16">
                <DeploymentHistoryDiffView
                    key={editorKey}
                    currentConfiguration={getCompareViewHistoryDiffConfigProps(
                        publishedEditorTemplate,
                        publishedEditorConfig,
                        displayName,
                    )}
                    baseTemplateConfiguration={getCompareViewHistoryDiffConfigProps(
                        currentEditorTemplate,
                        currentEditorConfig,
                        displayName,
                    )}
                    previousConfigAvailable
                />
            </div>
        )}
    </div>
)

export default CompareConfigView
