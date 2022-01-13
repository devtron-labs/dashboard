import React, {useContext} from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { useRouteMatch } from 'react-router';
import DeploymentGroupList from './DeploymentGroupList';
import BulkActionEdit from './BulkActionEdit';
import BulkActionDetails from './BulkActionDetails';
import './BulkActions.scss';
import { DOCUMENTATION, SERVER_MODE } from '../../config';
import EAEmptyState, { EAEmptyStateType } from '../common/eaEmptyState/EAEmptyState';
import { mainContext } from '../common/navigation/NavigationRoutes';

export default function BulkActions({ ...props }) {
    const { path } = useRouteMatch();
    const {serverMode} = useContext(mainContext);

    const renderEmptyStateForEAOnlyMode = () => {
        return (
            <div style={{ height: 'calc(100vh - 250px)' }}>
                <EAEmptyState
                    title={'Create, build, deploy and debug custom apps'}
                    msg={
                        'Create custom application by connecting your code repository. Build and deploy images at the click of a button. Debug your applications using the interactive UI.'
                    }
                    stateType={EAEmptyStateType.BULKEDIT}
                    knowMoreLink={DOCUMENTATION.BULK_UPDATE}
                    headerText="Deployment Groups"
                />
            </div>
        );
    };
    return serverMode === SERVER_MODE.EA_ONLY ? (
        renderEmptyStateForEAOnlyMode()
    ) : (
        <Switch>
            <Route path={`${path}/:id/details`} render={() => <BulkActionDetails />} />
            <Route exact path={`${path}/:id/edit`} render={() => <BulkActionEdit />} />
            <Route exact path={`${path}`} component={DeploymentGroupList} />
            <Redirect to={`${path}`} />
        </Switch>
    );
}