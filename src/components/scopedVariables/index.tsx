import React, { useEffect, useState } from 'react'
import { ErrorScreenNotAuthorized, Progressing, Reload } from '@devtron-labs/devtron-fe-common-lib'
import SavedVariablesView from './SavedVariables'
import UploadScopedVariables from './UploadScopedVariables'
import { getScopedVariablesJSON } from './utils/helpers'
import { useAsync } from '../common'
import { ScopedVariablesI } from './types'
import './styles.scss'

const ScopedVariables = ({ isSuperAdmin }: ScopedVariablesI) => {
    const [scopedVariables, setScopedVariables] = useState<object>(null)
    const [schemaError, setSchemaError] = useState<boolean>(false)
    const [jsonSchema, setJsonSchema] = useState<object>(null)
    const [loadingScopedVariables, scopedVariablesData, scopedVariablesError, reloadScopedVariables] = useAsync(
        getScopedVariablesJSON,
        [],
    )

    useEffect(() => {
        try {
            if (scopedVariablesData?.result) {
                const parsedSchema = JSON.parse(scopedVariablesData.result.jsonSchema)
                setJsonSchema(parsedSchema)
                setScopedVariables(scopedVariablesData.result.payload)
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

export default ScopedVariables
