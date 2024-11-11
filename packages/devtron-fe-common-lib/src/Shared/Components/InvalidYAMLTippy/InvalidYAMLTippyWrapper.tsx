import { Tooltip } from '@Common/Tooltip'
import { InvalidYAMLTippyWrapperProps } from './types'
import { getInvalidTippyContent } from './utils'

const InvalidYAMLTippy = ({ parsingError, restoreLastSavedYAML, children }: InvalidYAMLTippyWrapperProps) => (
    <Tooltip
        alwaysShowTippyOnHover
        interactive
        content={getInvalidTippyContent({
            parsingError,
            restoreLastSavedYAML,
        })}
    >
        {children}
    </Tooltip>
)

const InvalidYAMLTippyWrapper = ({ parsingError, restoreLastSavedYAML, children }: InvalidYAMLTippyWrapperProps) => {
    if (parsingError) {
        return (
            <InvalidYAMLTippy parsingError={parsingError} restoreLastSavedYAML={restoreLastSavedYAML}>
                {children}
            </InvalidYAMLTippy>
        )
    }

    return children
}

export default InvalidYAMLTippyWrapper
