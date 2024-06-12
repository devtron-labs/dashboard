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

import React, { useEffect, useState } from 'react'
import { ErrorScreenNotAuthorized, Progressing, Reload, useAsync } from '@devtron-labs/devtron-fe-common-lib'
import SavedVariablesView from './SavedVariables'
import UploadScopedVariables from './UploadScopedVariables'
import { sortVariables } from './utils'
import { getScopedVariablesJSON } from './service'
import { ScopedVariablesDataType, ScopedVariablesProps } from './types'
import './styles.scss'

export default function ScopedVariables({ isSuperAdmin }: ScopedVariablesProps) {
    const [scopedVariables, setScopedVariables] = useState<ScopedVariablesDataType>(null)
    const [schemaError, setSchemaError] = useState<boolean>(false)
    const [jsonSchema, setJsonSchema] = useState<object>(null)
    const [loadingScopedVariables, scopedVariablesData, scopedVariablesError, reloadScopedVariables] = useAsync(
        getScopedVariablesJSON,
        [],
    )

    useEffect(() => {
        try {
            if (!loadingScopedVariables && scopedVariablesData?.result) {
                const parsedSchema = JSON.parse(scopedVariablesData.result.jsonSchema)
                setJsonSchema(parsedSchema)
                if (scopedVariablesData.result.manifest) {
                    setScopedVariables(sortVariables(scopedVariablesData.result.manifest))
                }
            }
        } catch (e) {
            setSchemaError(true)
        }
    }, [scopedVariablesData, loadingScopedVariables])

    if (!isSuperAdmin) {
        return <ErrorScreenNotAuthorized />
    }
    if (loadingScopedVariables) {
        return <Progressing pageLoader />
    }
    if (schemaError || (!loadingScopedVariables && !scopedVariablesData) || scopedVariablesError) {
        return <Reload />
    }

    if (scopedVariables) {
        return (
            <SavedVariablesView
                scopedVariablesData={scopedVariables}
                reloadScopedVariables={reloadScopedVariables}
                jsonSchema={jsonSchema}
                setScopedVariables={setScopedVariables}
            />
        )
    }

    return (
        <UploadScopedVariables
            reloadScopedVariables={reloadScopedVariables}
            jsonSchema={jsonSchema}
            setScopedVariables={setScopedVariables}
        />
    )
}
