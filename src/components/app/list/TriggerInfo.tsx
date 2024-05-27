import { Drawer, GenericEmptyState, Progressing, ReleaseTag, Reload, showError, Artifacts, HistoryComponentType } from '@devtron-labs/devtron-fe-common-lib'
import React, { Component, SyntheticEvent } from 'react'
import { ReactComponent as Down } from '../../../assets/icons/ic-arrow-down.svg'
import close from '../../../assets/icons/ic-close.svg'
import { API_STATUS_CODES, ViewType } from '../../../config'
import { ImageComment } from '../details/cicdHistory/types'
import { CIMaterialType, MaterialHistory } from '../details/triggerView/MaterialHistory'
import { getCITriggerInfoModal } from '../service'
import { renderCIListHeader } from '../details/cdDetails/utils'

interface TriggerInfoModalState {
    statusCode: number
    view: string
    materials: CIMaterialType[]
    triggeredByEmail: string
    lastDeployedTime: string
    environmentName: string
    environmentId: number
    appName: string
    imageComment: ImageComment
    imageReleaseTags: ReleaseTag[]
    image: string
    appReleaseTags?: string[]
    tagsEditable?: boolean
    hideImageTaggingHardDelete?: boolean
}

export interface TriggerInfoModalProps {
    close: () => void
    envId: number | string
    ciArtifactId: number
}

export class TriggerInfoModal extends Component<TriggerInfoModalProps, TriggerInfoModalState> {
    commitInfoRef = null

    constructor(props) {
        super(props)
        this.state = {
            statusCode: 0,
            view: ViewType.LOADING,
            materials: [],
            triggeredByEmail: '',
            lastDeployedTime: '',
            environmentName: '',
            environmentId: 0,
            appName: '',
            imageComment: { id: 0, artifactId: 0, comment: '' },
            imageReleaseTags: [],
            image: '',
            appReleaseTags: [],
            tagsEditable: false,
            hideImageTaggingHardDelete: false,
        }
        this.commitInfoRef = React.createRef<HTMLDivElement>()
        this.selectMaterial = this.selectMaterial.bind(this)
        this.toggleChanges = this.toggleChanges.bind(this)
    }

    outsideClickHandler = (evt): void => {
        if (this.commitInfoRef.current && !this.commitInfoRef.current.contains(evt.target)) {
            this.props.close()
        }
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.outsideClickHandler)
    }

    fetchCITriggerInfo = (e?: SyntheticEvent) => {
        // To prevent the modal from closing
        e?.stopPropagation()

        this.setState({
            view: ViewType.LOADING
        })

        const params = {
            envId: this.props.envId,
            ciArtifactId: this.props.ciArtifactId,
        }

        getCITriggerInfoModal(params)
            .then((response) => {
                this.setState({
                    statusCode: response.code,
                    view: ViewType.FORM,
                    ...response.result,
                })
            })
            .catch((error) => {
                showError(error)

                this.setState({
                    view: ViewType.ERROR,
                    statusCode: error?.code,
                })
            })
    }

    componentDidMount() {
        this.fetchCITriggerInfo()
        document.addEventListener('click', this.outsideClickHandler)
    }

    selectMaterial(materialId: string): void {
        const materials = this.state.materials.map((material) => {
            if (String(material.id) === materialId) {
                material.isSelected = true
            } else {
                material.isSelected = false
            }
            return material
        })
        this.setState({ materials })
    }

    toggleChanges(materialId: string, commit: string): void {
        const materials = this.state.materials.map((material) => {
            if (String(material.id) === materialId) {
                material.history = material.history.map((hist) => {
                    if (hist.commit === commit) {
                        hist.showChanges = !hist.showChanges
                    }
                    return hist
                })
            }
            return material
        })
        this.setState({ materials })
    }

    renderWithBackDrop(headerDescription: string, body) {
        return (
            <Drawer position="right" width="800px" onEscape={this.props.close}>
                <div data-testid="visible-modal-commit-info" className="h-100vh" ref={this.commitInfoRef}>
                    <div className="trigger-modal__header bcn-0">
                        <div className="">
                            <h1 className="modal__title">{this.state.appName}</h1>
                            <p className="fs-13 cn-7 lh-1-54 m-0">{headerDescription}</p>
                        </div>
                        <button
                            data-testid="visible-modal-close"
                            type="button"
                            className="dc__transparent"
                            onClick={this.props.close}
                        >
                            <img src={close} alt="close" />
                        </button>
                    </div>
                    {body}
                </div>
            </Drawer>
        )
    }

    render() {
        let headerDescription
        let body
        if (this.state.view === ViewType.LOADING) {
            headerDescription = null
            body = (
                <div className="m-lr-0 flexbox trigger-modal-body-height">
                    <div className="select-material">
                        <Progressing pageLoader />
                    </div>
                </div>
            )
        } else if (this.state.view === ViewType.ERROR) {
            headerDescription = null
            if (this.state.statusCode === API_STATUS_CODES.NOT_FOUND) {
                body = (
                    <GenericEmptyState
                        title="Data not available"
                        subTitle="The data you are looking for is not available"
                        classname="h-100 bcn-0"
                    />
                )
            } else {
                body = <Reload className="h-100 bcn-0" reload={this.fetchCITriggerInfo} />
            }
        } else if (!this.state.materials?.length) {
            body = (
                <GenericEmptyState
                    title="Data not available"
                    subTitle="The data you are looking for is not available"
                    classname="h-100 bcn-0"
                />
            )
        } else {
            headerDescription = `Deployed on ${this.state.environmentName} at ${this.state.lastDeployedTime} by ${this.state.triggeredByEmail}`
            body = (
                <div className="m-lr-0 flexbox trigger-modal-body-height dc__overflow-scroll pb-12">
                    <div className="select-material">
                        {this.state.materials.map((material) => (
                            <MaterialHistory
                                material={material}
                                pipelineName=""
                                toggleChanges={this.toggleChanges}
                                key={material.id}
                            />
                        ))}
                        <div className="dc__dashed_icon_grid-container">
                            <hr className="dc__dotted-line" />
                            <div className="flex">
                                <Down />
                            </div>
                            <hr className="dc__dotted-line" />
                        </div>
                        <Artifacts
                            status=""
                            artifact={this.state.image}
                            blobStorageEnabled
                            isArtifactUploaded={false}
                            isJobView={false}
                            type={HistoryComponentType.CI}
                            imageReleaseTags={this.state.imageReleaseTags}
                            imageComment={this.state.imageComment}
                            // FIXME: This is a existing issue, we should be sending the pipeline if instead of the artifact if
                            ciPipelineId={this.state.materials[0].id}
                            artifactId={this.props.ciArtifactId}
                            appReleaseTagNames={this.state.appReleaseTags}
                            tagsEditable={this.state.tagsEditable}
                            hideImageTaggingHardDelete={this.state.hideImageTaggingHardDelete}
                            renderCIListHeader={renderCIListHeader}
                        />
                    </div>
                </div>
            )
        }
        return this.renderWithBackDrop(headerDescription, body)
    }
}
