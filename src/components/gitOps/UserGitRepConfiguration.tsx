import React, { useEffect, useState } from 'react'
import { InfoColourBar, Progressing, showError } from '@devtron-labs/devtron-fe-common-lib'
import { useHistory } from 'react-router-dom'
import { toast } from 'react-toastify'
import { gitOpsConfigDevtron, getGitOpsRepoConfig } from '../../services/service'
import UserGitRepo from './UserGitRepo'
import { UserGitRepoConfigurationProps } from './gitops.type'
import { repoType, URLS } from '../../config'
import { ReactComponent as Warn } from '../../assets/icons/ic-warning.svg'
import { STAGE_NAME } from '../app/details/appConfig/appConfig.type'
import { ReloadNoGitOpsRepoConfiguredModal } from '../workflowEditor/NoGitOpsRepoConfiguredWarning'

export default function UserGitRepConfiguration({ respondOnSuccess, appId, navItems }: UserGitRepoConfigurationProps) {
    const [gitOpsRepoURL, setGitOpsRepoURL] = useState('')
    const [selectedRepoType, setSelectedRepoType] = useState(repoType.DEFAULT)
    const [isEditable, setIsEditable] = useState(false)
    const [showReloadModal, setShowReloadModal] = useState(false)
    const [loading, setLoading] = useState(false)
    const history = useHistory()

    useEffect(() => {
        setLoading(true)
        getGitOpsRepoConfig(appId)
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

    const closePopup = () => {
        setShowReloadModal(false)
    }

    const reload = () => {
        history.push(`/app/${appId}/edit/${URLS.APP_WORKFLOW_CONFIG}`)
        window.location.reload()
    }

    function handleSaveButton() {
        const payload = {
            appId,
            gitRepoURL: selectedRepoType === repoType.DEFAULT ? 'Default' : gitOpsRepoURL,
        }
        setLoading(true)
        gitOpsConfigDevtron(payload)
            .then(() => {
                respondOnSuccess()
                toast.success('Successfully saved.')
                const stageIndex = navItems.findIndex((item) => item.stage === STAGE_NAME.GITOPS_CONFIG)
                history.push(navItems[stageIndex + 1].href)
            })
            .catch((err) => {
                if (err['code'] === 408) {
                    setShowReloadModal(true)
                } else {
                    showError(err)
                }
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
            {showReloadModal && <ReloadNoGitOpsRepoConfiguredModal closePopup={closePopup} reload={reload} />}
        </div>
    )
}
