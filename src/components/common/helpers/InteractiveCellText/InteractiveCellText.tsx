import { Tooltip } from '@devtron-labs/devtron-fe-common-lib'
import { InteractiveCellTextProps } from './types'

export const InteractiveCellText = ({ text, linkRedirectsTo, dataTestId }: InteractiveCellTextProps) => (
    <Tooltip content={text} placement="bottom" showOnTruncate={!!text} className="mxh-210 dc__overflow-auto">
        {typeof linkRedirectsTo === 'function' ? (
            <button
                type="button"
                onClick={linkRedirectsTo}
                className="flex left dc__unset-button-styles lh-20 dc__ellipsis-right fs-13 cb-5 dc__no-decor cursor"
                data-testid={dataTestId}
            >
                {text || '-'}
            </button>
        ) : (
            <p className="lh-20 dc__ellipsis-right m-0 fs-13" data-testid={dataTestId}>
                {text || '-'}
            </p>
        )}
    </Tooltip>
)
