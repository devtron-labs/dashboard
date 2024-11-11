import { ReactComponent as ICArrowCounterClockwise } from '@Icons/ic-arrow-counter-clockwise.svg'
import { DEFAULT_INVALID_YAML_ERROR } from './constants'
import { InvalidYAMLTippyWrapperProps } from './types'

export const getInvalidTippyContent = ({
    parsingError,
    restoreLastSavedYAML,
}: Pick<InvalidYAMLTippyWrapperProps, 'parsingError' | 'restoreLastSavedYAML'>) => (
    <div className="flexbox-col dc__gap-8 py-6">
        <div className="flexbox-col dc__gap-4">
            <h6 className="m-0 fs-12 fw-6 lh-18">Invalid YAML</h6>
            <p className="m-0 cn-50 fs-12 fw-4 lh-18 dc__truncate--clamp-3">
                {parsingError || DEFAULT_INVALID_YAML_ERROR}
            </p>
        </div>

        {restoreLastSavedYAML && (
            <button
                type="button"
                data-testid="restore-last-saved-yaml"
                className="flexbox dc__gap-6 dc__transparent cn-0 fs-12 fw-6 lh-20 p-0 dc__align-items-center"
                onClick={restoreLastSavedYAML}
            >
                <ICArrowCounterClockwise className="dc__no-shrink icon-dim-16 scn-0" />
                Restore last saved YAML
            </button>
        )}
    </div>
)
