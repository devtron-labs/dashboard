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
import {
    abortPreviousRequests,
    APIResponseHandler,
    BaseURLParams,
    CodeEditor,
    DryRunEditorMode,
    ErrorScreenManager,
    getDeploymentManifest,
    getIsRequestAborted,
    MODES,
    useAsync,
    ToggleResolveScopedVariables,
} from '@devtron-labs/devtron-fe-common-lib'
import { importComponentFromFELibrary } from '@Components/common'
import { ReactComponent as ICFilePlay } from '@Icons/ic-file-play.svg'
// FIXME: Placeholder icon since no sense of git merge icon as of now
import { ReactComponent as ICFileCode } from '@Icons/ic-file-code.svg'
import SelectMergeStrategy from './SelectMergeStrategy'
import NoPublishedVersionEmptyState from './NoPublishedVersionEmptyState'
import { ConfigDryRunProps } from './types'

const DryRunEditorModeSelect = importComponentFromFELibrary('DryRunEditorModeSelect', null, 'function')

const ConfigDryRun = ({
    isLoading,
    handleToggleResolveScopedVariables,
    resolveScopedVariables,
    showManifest,
    editorTemplate,
    chartRefId,
    editorSchema,
    selectedChartVersion,
    dryRunEditorMode,
    handleChangeDryRunEditorMode,
    isDraftPresent,
    isPublishedConfigPresent,
    isApprovalPending,
    errorInfo,
    handleErrorReload,
    manifestAbortController,
    mergeStrategy,
    isOverridden,
}: ConfigDryRunProps) => {
    const { envId, appId } = useParams<BaseURLParams>()

    const getDeploymentManifestWrapper = async () =>
        abortPreviousRequests(
            () =>
                getDeploymentManifest(
                    {
                        appId: +appId,
                        envId: envId ? +envId : null,
                        chartRefId,
                        values: editorTemplate,
                    },
                    manifestAbortController.current.signal,
                ),
            manifestAbortController,
        )

    const [isManifestLoading, manifestResponse, manifestError, reloadManifest] = useAsync(
        getDeploymentManifestWrapper,
        [appId, envId, chartRefId, editorTemplate, showManifest, isLoading],
        !!showManifest && !isLoading && !!editorTemplate && !errorInfo,
    )

    const isManifestLoadingOrAborted = isManifestLoading || !!getIsRequestAborted(manifestError)

    const renderEditorBody = () => {
        if (errorInfo) {
            return <ErrorScreenManager code={errorInfo.code} reload={handleErrorReload} />
        }

        if (isDraftPresent && dryRunEditorMode === DryRunEditorMode.PUBLISHED_VALUES && !isPublishedConfigPresent) {
            return <NoPublishedVersionEmptyState />
        }

        return (
            <CodeEditor
                readOnly
                mode={MODES.YAML}
                noParsing
                loading={isLoading}
                codeEditorProps={{
                    value: editorTemplate,
                    height: '100%',
                    ...(editorSchema && { validatorSchema: editorSchema }),
                    ...(selectedChartVersion && { chartVersion: selectedChartVersion?.replace(/\./g, '-') }),
                }}
                codeMirrorProps={{
                    value: editorTemplate,
                    height: 'fitToParent',
                    ...(editorSchema && { validatorSchema: editorSchema }),
                    ...(selectedChartVersion && { chartVersion: selectedChartVersion?.replace(/\./g, '-') }),
                }}
            />
        )
    }

    return (
        <div className={`dc__overflow-auto ${showManifest ? 'dc__grid-half h-100' : 'flexbox-col w-100 h-100'}`}>
            <div className="flexbox-col">
                <div className="py-6 px-12 flexbox dc__content-space dc__border-bottom-n1">
                    <div className="flexbox dc__gap-8 dc__align-items-center">
                        <ICFileCode className="dc__no-shrink scn-9 icon-dim-16" />
                        {DryRunEditorModeSelect && isApprovalPending ? (
                            <DryRunEditorModeSelect
                                selectedOptionValue={dryRunEditorMode}
                                handleChangeDryRunEditorMode={handleChangeDryRunEditorMode}
                            />
                        ) : (
                            <span className="cn-9 fs-12 fw-6 lh-20">Values</span>
                        )}
                    </div>

                    <div className="flexbox dc__gap-8">
                        {isOverridden && mergeStrategy && (
                            <SelectMergeStrategy mergeStrategy={mergeStrategy} variant="text" />
                        )}

                        <ToggleResolveScopedVariables
                            handleToggleScopedVariablesView={handleToggleResolveScopedVariables}
                            resolveScopedVariables={resolveScopedVariables}
                            isDisabled={!!errorInfo}
                        />
                    </div>
                </div>

                {renderEditorBody()}
            </div>

            {showManifest && (
                <div className="flexbox-col dc__border-left">
                    <div className="py-6 px-12 flexbox dc__gap-8 dc__border-bottom-n1 dc__align-items-center">
                        <ICFilePlay className="icon-dim-16 dc__no-shrink scn-9" />
                        <span className="cn-9 fs-12 fw-6 lh-20">Manifest generated from merged</span>
                    </div>

                    <APIResponseHandler
                        isLoading={isManifestLoadingOrAborted}
                        error={manifestError}
                        genericSectionErrorProps={{
                            reload: reloadManifest,
                            rootClassName: 'flex-grow-1',
                        }}
                    >
                        <CodeEditor
                            mode={MODES.YAML}
                            readOnly
                            noParsing
                            codeEditorProps={{
                                value: manifestResponse?.result?.data || '',
                                height: '100%',
                            }}
                            codeMirrorProps={{
                                value: manifestResponse?.result?.data || '',
                                height: 'fitToParent',
                            }}
                        />
                    </APIResponseHandler>
                </div>
            )}
        </div>
    )
}

export default ConfigDryRun
