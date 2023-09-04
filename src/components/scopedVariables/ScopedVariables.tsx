import React, { useEffect, useState } from 'react'
import { ErrorScreenNotAuthorized, Progressing, Reload } from '@devtron-labs/devtron-fe-common-lib'
import SavedVariablesView from './SavedVariables'
import UploadScopedVariables from './UploadScopedVariables'
import { sortVariables } from './utils'
import { getScopedVariablesJSON } from './service'
import { useAsync } from '../common'
import { ScopedVariablesDataInterface, ScopedVariablesInterface } from './types'
import './styles.scss'

export default function ScopedVariables({ isSuperAdmin }: ScopedVariablesInterface) {
    const [scopedVariables, setScopedVariables] = useState<ScopedVariablesDataInterface>(null)
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
                if (scopedVariablesData.result.manifest)
                    setScopedVariables(sortVariables(scopedVariablesData.result.manifest))
            }
        } catch (e) {
            setSchemaError(true)
        }
    }, [scopedVariablesData, loadingScopedVariables])

    if (!isSuperAdmin) return <ErrorScreenNotAuthorized />
    if (loadingScopedVariables) return <Progressing pageLoader />
    if (schemaError || (!loadingScopedVariables && !scopedVariablesData) || scopedVariablesError) return <Reload />

    if (scopedVariables)
        return (
            <SavedVariablesView
                scopedVariablesData={scopedVariables}
                reloadScopedVariables={reloadScopedVariables}
                jsonSchema={jsonSchema}
                setScopedVariables={setScopedVariables}
            />
        )

    return (
        <UploadScopedVariables
            reloadScopedVariables={reloadScopedVariables}
            jsonSchema={jsonSchema}
            setScopedVariables={setScopedVariables}
        />
    )
}
