import React from 'react'
import { Route, Switch, useHistory, useRouteMatch } from 'react-router-dom'
import { URLS } from '../../../config'
import { Progressing, stopPropagation, useAsync } from '../../common'
import HeaderWithCreateButton from '../../common/header/HeaderWithCreateButton/HeaderWithCreateButton'
import CreateJobDrawer from '../CreateJobDrawer'
import { getJobs } from '../Service'
import './JobsList.scss'

export default function JobsList() {
    const { path } = useRouteMatch()
    const history = useHistory()
    const [loadingJobs, jobsResponse, jobsError, reloadJobs] = useAsync(
        () =>
            getJobs({
                teams: [],
                appStatuses: [],
                sortBy: 'jobNameSort',
                sortOrder: 'ASC',
                offset: 0,
                size: 20,
            }),
        [],
    )

    const closeDevtronAppCreateModal = (e) => {
        stopPropagation(e)
        history.push(`${URLS.JOBS}/${URLS.APP_LIST}`)
    }

    const renderAppCreateRouter = () => {
        return (
            <Switch>
                <Route path={`${path}/${URLS.CREATE_JOB}`}>
                    <CreateJobDrawer close={closeDevtronAppCreateModal} reloadList={reloadJobs} />
                </Route>
            </Switch>
        )
    }

    return loadingJobs ? (
        <Progressing fullHeight pageLoader />
    ) : (
        <div>
            <HeaderWithCreateButton headerName="Jobs" />
            {renderAppCreateRouter()}
        </div>
    )
}
