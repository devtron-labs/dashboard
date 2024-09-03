import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
    BaseURLParams,
    ConfigurationType,
    Progressing,
    useDeploymentTemplateContext,
} from '@devtron-labs/devtron-fe-common-lib'
import DeploymentTemplateGUIView from '@Components/deploymentConfig/DeploymentTemplateView/DeploymentTemplateGUIView'
import { toast } from 'react-toastify'
import { NO_SCOPED_VARIABLES_MESSAGE } from '@Components/deploymentConfig/constants'
import { DeploymentTemplateFormProps } from './types'
import { getResolvedDeploymentTemplate } from './service'

const DeploymentTemplateForm = ({
    editMode,
    hideLockedKeys,
    lockedConfigKeysWithLockType,
    readOnly,
    resolveScopedVariables,
    handleDisableResolveScopedVariables,
}: DeploymentTemplateFormProps) => {
    const { appId, envId } = useParams<BaseURLParams>()
    const {
        state: { editorTemplate, originalTemplate, selectedChartRefId },
        editorOnChange,
    } = useDeploymentTemplateContext()

    const [resolvedEditorTemplate, setResolvedEditorTemplate] = useState<string>('')
    const [resolvedOriginalTemplate, setResolvedOriginalTemplate] = useState<string>('')
    const [isResolvingVariables, setIsResolvingVariables] = useState<boolean>(false)

    const handleFetchResolvedData = async (value: string): Promise<string> => {
        const resolvedData = await getResolvedDeploymentTemplate({
            appId: +appId,
            chartRefId: selectedChartRefId,
            values: value,
            ...(envId && { envId: +envId }),
        })
        return resolvedData
    }

    const handleGetResolvedData = async () => {
        try {
            setIsResolvingVariables(true)
            const [resolvedEditorTemplateResponse, resolvedOriginalTemplateResponse] = await Promise.all([
                handleFetchResolvedData(editorTemplate),
                // Since compare mode is not in use, we are passing the original template as it is without defaultEnvId
                handleFetchResolvedData(originalTemplate),
            ])

            if (!resolvedEditorTemplateResponse) {
                toast.error(NO_SCOPED_VARIABLES_MESSAGE)
                handleDisableResolveScopedVariables()
                return
            }

            setResolvedEditorTemplate(resolvedEditorTemplateResponse)
            setResolvedOriginalTemplate(resolvedOriginalTemplateResponse)
        } catch {
            // Do nothing
            handleDisableResolveScopedVariables()
        } finally {
            setIsResolvingVariables(false)
        }
    }

    useEffect(() => {
        if (resolveScopedVariables) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            handleGetResolvedData()
        }
    }, [resolveScopedVariables, appId, envId, selectedChartRefId])

    if (editMode === ConfigurationType.GUI) {
        if (isResolvingVariables) {
            return (
                <div className="flex h-100 dc__overflow-scroll">
                    <Progressing pageLoader />
                </div>
            )
        }

        // TODO: Will receive from our hook
        const uneditedDocument = resolveScopedVariables ? resolvedOriginalTemplate : originalTemplate
        const editedDocument = resolveScopedVariables ? resolvedEditorTemplate : editorTemplate
        // Can remove isResolvingVariables if not needed
        const formKey = `${resolveScopedVariables ? 'resolved' : 'unresolved'}-${hideLockedKeys ? 'hide-lock' : 'show-locked'}-${isResolvingVariables ? 'loading' : 'loaded'}-deployment-template`

        return (
            <DeploymentTemplateGUIView
                uneditedDocument={uneditedDocument}
                // TODO: Will add cases of approval later
                editedDocument={editedDocument}
                value={editorTemplate}
                // TODO: Look into this later
                readOnly={readOnly}
                // TODO: Look into this later
                hideLockedKeys={hideLockedKeys}
                editorOnChange={editorOnChange}
                // TODO: Look into this later
                lockedConfigKeysWithLockType={lockedConfigKeysWithLockType}
                key={formKey}
            />
        )
    }

    return null
}

export default DeploymentTemplateForm
