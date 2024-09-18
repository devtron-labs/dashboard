import { ReactComponent as ICWarning } from '@Icons/ic-warning-y6.svg'
import { ReactComponent as ICInfoFilled } from '@Icons/ic-info-filled.svg'
import { useParams } from 'react-router-dom'
import { BaseURLParams } from '@devtron-labs/devtron-fe-common-lib'
import { DeploymentTemplateEditorHeaderProps } from './types'
import OverrideTemplateButton from './OverrideTemplateButton'
import { getDTCodeEditorBackgroundClass } from './utils'

const OverrideInfoStrip = ({
    isOverridden,
    handleOverride,
    showOverrideButton,
}: Pick<DeploymentTemplateEditorHeaderProps, 'isOverridden' | 'handleOverride' | 'showOverrideButton'>) => {
    const { envId } = useParams<BaseURLParams>()

    return (
        <div
            className={`flexbox dc__content-space fs-12 fw-6 lh-20 pl-16 pr-16 dc__border-bottom py-6 ${getDTCodeEditorBackgroundClass(!!envId, isOverridden)}`}
        >
            <div className="flex left dc__gap-8">
                {isOverridden ? (
                    <ICWarning className="icon-dim-16 dc__no-shrink" />
                ) : (
                    <ICInfoFilled className="icon-dim-16 dc__no-shrink" />
                )}

                <span data-testid="env-override-title">
                    {isOverridden
                        ? 'Base configurations are overridden for this file'
                        : 'This file is inheriting base configurations'}
                </span>
            </div>

            {showOverrideButton && (
                <OverrideTemplateButton isOverridden={isOverridden} handleOverride={handleOverride} />
            )}
        </div>
    )
}

export default OverrideInfoStrip
