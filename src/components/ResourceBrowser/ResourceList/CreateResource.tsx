import React, { useState } from 'react'
import { APP_STATUS_HEADERS, MODES } from '../../../config'
import { ReactComponent as CloseIcon } from '../../../assets/icons/ic-cross.svg'
import { ReactComponent as InfoIcon } from '../../../assets/icons/info-filled.svg'
import { ReactComponent as Success } from '../../../assets/icons/ic-success.svg'
import { ReactComponent as Error } from '../../../assets/icons/ic-error-exclamation.svg'
import { ReactComponent as Edit } from '../../../assets/icons/ic-pencil.svg'
import { Drawer, Progressing, showError } from '../../common'
import InfoColourBar from '../../common/infocolourBar/InfoColourbar'
import CodeEditor from '../../CodeEditor/CodeEditor'
import '../ResourceBrowser.scss'
import { CreateResourceStatus, ResourceListPayloadType, ResourceType } from '../Types'
import { createNewResource } from '../ResourceBrowser.service'

export function CreateResource({ closePopup, clusterId, selectedGVK }) {
    const [showCodeEditorView, toggleCodeEditorView] = useState(true)
    const [loader, setLoader] = useState(false)
    const [resourceYAML, setResourceYAML] = useState('')
    const [resourceResponse, setResourceResponse] = useState<ResourceType[]>(null)

    const onClose = (): void => {
        !loader && closePopup()
    }

    const handleEditorValueChange = (codeEditorData: string): void => {
        setResourceYAML(codeEditorData)
    }

    const showCodeEditor = (): void => {
        toggleCodeEditorView(true)
    }

    const onSave = async (): Promise<void> => {
        try {
            setLoader(true)
            const resourceListPayload: ResourceListPayloadType = {
                clusterId: Number(clusterId),
                k8sRequest: {
                    resourceIdentifier: {
                        groupVersionKind: selectedGVK,
                    },
                    patch: resourceYAML,
                },
            }
            const { result } = await createNewResource(resourceListPayload)
            setResourceResponse(result)
            toggleCodeEditorView(false)
            //closePopup(true)
        } catch (err) {
            showError(err)
        } finally {
            setLoader(false)
        }
    }

    const renderFooter = (): JSX.Element => {
        if (showCodeEditorView) {
            return (
                <div className="dc__border-top flex right p-16">
                    <button className="cta cancel h-36 lh-36 mr-12" type="button" disabled={loader} onClick={onClose}>
                        Cancel
                    </button>
                    <button className="cta h-36 lh-36" disabled={loader} onClick={onSave}>
                        {loader ? <Progressing /> : 'Save'}
                    </button>
                </div>
            )
        } else {
            return (
                <div className="dc__border-top flexbox dc__content-space right p-16">
                    <button className="flex cta h-36 lh-36" onClick={showCodeEditor}>
                        <Edit className="icon-dim-16 mr-5" />
                        Edit YAML
                    </button>
                    <button className="cta cancel h-36 lh-36 mr-12" type="button" onClick={onClose}>
                        Close
                    </button>
                </div>
            )
        }
    }

    return (
        <Drawer position="right" width="75%" minWidth="1024px" maxWidth="1200px">
            <div className="create-resource-container bcn-0 h-100">
                <div className="flex flex-align-center flex-justify bcn-0 pt-16 pr-20 pb-16 pl-20 dc__border-bottom">
                    <h2 className="fs-16 fw-6 lh-1-43 m-0 title-padding">Create Kubernetes object</h2>
                    <button type="button" className="dc__transparent flex icon-dim-24" onClick={onClose}>
                        <CloseIcon className="icon-dim-24" />
                    </button>
                </div>

                <div style={{ height: 'calc(100vh - 125px)' }}>
                    {showCodeEditorView ? (
                        <>
                            <InfoColourBar
                                message="Multi YAML supported. You can create/update multiple K8s objects at once. Make sure you separate the object YAMLs by ‘---’."
                                classname="info_bar dc__no-border-radius dc__no-top-border"
                                Icon={InfoIcon}
                            />
                            <CodeEditor
                                value={resourceYAML}
                                mode={MODES.YAML}
                                noParsing
                                height={'calc(100vh - 165px)'}
                                onChange={handleEditorValueChange}
                                loading={loader}
                            />
                        </>
                    ) : (
                        <div>
                            <div className="created-resource-row dc__border-bottom pt-8 pr-20 pb-8 pl-20">
                                {APP_STATUS_HEADERS.map((headerKey, index) => (
                                    <div className="fs-13 fw-6 cn-7" key={`header_${index}`}>
                                        {headerKey}
                                    </div>
                                ))}
                            </div>
                            <div className="created-resource-list fs-13">
                                {resourceResponse.map((resource) => (
                                    <div
                                        className="created-resource-row pt-8 pr-20 pb-8 pl-20"
                                        key={`${resource.kind}/${resource.name}`}
                                    >
                                        <div>{resource.kind}</div>
                                        <div>{resource.name}</div>
                                        <div className="flex left">
                                            {resource.status === CreateResourceStatus.failed ? (
                                                <Error className="icon-dim-16 mr-8" />
                                            ) : (
                                                <Success className="icon-dim-16 mr-8" />
                                            )}
                                            {resource.status}
                                        </div>
                                        <div>{resource.message}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                {renderFooter()}
            </div>
        </Drawer>
    )
}
