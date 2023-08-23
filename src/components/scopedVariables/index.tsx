import React, { useEffect, useState } from 'react'
import { ErrorScreenNotAuthorized, Progressing, Reload } from '@devtron-labs/devtron-fe-common-lib'
import SavedVariablesView from './SavedVariables'
import UploadScopedVariables from './UploadScopedVariables'
import { getScopedVariablesJSON } from './utils/helpers'
import { useAsync } from '../common'
import { ScopedVariablesI } from './types'
import './styles.scss'

const ScopedVariables = ({ isSuperAdmin }: ScopedVariablesI) => {
    const [scopedVariables, setScopedVariables] = useState(null)
    const [loadingScopedVariables, scopedVariablesData, scopedVariablesError] = useAsync(getScopedVariablesJSON, [])

    useEffect(() => {
        if (scopedVariablesData?.result) {
            setScopedVariables(scopedVariablesData.result)
        }
    }, [scopedVariablesData, loadingScopedVariables])

    if (!isSuperAdmin) return <ErrorScreenNotAuthorized />
    if (loadingScopedVariables) return <Progressing pageLoader />
    if ((!loadingScopedVariables && !scopedVariablesData) || scopedVariablesError) return <Reload />

    if (scopedVariables)
        return <SavedVariablesView scopedVariablesData={scopedVariables} setScopedVariables={setScopedVariables} />

    return <UploadScopedVariables setScopedVariables={setScopedVariables} />
}

export default ScopedVariables
