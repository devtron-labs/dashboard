import { Prompt } from 'react-router-dom'
import {
    ApiQueuingWithBatch,
    convertJSONPointerToJSONPath,
    DeleteDialog,
    showError,
    ToastManager,
    ToastVariantType,
    usePrompt,
} from '@devtron-labs/devtron-fe-common-lib'
import { useState } from 'react'
import { DEFAULT_ROUTE_PROMPT_MESSAGE } from '@Config/constants'
import {
    getManifestResource,
    updateManifestResourceHelmApps,
} from '@Components/v2/appDetails/k8Resource/nodeDetail/nodeDetail.api'
import { JSONPath } from 'jsonpath-plus'
import { applyOperation } from 'fast-json-patch'
import { RestartWorkloadModalProps } from '../Types'

const RestartWorkloadModal = ({ handleModalClose, resources = [] }: RestartWorkloadModalProps) => {
    const [apiCallInProgress, setApiCallInProgress] = useState(false)
    const resourceKind = resources[0]?.kind ?? ''

    usePrompt({
        shouldPrompt: apiCallInProgress,
    })

    const handleRestartWorkload = async () => {
        try {
            setApiCallInProgress(true)

            const calls = resources.map((resource) => async () => {
                const {
                    result: {
                        manifestResponse: { manifest },
                    },
                } = await getManifestResource(null, '', '', true, resource)

                if (!manifest) {
                    return
                }

                let finalManifest = {}

                // TODO: check if metadata needs to be checked?
                const annotationsPath = '/spec/template/metadata/annotations'
                const annotationLabel = 'devtron-restart'

                const x = JSONPath({
                    json: manifest,
                    path: convertJSONPointerToJSONPath(annotationsPath),
                    wrap: false,
                    resultType: 'value',
                })

                if (!x) {
                    finalManifest = applyOperation(manifest, {
                        op: 'add',
                        path: annotationsPath,
                        value: { [annotationLabel]: new Date().toISOString() },
                    }).newDocument
                } else {
                    finalManifest = applyOperation(manifest, {
                        op: 'add',
                        path: `${annotationsPath}/${annotationLabel}t`,
                        value: new Date().toISOString(),
                    }).newDocument
                }

                await updateManifestResourceHelmApps(null, '', '', JSON.stringify(finalManifest), true, resource)
            })

            await ApiQueuingWithBatch(calls, true)

            ToastManager.showToast({
                variant: ToastVariantType.success,
                description: 'Workload restarted successfully',
            })

            handleModalClose()
        } catch (err) {
            showError(err)
        } finally {
            setApiCallInProgress(false)
        }
    }

    return (
        <>
            <Prompt when={apiCallInProgress} message={DEFAULT_ROUTE_PROMPT_MESSAGE} />
            <DeleteDialog
                title={
                    resources.length > 1
                        ? `Restart ${resources.length} ${resourceKind}(s)?`
                        : `Restart ${resourceKind} "${resources[0]?.name}"`
                }
                delete={handleRestartWorkload}
                closeDelete={handleModalClose}
                apiCallInProgress={apiCallInProgress}
            >
                <DeleteDialog.Description>
                    {/* TODO: maybe make a constant or reuse one */}
                    <p className="mb-12">Are you sure you want to restart the selected workload(s)</p>
                </DeleteDialog.Description>
            </DeleteDialog>
        </>
    )
}

export default RestartWorkloadModal
