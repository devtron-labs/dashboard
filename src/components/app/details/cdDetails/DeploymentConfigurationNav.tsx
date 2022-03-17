import React from 'react';
import { ReactComponent as RightArrow } from '../../../../assets/icons/ic-arrow-left.svg';
import { NavLink } from 'react-router-dom';
import { useRouteMatch, useParams } from 'react-router';
import { DeploymentTemplateDiffRes } from './cd.type';
import CDEmptyState from './CDEmptyState';
interface TemplateConfiguration {
    setShowTemplate: (boolean) => void;
    deploymentTemplatesConfiguration: DeploymentTemplateDiffRes[];
}

function DeploymentConfigurationNav({ setShowTemplate, deploymentTemplatesConfiguration }: TemplateConfiguration) {
    const match = useRouteMatch();
    const { triggerId } = useParams<{ triggerId: string }>();

    const deploymentTemplateFilteredTrigger = deploymentTemplatesConfiguration.find(
        (dt) => dt.wfrId.toString() === triggerId,
    );

    return deploymentTemplateFilteredTrigger ? (
        <div className="m-20 fs-13 cn-9">
            <NavLink
                to={`${match.url}/deployment-template`}
                onClick={() => setShowTemplate(true)}
                className="bcb-1 no-decor bcn-0 cn-9 pl-16 pr-16 pt-12 pb-12 br-4 en-2 bw-1 mb-20 flex content-space cursor"
            >
                Deployment template
                <span>
                    <RightArrow className="rotate icon-dim-20" style={{ ['--rotateBy' as any]: '180deg' }} />
                </span>
            </NavLink>
        </div>
    ) : (
        <CDEmptyState />
    );
}

export default DeploymentConfigurationNav;
