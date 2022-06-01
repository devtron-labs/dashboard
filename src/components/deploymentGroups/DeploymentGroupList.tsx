import React, { Component } from 'react'
import { RouteComponentProps } from 'react-router'
import { ErrorScreenManager, Progressing, PopupMenu, showError, DeleteDialog } from '../common'
import { ViewType, SourceTypeMap, URLS } from '../../config'
import { deploymentGroupList, triggerGroupDeploy, getCDMaterialList, deleteDeploymentGroup } from './service'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'
import { ReactComponent as Branch } from '../../assets/icons/misc/branch.svg'
import { ReactComponent as Deploy } from '../../assets/icons/ic-deploy.svg'
import { ReactComponent as Dots } from '../../assets/icons/appstatus/ic-menu-dots.svg'
import { CDMaterial } from '../app/details/triggerView/cdMaterial'
import { CDMaterialType } from '../app/details/triggerView/types'
import noGroups from '../../assets/img/ic-feature-deploymentgroups@3x.png'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import Tippy from '@tippyjs/react'
import { ReactComponent as Delete } from '../../assets/icons/ic-delete.svg'
import PageHeader from '../common/header/PageHeader'

export interface BulkActionListProps extends RouteComponentProps<{}> {}

export interface BulkActionListState {
    code: number
    view: string
    deploymentGroupId: number
    showCDModal: boolean
    envName: string
    materials: CDMaterialType[]
    isLoading: boolean
    showGroupDeleteModal: boolean
    list: any[]
}

export default class DeploymentGroupList extends Component<BulkActionListProps, BulkActionListState> {
    constructor(props) {
        super(props)
        this.state = {
            code: 0,
            view: ViewType.LOADING,
            deploymentGroupId: 0,
            envName: '',
            showCDModal: false,
            materials: [],
            isLoading: false,
            list: [],
            showGroupDeleteModal: false,
        }
        this.selectImage = this.selectImage.bind(this)
        this.toggleSourceInfo = this.toggleSourceInfo.bind(this)
        this.triggerDeploy = this.triggerDeploy.bind(this)
    }

    componentDidMount() {
        this.deploymentGroupList()
    }

    deploymentGroupList() {
        deploymentGroupList()
            .then((response) => {
                let view = ViewType.FORM
                if (response.result.length === 0) view = ViewType.EMPTY
                this.setState({
                    view: view,
                    list: response.result,
                    deploymentGroupId: 0,
                    showGroupDeleteModal: false,
                    showCDModal: false,
                })
            })
            .catch((error) => {
                this.setState({ view: ViewType.ERROR })
                showError(error)
            })
    }

    getCDMaterialList(deploymentGroup) {
        getCDMaterialList(deploymentGroup.id)
            .then((response) => {
                if (response.result) {
                    this.setState({
                        materials: response.result,
                        deploymentGroupId: deploymentGroup.id,
                        envName: deploymentGroup.environmentName,
                        showCDModal: true,
                    })
                }
            })
            .catch((error) => {
                showError(error)
            })
    }

    triggerDeploy() {
        this.setState({ isLoading: true })
        let material = this.state.materials.find((mat) => mat.isSelected)
        let request = {
            DeploymentGroupId: this.state.deploymentGroupId,
            CiArtifactId: material.id,
        }
        triggerGroupDeploy(request)
            .then((response) => {
                if (response.code === 200) {
                    toast.success('Deployment Triggerd')
                    this.setState({ showCDModal: false, isLoading: false })
                }
            })
            .catch((error) => {
                showError(error)
                this.setState({ isLoading: false })
            })
    }

    deleteDeploymentGroup() {
        deleteDeploymentGroup(this.state.deploymentGroupId)
            .then((response) => {
                if (response.result) {
                    toast.success('Deployment Group Deleted')
                    this.deploymentGroupList()
                }
            })
            .catch((error) => {
                showError(error)
            })
    }

    toggleSourceInfo(index: number) {
        let { materials } = { ...this.state }
        materials[index].showSourceInfo = !materials[index].showSourceInfo
        this.setState({ materials })
    }

    selectImage(index: number, materialType: string) {
        let { materials } = { ...this.state }
        materials = materials.map((mat, i) => {
            return {
                ...mat,
                isSelected: index === i,
            }
        })
        this.setState({ materials })
    }

    redirectToEdit(deploymentGroup) {
        const LINK = `${URLS.DEPLOYMENT_GROUPS}/${deploymentGroup.id}/edit`
        this.props.history.push(LINK)
    }

    renderListHeader() {
        return (
            <>
                <div className="bulk-action-list__row bulk-action-list__row--header">
                    <div className="bulk-action-list__cell bulk-action-list__cell--name">Name</div>
                    <div className="bulk-action-list__cell bulk-action-list__cell--source">Source</div>
                    <div className="bulk-action-list__cell bulk-action-list__cell--action">Actions</div>
                </div>
            </>
        )
    }

    renderListItems() {
        return this.state.list.map((deploymentGroup) => {
            return (
                <div key={deploymentGroup.id} className="bulk-action-list__row">
                    {this.renderGroupName(deploymentGroup)}
                    {this.renderMaterials(deploymentGroup.ciMaterialDTOs)}
                    {this.renderActions(deploymentGroup)}
                </div>
            )
        })
    }

    renderGroupName(deploymentGroup) {
        return (
            <div className="bulk-action-list__cell bulk-action-list__cell--name">
                <Link to={`${URLS.DEPLOYMENT_GROUPS}/${deploymentGroup.id}/details`} className="deployment-group-title">
                    {deploymentGroup.name}
                </Link>
                <div className="deployment-group__desc">
                    Connected to {deploymentGroup.appCount} apps on {`'${deploymentGroup.environmentName}'`}
                </div>
            </div>
        )
    }

    renderMaterials(materials: any[]) {
        return (
            <div className="bulk-action-list__cell bulk-action-list__cell--source">
                {materials?.map((mat, idx) => {
                    return (
                        <p key={idx} className="deployment-group__repo-list">
                            <span className="icon-dim-18 git inline-block mr-5"></span>
                            <span className="deployment-group__repo-name mr-5"> {mat.name}/</span>
                            <span className="icon-dim-16 inline-block mr-5">
                                {mat.type === SourceTypeMap.BranchFixed ? <Branch className="hw-100" /> : null}
                            </span>
                            <span className="deployment-group__branch-name">{mat.value}</span>
                        </p>
                    )
                })}
            </div>
        )
    }

    renderActions(deploymentGroup) {
        return (
            <div className="bulk-action-list__cell bulk-action-list__cell--action">
                <div className="deployment-group__actions" onClick={(event) => event.stopPropagation()}>
                    <Tippy className="default-tt" content="Select Image to deploy">
                        <button
                            type="button"
                            className="transparent deployment-group__deploy mr-16"
                            onClick={(event) => {
                                event.stopPropagation()
                                this.getCDMaterialList(deploymentGroup)
                            }}
                        >
                            <Deploy className="bulk-action__action" />
                        </button>
                    </Tippy>
                    <PopupMenu autoClose>
                        <PopupMenu.Button rootClassName="inline-block" isKebab={true}>
                            <Dots className="bulk-action__action" />
                        </PopupMenu.Button>
                        <PopupMenu.Body>
                            <ul className="kebab-menu__list">
                                <li
                                    key="edit"
                                    className="kebab-menu__list-item"
                                    onClick={(event) => {
                                        this.redirectToEdit(deploymentGroup)
                                    }}
                                >
                                    Edit
                                </li>
                                <li
                                    key="delete"
                                    className="kebab-menu__list-item kebab-menu__list-item--delete"
                                    onClick={(event) => {
                                        this.setState(
                                            { deploymentGroupId: deploymentGroup.id, showGroupDeleteModal: true },
                                            () => {},
                                        )
                                    }}
                                >
                                    Delete
                                    <Delete className="icon-dim-20" />
                                </li>
                            </ul>
                        </PopupMenu.Body>
                    </PopupMenu>
                </div>
            </div>
        )
    }

    renderList() {
        return (
            <>
                {this.renderListHeader()}
                {this.renderListItems()}
            </>
        )
    }

    renderCDMaterial() {
        if (this.state.showCDModal) {
            return (
                <CDMaterial
                    material={this.state.materials}
                    isLoading={this.state.isLoading}
                    envName={this.state.envName}
                    stageType="CD"
                    materialType="none"
                    triggerDeploy={this.triggerDeploy}
                    toggleSourceInfo={this.toggleSourceInfo}
                    selectImage={this.selectImage}
                    closeCDModal={() => {
                        this.setState({ showCDModal: false })
                    }}
                />
            )
        }
    }

    renderDeleteDialog() {
        let group = this.state.list.find((grp) => grp.id === this.state.deploymentGroupId)
        if (this.state.showGroupDeleteModal)
            return (
                <DeleteDialog
                    title={group.name}
                    description="Are you sure you want to delete this deployment group."
                    closeDelete={() => {
                        this.setState({ showGroupDeleteModal: false })
                    }}
                    delete={() => {
                        this.deleteDeploymentGroup()
                    }}
                />
            )
    }

    redirectToCreateGroup = () => {
        const LINK = `${URLS.DEPLOYMENT_GROUPS}/0/edit`
        this.props.history.push(LINK)
    }

    renderCreateButton = () => {
        return (
            <button type="button" className="flex cta h-32 lh-n" onClick={() => this.redirectToCreateGroup()}>
                <Add className="icon-dim-20" />
                Create Group
            </button>
        )
    }

    render() {
        return (
            <div>
                <PageHeader
                    headerName="Deployment Groups"
                    showCreateButton={this.state.view === ViewType.FORM ? true : false}
                />

                <div className="deployment-group-list-page__body">
                    {this.state.view === ViewType.LOADING && <Progressing pageLoader />}
                    {this.state.view === ViewType.EMPTY && <NoDeploymentGroups />}
                    {this.state.view === ViewType.ERROR && <ErrorScreenManager code={this.state.code} />}
                    {![ViewType.EMPTY, ViewType.ERROR, ViewType.LOADING].includes(this.state.view) && (
                        <React.Fragment>
                            {this.renderList()}
                            {this.renderCDMaterial()}
                            {this.renderDeleteDialog()}
                        </React.Fragment>
                    )}
                </div>
            </div>
        )
    }
}

function NoDeploymentGroups() {
    return (
        <div className="no-apps empty-state--no-deploymentgroup">
            <div className="empty">
                <img src={noGroups} width="250" height="200" className="empty__img" alt="no apps found"></img>
                <h1 className="empty__title" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
                    No Deployment Groups
                </h1>
                <p className="empty__message">Use deployment groups to deploy multiple applications at once.</p>
                <Link to={`${URLS.DEPLOYMENT_GROUPS}/0/edit`} className="cta no-decor cta--create-group flex">
                    <Add className="icon-dim-20 mr-5" />
                    Create Group
                </Link>
            </div>
        </div>
    )
}
