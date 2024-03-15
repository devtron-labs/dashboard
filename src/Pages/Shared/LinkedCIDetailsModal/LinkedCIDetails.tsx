import React from 'react'
import { Switch, useRouteMatch, Route } from 'react-router-dom'
import LinkedCIDetailsModal from './LinkedCIDetailsModal'
import { URLS } from '../../../config'
import { LinkedCIDetailsModalProps } from './types'

const LinkedCIDetails = ({ ciPipelineName, linkedWorkflowCount }: LinkedCIDetailsModalProps) => {
    const { path } = useRouteMatch()

    return (
        <Switch>
            <Route
                path={`${path}/${URLS.LINKED_CI_DETAILS}/:ciPipelineId`}
                render={() => (
                    <LinkedCIDetailsModal ciPipelineName={ciPipelineName} linkedWorkflowCount={linkedWorkflowCount} />
                )}
                exact
            />
        </Switch>
    )
}

export default LinkedCIDetails
