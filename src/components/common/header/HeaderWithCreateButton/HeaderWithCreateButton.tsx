import React, { useContext, useState } from 'react'
import { useHistory, useLocation, useParams } from 'react-router-dom'
import { Modal } from '@devtron-labs/devtron-fe-common-lib'
import PageHeader from '../PageHeader'
import { ReactComponent as DropDown } from '../../../../assets/icons/ic-dropdown-filled.svg'
import { ReactComponent as ChartIcon } from '../../../../assets/icons/ic-charts.svg'
import { ReactComponent as AddIcon } from '../../../../assets/icons/ic-add.svg'
import { ReactComponent as JobIcon } from '../../../../assets/icons/ic-k8s-job.svg'
import { AppListConstants, SERVER_MODE, URLS } from '../../../../config'
import './HeaderWithCreateButton.scss'
import { mainContext } from '../../navigation/NavigationRoutes'

export default function HeaderWithCreateButton({ headerName, isSuperAdmin }) {
    const params = useParams<{ appType: string }>()
    const history = useHistory()
    const location = useLocation()
    const { serverMode } = useContext(mainContext)
    const [showCreateSelectionModal, setShowCreateSelectionModal] = useState(false)

    const handleCreateButton = () => {
        setShowCreateSelectionModal((prevState) => !prevState)
    }

    const redirectToHelmAppDiscover = () => {
        history.push(URLS.CHARTS_DISCOVER)
    }

    const openCreateDevtronAppModel = () => {
        const canOpenModalWithDevtronApps = params.appType
            ? params.appType === AppListConstants.AppType.DEVTRON_APPS
            : serverMode === SERVER_MODE.FULL
        const _appType = canOpenModalWithDevtronApps ? AppListConstants.AppType.DEVTRON_APPS : URLS.APP_LIST_HELM
        const _urlPrefix = `${URLS.APP}/${URLS.APP_LIST}/${_appType}`
        history.push(`${_urlPrefix}/${AppListConstants.CREATE_DEVTRON_APP_URL}${location.search}`)
    }

    const openCreateJobModel = () => {
        history.push(`${URLS.JOB}/${URLS.APP_LIST}/${URLS.CREATE_JOB}`)
    }

    const renderActionButtons = () => {
        return serverMode === SERVER_MODE.FULL ? (
            <button type="button" className="flex cta h-32 lh-n" onClick={handleCreateButton} data-testid="create-app-button-on-header">
                Create
                <DropDown className="icon-dim-20" />
            </button>
        ) : (
            <button type="button" className="flex cta h-32 lh-n" onClick={redirectToHelmAppDiscover}>
                Deploy helm charts
            </button>
        )
    }

    const renderCreateSelectionModal = () => {
        return (
            <Modal rootClassName="create-modal-wrapper" onClick={handleCreateButton}>
                <div
                    className="create-modal-child cursor"
                    onClick={openCreateDevtronAppModel}
                    data-testid="create-custom-app-button-in-dropdown"
                >
                    <AddIcon className="icon-dim-20 fcn-9" />
                    <div className="ml-8">
                        <strong>Custom app</strong>
                        <div>
                            Connect a git repository to deploy <br /> a custom application
                        </div>
                    </div>
                </div>
                <div
                    className="create-modal-child cursor"
                    onClick={redirectToHelmAppDiscover}
                    data-testid="create-from-chart-store-button"
                >
                    <ChartIcon className="icon-dim-20" />
                    <div className="ml-8">
                        <strong>From Chart store</strong>
                        <div>
                            Deploy apps using third party helm <br /> charts (eg. prometheus, redis etc.)
                        </div>
                    </div>
                </div>
                {isSuperAdmin && (
                    <div className="create-modal-child cursor" onClick={openCreateJobModel}>
                        <JobIcon className="icon-dim-20 scn-7" />
                        <div className="ml-8">
                            <strong>Job</strong>
                            <div>
                                Jobs allow manual and automated <br /> execution of developer actions.
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        )
    }
    return (
        <div className="create-button-container dc__position-sticky dc__top-0 bcn-0 dc__zi-4">
            <PageHeader headerName={headerName} renderActionButtons={renderActionButtons} />
            {showCreateSelectionModal && renderCreateSelectionModal()}
        </div>
    )
}
