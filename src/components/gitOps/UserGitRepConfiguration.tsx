import React, { useEffect, useState } from 'react'
import { gitOpsConfigDevtron, getGitOpsRepoConfig } from '../../services/service'
import { InfoColourBar, Progressing, Reload, VisibleModal, VisibleModal2, showError } from '@devtron-labs/devtron-fe-common-lib'
import UserGitRepo from './UserGitRepo'
import { UserGitRepoConfigurationProps } from './gitops.type'
import { repoType } from '../../config'
import { ReactComponent as Warn } from '../../assets/icons/ic-warning.svg'
import { STAGE_NAME } from '../app/details/appConfig/appConfig.type'
import { NavLink, useHistory } from 'react-router-dom'
import { toast } from 'react-toastify'
import { URLS } from '../../config'

export default function UserGitRepConfiguration(props: UserGitRepoConfigurationProps) {
    const [gitOpsRepoURL, setGitOpsRepoURL] = useState('')
    const [selectedRepoType, setSelectedRepoType] = useState(repoType.DEFAULT)
    const [isEditable, setIsEditable] = useState(false)
    const [errorInFetching, setErrorInFetching] = useState<Map<any, any>>(new Map())
    const [displayValidation, setDisplayValidation] = useState(false)
    const [loading, setLoading] = useState(false)
    const history = useHistory()

    useEffect(() => {
        setLoading(true)
        getGitOpsRepoConfig(props.appId)
            .then((response) => {
                if (response.result) {
                    setGitOpsRepoURL(response.result.gitRepoURL)
                    setIsEditable(response.result.isEditable)
                }
            })
            .catch((err) => {
                showError(err)
            })
            .finally(() => {
                setLoading(false)
            })
    }, [])

    const renderSavedGitOpsRepoState = (repoURL) => (
        <>
            {loading ? (
                <div className="w-100 h-100">
                    <Progressing pageLoader />
                </div>
            ) : (
                <div className="pt-16 pl-20">
                    <div>
                        <div className="fw-4 fs-13 fcn-9">
                            Application Deployemnt states are saved as manifest in a Git repository. ArgoCD uses these
                            manifests to sync with your live Kubernetes cluster.
                        </div>
                        <div className="fs-13 fw-4 flexbox-col mt-16 mb-16">
                            <div className="">Configurations for this application will be committed to:</div>
                            <a
                                className="dc__ff-monospace dc__link "
                                href={repoURL}
                                target="_blank"
                                rel="noreferrer noopener"
                            >
                                {repoURL}
                            </a>
                        </div>
                    </div>
                    {renderInfoColorBar()}
                </div>
            )}
        </>
    )

    const renderInfoColorBar = () => {
        return (
            <InfoColourBar
                message="GitOps repository for this application is immutable once saved."
                classname="warn"
                Icon={Warn}
                iconClass="warning-icon"
            />
        )
    }

    function reloadModal() {
        return (
            <VisibleModal2 className="confirmation-dialog">
            <div className="confirmation-dialog__body ">
                <div className="flexbox dc__content-space mb-20">
                    {/* <WarningIcon className="h-48 mw-48" /> */}
                    {/* <Close className="icon-dim-24 cursor" onClick={closePopup} /> */}
                </div>
                <div className="flex left column ">
                    <h3 className="confirmation-dialog__title lh-1-25 dc__break-word w-100">
                        GitOps repository is not configured
                    </h3>
                    {/* <p className="fs-14 fw-4 cn-9">{text}</p> */}
                </div>
                <div className="flex right confirmation-dialog__button-group">
                    <button type="button" className="cta cancel sso__warn-button" onClick={()=>{}}>
                        Reload
                    </button>
                </div>
            </div>
        </VisibleModal2>
        )
    }

    function handleSaveButton() {
        const payload = {
            appId: props.appId,
            gitRepoURL: selectedRepoType === repoType.DEFAULT ? 'Default' : gitOpsRepoURL,
        }
        setLoading(true)
        gitOpsConfigDevtron(payload)
            .then((response) => {
                if (Object.values(response.result.stageErrorMap).length > 0) {
                    setDisplayValidation(true)
                    setErrorInFetching(response.result.stageErrorMap)
                } else {
                    props.respondOnSuccess()
                    toast.success('Successfully saved.')
                    const stageIndex = props.navItems.findIndex((item) => item.stage === STAGE_NAME.GITOPS_CONFIG)
                    history.push(props.navItems[stageIndex + 1].href)
                }
                if (response.code === 500 || response.code === 200) {
                    reloadModal()
                }
            })
            .catch((err) => {
                showError(err)
            })
            .finally(() => {
                setLoading(false)
            })
    }

    return (
            <div className="w-100 h-100 bcn-0 pt-16 flexbox-col">
                <div className="w-960">
                    <div className="fs-16 fcn-9 fw-6 ml-20 mb-8">GitOps Configuration</div>
                    {isEditable ? (
                        <UserGitRepo
                            setSelectedRepoType={setSelectedRepoType}
                            selectedRepoType={selectedRepoType}
                            repoURL={gitOpsRepoURL}
                            setRepoURL={setGitOpsRepoURL}
                            displayValidation={displayValidation}
                            errorInFetching={errorInFetching}
                            setDisplayValidation={setDisplayValidation}
                        />
                    ) : (
                        renderSavedGitOpsRepoState(gitOpsRepoURL)
                    )}
                </div>
                {isEditable && (
                    <div className="pl-16 w-960">
                        <hr />
                        <button
                            data-testid="save_cluster_list_button_after_selection"
                            className="cta h-36 lh-36 "
                            type="button"
                            onClick={handleSaveButton}
                        >
                            {loading ? <Progressing /> : 'Save'}
                        </button>
                    </div>
                )}
            </div>
    )
}
