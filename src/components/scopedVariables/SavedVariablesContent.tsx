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
    ActionMenu,
    ActionMenuItemType,
    ActionMenuProps,
    Button,
    ButtonStyleType,
    ButtonVariantType,
    CodeEditor,
    ComponentSizeType,
    Icon,
    MODES,
    SavedVariablesViewParamsType,
    ScopedVariablesFileViewType,
} from '@devtron-labs/devtron-fe-common-lib'

import { importComponentFromFELibrary } from '../common'
import {
    DOWNLOAD_FILE_NAME,
    DOWNLOAD_FILES_AS,
    DOWNLOAD_TEMPLATE_NAME,
    DownloadVariableType,
    DROPDOWN_ITEMS,
    SCOPED_VARIABLES_TEMPLATE_DATA,
} from './constants'
import DescriptorTab from './DescriptionTab'
import Descriptor from './Descriptor'
import { DescriptorTabProps, SavedVariablesContentProps } from './types'
import { downloadData, parseURLViewToValidView } from './utils'
import VariablesList from './VariablesList'

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

    const handleActionMenuClick: ActionMenuProps<DownloadVariableType>['onClick'] = (
        item: ActionMenuItemType<DownloadVariableType>,
    ) => {
        if (!scopedVariablesYAML) {
            return
        }
        switch (item.id) {
            case DownloadVariableType.FILE:
                downloadData(scopedVariablesYAML, DOWNLOAD_FILE_NAME, DOWNLOAD_FILES_AS)
                break
            case DownloadVariableType.TEMPLATE:
                downloadData(SCOPED_VARIABLES_TEMPLATE, DOWNLOAD_TEMPLATE_NAME, DOWNLOAD_FILES_AS)
                break
            default:
                break
        }
    }

    const renderYAMLView = () => (
        <div className="bg__tertiary flex-grow-1 dc__no-shrink p-8 flex column dc__align-start dc__content-start dc__gap-16 dc__align-self-stretch">
            <div className="flex-grow-1 dc__no-shrink dc__border dc__border-radius-4-imp flex column dc__content-space dc__align-self-stretch dc__align-start dc__overflow-auto">
                <div className="dc__position-rel dc__top-radius-4 dc__border-bottom flex pt-8 pb-8 pl-12 pr-12 bg__primary dc__gap-8 dc__content-space dc__align-items-center dc__align-self-stretch">
                    <p className="flex-grow-1 dc__no-shrink cn-9 fs-13 fw-4 lh-20 m-0">Last saved file</p>
                    <Button
                        dataTestId="edit-variables-btn"
                        ariaLabel="Edit Variable"
                        onClick={handleActivateEditView}
                        icon={<Icon name="ic-pencil" color={null} size={20} />}
                        style={ButtonStyleType.neutral}
                        variant={ButtonVariantType.borderLess}
                        size={ComponentSizeType.medium}
                    />

                    <ActionMenu<DownloadVariableType>
                        id="additional-options-action-menu"
                        onClick={handleActionMenuClick}
                        options={[
                            {
                                items: Object.entries(DROPDOWN_ITEMS).map(([id, label]) => ({
                                    id: id as DownloadVariableType,
                                    label,
                                })),
                            },
                        ]}
                        buttonProps={{
                            icon: <Icon name="ic-file-download" color={null} size={20} />,
                            ariaLabel: 'additional-options',
                            dataTestId: 'additional-options',
                            showAriaLabelInTippy: false,
                            style: ButtonStyleType.neutral,
                            variant: ButtonVariantType.borderLess,
                            size: ComponentSizeType.medium,
                        }}
                    />
                </div>

                <CodeEditor mode={MODES.YAML} readOnly noParsing value={scopedVariablesYAML} height="fitToParent" />
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
