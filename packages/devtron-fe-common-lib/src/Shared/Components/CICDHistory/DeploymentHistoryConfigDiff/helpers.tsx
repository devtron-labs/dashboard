import { NavLink } from 'react-router-dom'

import { ReactComponent as ICFileCode } from '@Icons/ic-file-code.svg'
import { ReactComponent as ICDocker } from '@Icons/ic-docker.svg'
import {
    DeploymentConfigDiffProps,
    DeploymentConfigDiffState,
    diffStateIconMap,
    diffStateTextColorMap,
    diffStateTextMap,
} from '@Shared/Components/DeploymentConfigDiff'

import { History } from '../types'
import { DeploymentHistoryConfigDiffProps } from './types'

const renderState = (diffState: DeploymentConfigDiffState) => {
    const Icon = diffStateIconMap[diffState]

    return (
        <div className="flex dc__gap-6">
            {Icon && <Icon className="icon-dim-16" />}
            <span className={`fs-12 lh-20 ${diffStateTextColorMap[diffState]}`}>{diffStateTextMap[diffState]}</span>
        </div>
    )
}

export const renderDeploymentHistoryConfig = (
    config: DeploymentConfigDiffProps['configList'],
    heading: string,
    pathname: string,
    hideDiffState: boolean,
) => (
    <div className="dc__border br-4 dc__overflow-hidden">
        {heading && (
            <div className="px-16 py-8 dc__border-bottom-n1">
                <h4 className="m-0 cn-7 fs-12 lh-20 fw-6">{heading}</h4>
            </div>
        )}
        {config.map(({ id, title, name, diffState, pathType }, index) => {
            const href = `${pathname}/${name ? `${pathType}/${name}` : pathType}`

            return (
                <NavLink
                    key={id}
                    className={`cursor dc__no-decor px-16 py-12 flex dc__content-space dc__hover-n50 ${index !== config.length - 1 ? 'dc__border-bottom-n1' : ''}`}
                    to={href}
                >
                    <p className="m-0 flex dc__gap-8">
                        <ICFileCode className="icon-dim-20 scn-6" />
                        <span
                            className={`cb-5 fs-13 lh-20 ${diffState === DeploymentConfigDiffState.DELETED ? 'dc__strike-through' : ''}`}
                        >
                            {name || title}
                        </span>
                    </p>
                    {!hideDiffState && renderState(diffState)}
                </NavLink>
            )
        })}
    </div>
)

export const renderPipelineDeploymentStatusIcon = (status: string) => (
    <span
        className={`flexbox dc__align-items-start dc__app-summary__icon icon-dim-22 ${status
            .toLocaleLowerCase()
            .replace(/\s+/g, '')}`}
    />
)

export const renderPipelineDeploymentOptionDescription = ({
    stage,
    triggeredBy,
    triggeredByEmail,
    artifact,
    renderRunSource,
    resourceId,
    runSource,
}: Pick<History, 'triggeredBy' | 'triggeredByEmail' | 'artifact' | 'stage' | 'runSource'> &
    Pick<DeploymentHistoryConfigDiffProps, 'renderRunSource' | 'resourceId'>) => (
    <div className="flexbox-col dc__gap-4">
        <p className="m-0 fs-12 lh-20 cn-7 flex left dc__gap-4">
            <span className="dc__capitalize">{stage}</span>
            <span className="dc__bullet dc__bullet--d2" />
            {artifact && (
                <span className="dc__app-commit__hash dc__app-commit__hash--no-bg dc__no-shrink">
                    <ICDocker className="commit-hash__icon grayscale" />
                    {artifact.split(':')[1].slice(-12)}
                </span>
            )}
            <span className="dc__bullet dc__bullet--d2" />
            <span className="dc__truncate">{triggeredBy === 1 ? 'auto trigger' : triggeredByEmail}</span>
        </p>
        {runSource && renderRunSource && renderRunSource(runSource, resourceId === runSource?.id)}
    </div>
)
