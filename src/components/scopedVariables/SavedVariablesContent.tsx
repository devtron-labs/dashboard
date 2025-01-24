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

import { useEffect } from 'react'
import { generatePath, useHistory, useParams, useRouteMatch } from 'react-router-dom'
import {
    CodeEditor,
    PopupMenu,
    ScopedVariablesFileViewType,
    SavedVariablesViewParamsType,
    MODES,
} from '@devtron-labs/devtron-fe-common-lib'
import Tippy from '@tippyjs/react'
import Descriptor from './Descriptor'
import VariablesList from './VariablesList'
import DescriptorTab from './DescriptionTab'
import {
    DOWNLOAD_FILE_NAME,
    DOWNLOAD_FILES_AS,
    DOWNLOAD_TEMPLATE_NAME,
    DROPDOWN_ITEMS,
    SCOPED_VARIABLES_TEMPLATE_DATA,
} from './constants'
import { downloadData, parseURLViewToValidView } from './utils'
import { DescriptorTabProps, SavedVariablesContentProps, YAMLEditorDropdownItemProps } from './types'
import { importComponentFromFELibrary } from '../common'
import { ReactComponent as ICPencil } from '../../assets/icons/ic-pencil.svg'
import { ReactComponent as ICFileDownload } from '../../assets/icons/ic-file-download.svg'

const SCOPED_VARIABLES_TEMPLATE = importComponentFromFELibrary(
    'SCOPED_VARIABLES_TEMPLATE_DATA',
    SCOPED_VARIABLES_TEMPLATE_DATA,
    'function',
)

const ScopedVariablesEnvironmentListContainer = importComponentFromFELibrary(
    'ScopedVariablesEnvironmentListContainer',
    null,
    'function',
)

const YAMLEditorDropdownItem = ({ item, scopedVariablesYAML }: YAMLEditorDropdownItemProps) => {
    const handleDownloadFileClick = () => {
        if (!scopedVariablesYAML) {
            return
        }
        switch (item) {
            case DROPDOWN_ITEMS[0]:
                downloadData(scopedVariablesYAML, DOWNLOAD_FILE_NAME, DOWNLOAD_FILES_AS)
                break
            case DROPDOWN_ITEMS[1]:
                downloadData(SCOPED_VARIABLES_TEMPLATE, DOWNLOAD_TEMPLATE_NAME, DOWNLOAD_FILES_AS)
                break
            default:
                break
        }
    }

    return (
        <button
            key={item}
            className="scoped-variables-editor-infobar__dropdown-item bg__primary p-8 flex center dc__align-self-stretch dc__gap-12 dc__content-start cursor cn-9 fs-13 lh-20 fw-4 dc__hover-n50 dc__outline-none-imp dc__no-border"
            onClick={handleDownloadFileClick}
            type="button"
        >
            {item}
        </button>
    )
}

const SavedVariablesContent = ({
    searchKey,
    onSearch,
    readFile,
    handleActivateEditView,
    scopedVariablesYAML,
    variablesList,
    handleClearFilters,
}: SavedVariablesContentProps) => {
    const history = useHistory()
    const { path } = useRouteMatch()
    const { currentView: currentViewFromURL, ...params } = useParams<SavedVariablesViewParamsType>()
    const isEnvironmentListEnabled =
        window._env_.FEATURE_SCOPED_VARIABLE_ENVIRONMENT_LIST_ENABLE && !!ScopedVariablesEnvironmentListContainer
    const currentView = parseURLViewToValidView(currentViewFromURL, isEnvironmentListEnabled)

    useEffect(() => {
        if (currentView !== currentViewFromURL) {
            history.replace(generatePath(path, { ...params, currentView }))
        }
    }, [currentViewFromURL, isEnvironmentListEnabled])

    const handleCurrentViewUpdate: DescriptorTabProps['handleCurrentViewUpdate'] = (view) => {
        history.push(generatePath(path, { ...params, currentView: view }))
    }

    const renderYAMLView = () => (
        <div className="bg__tertiary flex-grow-1 dc__no-shrink p-8 flex column dc__align-start dc__content-start dc__gap-16 dc__align-self-stretch">
            <div className="flex-grow-1 dc__no-shrink dc__border dc__border-radius-4-imp flex column dc__content-space dc__align-self-stretch dc__align-start">
                <div className="dc__position-rel dc__top-radius-4 dc__border-bottom flex pt-8 pb-8 pl-12 pr-12 bg__primary dc__gap-16 dc__content-space dc__align-items-center dc__align-self-stretch">
                    <p className="flex-grow-1 dc__no-shrink cn-9 fs-13 fw-4 lh-20 m-0">Last saved file</p>
                    <Tippy className="default-tt" arrow placement="top" content="Edit">
                        <button
                            className="h-20 p-0 dc__no-background dc__no-border dc__outline-none-imp"
                            type="button"
                            onClick={handleActivateEditView}
                            data-testid="edit-variables-btn"
                            aria-label="Edit Variable"
                        >
                            <ICPencil className="icon-dim-20" />
                        </button>
                    </Tippy>

                    <PopupMenu autoClose>
                        <PopupMenu.Button
                            isKebab
                            rootClassName="h-20 p-0 dc__no-background dc__no-border dc__outline-none-imp"
                            dataTestId="dropdown-btn"
                        >
                            <Tippy className="default-tt" arrow placement="top" content="Download file/template">
                                <div>
                                    <ICFileDownload className="icon-dim-20" />
                                </div>
                            </Tippy>
                        </PopupMenu.Button>

                        <PopupMenu.Body rootClassName="scoped-variables-editor-infobar__dropdown pt-4 pb-4 pl-0 pr-0 bg__primary flex column dc__content-start dc__align-start dc__position-abs bg__primary dc__border dc__border-radius-4-imp">
                            {DROPDOWN_ITEMS.map((item) => (
                                <YAMLEditorDropdownItem
                                    key={item}
                                    item={item}
                                    scopedVariablesYAML={scopedVariablesYAML}
                                />
                            ))}
                        </PopupMenu.Body>
                    </PopupMenu>
                </div>

                <CodeEditor value={scopedVariablesYAML} mode={MODES.YAML} height="fitToParent" readOnly noParsing />
            </div>
        </div>
    )

    const renderView = () => {
        switch (currentView) {
            case ScopedVariablesFileViewType.SAVED:
                return <VariablesList variablesList={variablesList} handleClearFilters={handleClearFilters} />
            case ScopedVariablesFileViewType.ENVIRONMENT_LIST: {
                if (!isEnvironmentListEnabled) {
                    return renderYAMLView()
                }

                return <ScopedVariablesEnvironmentListContainer />
            }
            default:
                return renderYAMLView()
        }
    }

    return (
        <>
            <Descriptor
                showUploadButton
                searchKey={searchKey}
                onSearch={currentView === ScopedVariablesFileViewType.SAVED ? onSearch : null}
                readFile={readFile}
            >
                <div className="dc__border-bottom bg__primary pt-0 pb-0 pl-20 pr-20 flexbox dc__align-self-stretch dc__align-items-center">
                    {Object.values(ScopedVariablesFileViewType).map((view) => {
                        if (view === ScopedVariablesFileViewType.ENVIRONMENT_LIST && !isEnvironmentListEnabled) {
                            return null
                        }

                        return (
                            <DescriptorTab
                                key={view}
                                currentView={currentView}
                                targetView={view}
                                handleCurrentViewUpdate={handleCurrentViewUpdate}
                            />
                        )
                    })}
                </div>
            </Descriptor>

            {renderView()}
        </>
    )
}

export default SavedVariablesContent
