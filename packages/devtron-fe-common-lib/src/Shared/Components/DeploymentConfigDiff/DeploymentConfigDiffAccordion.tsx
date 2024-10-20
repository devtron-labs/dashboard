import { ReactComponent as ICCaretDown } from '@Icons/ic-caret-down.svg'

import { Collapse } from '../Collapse'
import { DeploymentConfigDiffAccordionProps, DeploymentConfigDiffState } from './DeploymentConfigDiff.types'
import { diffStateTextColorMap, diffStateTextMap } from './DeploymentConfigDiff.constants'

export const DeploymentConfigDiffAccordion = ({
    diffState,
    showDetailedDiffState,
    hideDiffState,
    children,
    title,
    id,
    isExpanded,
    onClick,
    onTransitionEnd,
}: DeploymentConfigDiffAccordionProps) => (
    <div id={id} className="dc__border br-4 deployment-config-diff__accordion">
        <button
            type="button"
            className="dc__unset-button-styles px-16 py-10 flexbox dc__align-items-center dc__gap-8 w-100 br-4 bcn-50 dc__position-sticky dc__top-0 dc__zi-10"
            aria-label="expand-collapse-btn"
            onClick={onClick}
        >
            <ICCaretDown
                className="icon-dim-16 fsn-6 rotate"
                style={{ ['--rotateBy' as string]: isExpanded ? '360deg' : '270deg' }}
            />
            <p className="m-0 cn-9 fs-13 lh-20">{title}</p>
            {!hideDiffState && (
                <p
                    className={`m-0 fs-13 lh-20 fw-6 ${showDetailedDiffState ? diffStateTextColorMap[diffState] : (diffState !== DeploymentConfigDiffState.NO_DIFF && 'cy-7') || 'cg-7'}`}
                >
                    {showDetailedDiffState
                        ? diffStateTextMap[diffState]
                        : `${diffState !== DeploymentConfigDiffState.NO_DIFF ? 'Has' : 'No'} difference`}
                </p>
            )}
        </button>
        <Collapse expand={isExpanded} onTransitionEnd={onTransitionEnd}>
            {children}
        </Collapse>
    </div>
)
