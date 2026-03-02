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

import { useState, useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { BASE_ROUTES, useStateFilters } from '@devtron-labs/devtron-fe-common-lib'
import ScopedVariablesLoader from './ScopedVariablesLoader'
import ScopedVariablesEditor from './ScopedVariablesEditor'
import SavedVariablesContent from './SavedVariablesContent'
import Descriptor from './Descriptor'
import { importComponentFromFELibrary, useFileReader } from '../common'
import { FileReaderStatus } from '../common/hooks/types'
import { parseIntoYAMLString } from './utils'
import { SavedVariablesViewProps, VariableType } from './types'

const ScopedVariablesEnvironmentDetailsForm = importComponentFromFELibrary(
    'ScopedVariablesEnvironmentDetailsForm',
    null,
    'function',
)

export default function SavedVariablesView({
    scopedVariablesData,
    jsonSchema,
    reloadScopedVariables,
    setScopedVariables,
}: SavedVariablesViewProps) {
    const { searchKey, handleSearch, clearFilters } = useStateFilters()
    const [variablesList, setVariablesList] = useState<VariableType[]>([])
    const [showEditView, setShowEditView] = useState<boolean>(false)
    // No need to make it a state since editor here is read only and we don't need to update it
    const scopedVariablesYAML = parseIntoYAMLString(scopedVariablesData)

    const { status, progress, fileData, abortRead, readFile } = useFileReader()

    useEffect(() => {
        if (status?.status == null && scopedVariablesData?.spec?.length) {
            const variables = scopedVariablesData.spec.map((variable) => ({
                name: variable.name,
                description: variable.shortDescription,
                isSensitive: variable.isSensitive,
            }))
            setVariablesList([...variables])
        }
    }, [scopedVariablesData])

    const handleActivateEditView = () => setShowEditView(true)

    useEffect(() => {
        const filteredVariables = scopedVariablesData?.spec?.filter(
            (variable) =>
                variable.name.toLowerCase().includes(searchKey.toLowerCase()) ||
                variable.shortDescription?.toLowerCase().includes(searchKey.toLowerCase()),
        )

        const variables = filteredVariables?.map((variable) => ({
            name: variable.name,
            description: variable.shortDescription,
            isSensitive: variable.isSensitive,
        }))

        setVariablesList(variables)
    }, [searchKey])

    if (showEditView) {
        return (
            <ScopedVariablesEditor
                variablesData={scopedVariablesYAML}
                name={fileData?.name}
                abortRead={null}
                reloadScopedVariables={reloadScopedVariables}
                jsonSchema={jsonSchema}
                setShowEditView={setShowEditView}
                setScopedVariables={setScopedVariables}
            />
        )
    }

    if (status?.status === FileReaderStatus.SUCCESS) {
        return (
            <ScopedVariablesEditor
                variablesData={status?.message?.data}
                name={fileData?.name}
                abortRead={abortRead}
                reloadScopedVariables={reloadScopedVariables}
                jsonSchema={jsonSchema}
                setScopedVariables={setScopedVariables}
            />
        )
    }

    return status?.status == null ? (
        <div
            className="flex column h-100 dc__content-space bg__primary saved-variables__default-view"
            style={{
                overflowY: 'hidden',
            }}
        >
            <Routes>
                <Route
                    path={BASE_ROUTES.APPLICATION_MANAGEMENT.CONFIGURATIONS.SCOPED_VARIABLES.CURRENT_VIEW}
                    element={
                        <SavedVariablesContent
                            searchKey={searchKey}
                            onSearch={handleSearch}
                            readFile={readFile}
                            handleActivateEditView={handleActivateEditView}
                            scopedVariablesYAML={scopedVariablesYAML}
                            variablesList={variablesList}
                            handleClearFilters={clearFilters}
                        />
                    }
                />

                {ScopedVariablesEnvironmentDetailsForm &&
                    window._env_.FEATURE_SCOPED_VARIABLE_ENVIRONMENT_LIST_ENABLE && (
                        <Route
                            path={BASE_ROUTES.APPLICATION_MANAGEMENT.CONFIGURATIONS.SCOPED_VARIABLES.ENVIRONMENT_DETAILS}
                            element={
                                <ScopedVariablesEnvironmentDetailsForm reloadScopedVariables={reloadScopedVariables} />
                            }
                        />
                    )}

                <Route path="*" element={<Navigate to="" />} />
            </Routes>
        </div>
    ) : (
        <div className="flex column h-100 dc__content-space">
            <Descriptor />
            <div className="flex center flex-grow-1">
                <div className="flex column center dc__gap-20 w-320 dc__no-shrink">
                    <div className="flex column center dc__gap-8 bg__secondary dc__align-self-stretch dc__border-dashed w-320 h-128 br-4">
                        <ScopedVariablesLoader
                            status={status}
                            progress={progress}
                            fileData={fileData}
                            abortRead={abortRead}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
