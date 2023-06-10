import React, { Component } from 'react'
import { showError, Progressing, Drawer } from '@devtron-labs/devtron-fe-common-lib'
import { getCITriggerInfoModal } from '../service'
import { ViewType } from '../../../config'
import close from '../../../assets/icons/ic-close.svg'
import { MaterialHistory, CIMaterialType } from '../details/triggerView/MaterialHistory'
import MaterialSource from '../details/triggerView/MaterialSource'
import { ImageTagsContainer } from '../details/cicdHistory/ImageTags'
import Artifacts from '../details/cicdHistory/Artifacts'
import { HistoryComponentType, ImageComment, ReleaseTag } from '../details/cicdHistory/types'
import { GitMaterialInfoHeader } from '../../common'
import GitCommitInfoGeneric from '../../common/GitCommitInfoGeneric'

interface TriggerInfoModalState {
    statusCode: number
    view: string
    materials: CIMaterialType[]
    triggeredByEmail: string
    lastDeployedTime: string
    environmentName: string
    environmentId: number
    appName: string
    appReleaseTags: []
    imageComment: ImageComment
    imageReleaseTags: ReleaseTag[]
    image: string
}

interface TriggerInfoModalProps {
    close: () => void
    envId: number | string
    ciArtifactId: number
    commit?: string
}

export class TriggerInfoModal extends Component<TriggerInfoModalProps, TriggerInfoModalState> {
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
            appReleaseTags: [],
            imageComment: {id:0, artifactId:0, comment:""},
            imageReleaseTags: [],
            image: '',
        }
        this.selectMaterial = this.selectMaterial.bind(this)
        this.toggleChanges = this.toggleChanges.bind(this)
    }

    componentDidMount() {
        let params = {
            envId: this.props.envId,
            ciArtifactId: this.props.ciArtifactId,
        }
        getCITriggerInfoModal(params, this.props.commit)
            .then((response) => {
                this.setState({
                    statusCode: response.code,
                    view: ViewType.FORM,
                    ...response.result,
                })
            })
            .catch((error) => {
                showError(error)
            })
    }

    selectMaterial(materialId: string): void {
        let materials = this.state.materials.map((material) => {
            if (String(material.id) === materialId) {
                material.isSelected = true
            } else material.isSelected = false
            return material
        })
        this.setState({ materials: materials })
    }

    toggleChanges(materialId: string, commit: string): void {
        let materials = this.state.materials.map((material) => {
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
        this.setState({ materials: materials })
    }

    renderWithBackDrop(headerDescription: string, body) {
        return (
            <Drawer position="right" width="800px">
                <div data-testid="visible-modal-commit-info" className={''}>
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
        let headerDescription, body
        if (this.state.view === ViewType.LOADING) {
            headerDescription = null
            body = (
                <div className="m-lr-0 flexbox">
                    <div className="select-material" style={{ height: '100vh' }}>
                        <Progressing pageLoader />
                    </div>
                </div>
            )
        } else {
            const selectedMaterial = this.state.materials.find((mat) => mat.isSelected)
            headerDescription = `Deployed on ${this.state.environmentName} at ${this.state.lastDeployedTime} by ${this.state.triggeredByEmail}`
            body = (
                <div className="m-lr-0 flexbox">
                    <div className="select-material" style={{ height: '100vh' }}>
                        <MaterialHistory
                            material={selectedMaterial}
                            pipelineName=""
                            toggleChanges={this.toggleChanges}
                        />
                        <div className="mt-16 mb-16 mr-20 ml-20 bcn-0 dc__border br-4">
                            <Artifacts
                                status={''}
                                artifact={this.state.image} 
                                blobStorageEnabled={true}
                                isArtifactUploaded={false}
                                isJobView={false}
                                type={HistoryComponentType.CI}
                                imageReleaseTags={this.state.imageReleaseTags}
                                imageComment={this.state.imageComment}
                                ciPipelineId={selectedMaterial.id}
                                artifactId={this.props.ciArtifactId}
                            />
                        </div>
                    </div>
                </div>
            )
        }
        return this.renderWithBackDrop(headerDescription, body)
    }
}
