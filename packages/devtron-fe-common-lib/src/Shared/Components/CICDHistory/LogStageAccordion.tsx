import DOMPurify from 'dompurify'
import { getTimeDifference } from '@Shared/Helpers'
import { RefCallback } from 'react'
import { LogStageAccordionProps } from './types'
import { getLogSearchIndex, getStageStatusIcon } from './utils'
import { ReactComponent as ICCaretDown } from '../../../Assets/Icon/ic-caret-down.svg'

const LogsItemContainer = ({ children }: { children: React.ReactNode }) => (
    <div className="display-grid dc__column-gap-10 dc__align-start logs-renderer__log-item">{children}</div>
)

const LogStageAccordion = ({
    stage,
    isOpen,
    logs,
    endTime,
    startTime,
    status,
    handleStageClose,
    handleStageOpen,
    stageIndex,
    isLoading,
    fullScreenView,
    searchIndex,
}: LogStageAccordionProps) => {
    const handleAccordionToggle = () => {
        if (isOpen) {
            handleStageClose(stageIndex)
        } else {
            handleStageOpen(stageIndex)
        }
    }

    const getFormattedTimeDifference = (): string => {
        const timeDifference = getTimeDifference(startTime, endTime)
        if (timeDifference === '0s') {
            return '< 1s'
        }
        return timeDifference
    }

    const scrollIntoView: RefCallback<HTMLSpanElement> = (node) => {
        if (!node) {
            return
        }

        if (node.dataset.containsMatch === 'true' && node.dataset.triggered !== 'true') {
            // eslint-disable-next-line no-param-reassign
            node.dataset.triggered = 'true'
            // TODO: this will additionally scroll the top most scrollbar. Need to check into that
            node.scrollIntoView({ block: 'center', behavior: 'smooth' })
        }

        if (node.dataset.containsMatch === 'false') {
            // eslint-disable-next-line no-param-reassign
            node.dataset.triggered = 'false'
        }
    }

    return (
        <div className="flexbox-col dc__gap-8">
            <button
                className={`flexbox dc__transparent dc__content-space py-6 px-8 br-4 dc__align-items-center dc__select-text logs-renderer__stage-accordion ${
                    isOpen ? 'logs-renderer__stage-accordion--open-stage' : ''
                } dc__position-sticky dc__zi-1 ${fullScreenView ? 'dc__top-44' : 'dc__top-80'}`}
                type="button"
                role="tab"
                onClick={handleAccordionToggle}
            >
                <div className="flexbox dc__gap-8 dc__transparent dc__align-items-center">
                    <ICCaretDown
                        className={`icon-dim-16 dc__no-shrink dc__transition--transform scn-0 ${!isOpen ? 'dc__flip-n90 dc__opacity-0_5' : ''}`}
                    />

                    <div className="flexbox dc__gap-12 dc__align-items-center">
                        {getStageStatusIcon(status)}

                        <h3 className="m-0 cn-0 fs-13 fw-4 lh-20 dc__word-break">{stage}</h3>
                    </div>
                </div>

                {!!endTime && <span className="cn-0 fs-13 fw-4 lh-20">{getFormattedTimeDifference()}</span>}
            </button>

            {isOpen && (
                <div className="flexbox-col dc__gap-4">
                    {logs.map((log: string, logsIndex: number) => {
                        const doesLineContainSearchMatch =
                            getLogSearchIndex({ stageIndex, lineNumberInsideStage: logsIndex }) === searchIndex

                        return (
                            <LogsItemContainer
                                // eslint-disable-next-line react/no-array-index-key
                                key={`logs-${stage}-${startTime}-${logsIndex}`}
                            >
                                <span
                                    ref={scrollIntoView}
                                    className="cn-4 col-2 lh-20 dc__text-align-end dc__word-break mono fs-14"
                                    data-contains-match={doesLineContainSearchMatch}
                                >
                                    {logsIndex + 1}
                                </span>
                                <p
                                    className="mono fs-14 mb-0-imp cn-0 dc__word-break lh-20"
                                    // eslint-disable-next-line react/no-danger
                                    dangerouslySetInnerHTML={{
                                        __html: DOMPurify.sanitize(log),
                                    }}
                                />
                            </LogsItemContainer>
                        )
                    })}

                    {isLoading && (
                        <LogsItemContainer>
                            <span />
                            <div className="dc__loading-dots cn-0" />
                        </LogsItemContainer>
                    )}
                </div>
            )}
        </div>
    )
}

export default LogStageAccordion
