import React from 'react'
import { Switch, useRouteMatch, Route } from 'react-router-dom'
import LinkedCIDetailsModal from './LinkedCIDetailsModal'
import { URLS } from '../../../config'
import { LinkedCIDetailsModalProps } from './types'

const LinkedCIModalRoute = ({ title, linkedAppCount }: LinkedCIDetailsModalProps) => {
    const { path } = useRouteMatch()

    return (
        <Switch>
            <Route
                path={`${path}/${URLS.LINKED_CI_DETAILS}/:ciPipelineId`}
                render={() => <LinkedCIDetailsModal title={title} linkedAppCount={linkedAppCount} />}
                exact
            />
        </Switch>
    )
}

export default LinkedCIModalRoute
