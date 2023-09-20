import React, { useState, memo, useCallback, useEffect } from 'react'
import { GenericEmptyState, Progressing, Reload } from '@devtron-labs/devtron-fe-common-lib'
import DebouncedSearch from '../DebouncedSearch/DebouncedSearch'
import SuggestionItem from './SuggestionItem'
import { ReactComponent as ICClose } from '../../../assets/icons/ic-cross.svg'
import { ReactComponent as ICSearch } from '../../../assets/icons/ic-search.svg'
import NoVariables from '../../../assets/img/no-artifact@2x.png'
import { SuggestionsProps, SuggestionType } from './types'
import SuggestionsInfo from './SuggestionsInfo'
import { NO_DEFINED_DESCRIPTION, NO_DEFINED_VALUE } from './constants'

function Suggestions({ handleDeActivation, loading, variables, reloadVariables, error }: SuggestionsProps) {
    const [suggestions, setSuggestions] = useState<SuggestionType[]>(variables)
    const [clearSearch, setClearSearch] = useState<boolean>(false)
    const [highlightText, setHighlightText] = useState<string>('')

    const enableSearch = !loading && !error && !!variables?.length

    useEffect(() => {
        setSuggestions(variables)
    }, [variables])

    const onSearch = useCallback(
        (text: string) => {
            // No need to check if variables exists since we are not even showing search bar if there are no variables
            const filteredSuggestions = variables.filter(
                (variable) =>
                    variable.variableName.toLowerCase().includes(text.trim().toLowerCase()) ||
                    variable.shortDescription?.toLowerCase().includes(text.trim().toLowerCase()),
            )
            setSuggestions(filteredSuggestions)
            setHighlightText(text.trim())
        },
        [variables],
    )

    const handleClearSearch = useCallback(() => {
        setClearSearch(!clearSearch)
    }, [clearSearch])

    const renderClearSearchButton = useCallback(
        (): JSX.Element => (
            <button
                className="dc__outline-none-imp flexbox mw-56 pt-5 pb-5 pl-12 pr-12 dc__gap-8 dc__align-items-center dc__border-radius-4-imp dc__border bcn-0 cb-5 fs-12 fw-6 lh-18 dc__align-center dc__hover-cn1 dc__hover-b500"
                onClick={handleClearSearch}
                type="button"
            >
                Clear Search
            </button>
        ),
        [handleClearSearch],
    )

    const renderHeader = (): JSX.Element => (
        <div className="flexbox-col dc__align-self-stretch">
            <div className="handle-drag flexbox pt-8 pl-12 pr-12 dc__gap-16 dc__align-start dc__align-self-stretch bcn-7 dc__grabbable">
                <div className="flexbox-col dc__content-center dc__align-start flex-grow-1 dc__no-shrink">
                    <p className="m-0 cn-0 fs-13 fw-6 lh-20 dc__align-self-stretch">Scoped variables</p>

                    <p className="dc__align-self-stretch c-n50 fs-12 fw-4 lh-20">Use variable to set dynamic value</p>
                </div>

                <div className="h-100">
                    <button
                        type="button"
                        className="dc__outline-none-imp dc__no-border p-0 bcn-7 h-20"
                        onClick={handleDeActivation}
                        data-testid="deactivate-suggestions"
                    >
                        <ICClose className="fcn-0 icon-dim-20 cursor" />
                    </button>
                </div>
            </div>

            {enableSearch && (
                <div className="flexbox dc__align-self-stretch pt-8 pb-8 pl-12 pr-12 bcn-0">
                    <DebouncedSearch
                        onSearch={onSearch}
                        placeholder="Search variables"
                        containerClass="flexbox flex-grow-1 pt-8 pb-8 pl-10 pr-10 dc__gap-8 dc__align-self-stretch dc__align-items-center bc-n50 dc__border dc__border-radius-4-imp focus-within-border-b5 dc__hover-border-n300"
                        inputClass="flex-grow-1 dc__no-border dc__outline-none-imp bc-n50 lh-20 fs-13 cn-9 fw-4 p-0 placeholder-cn5"
                        Icon={ICSearch}
                        iconClass="icon-dim-16"
                        clearSearch={clearSearch}
                    />
                </div>
            )}
        </div>
    )

    const renderSuggestions = (): JSX.Element => (
        <>
            <div className="flexbox-col dc__align-self-stretch dc__overflow-scroll bcn-0 flex-grow-1">
                {suggestions.length ? (
                    suggestions.map((variable: SuggestionType) => (
                        <SuggestionItem
                            key={variable.variableName}
                            variableName={variable.variableName}
                            description={
                                variable.shortDescription?.length ? variable.shortDescription : NO_DEFINED_DESCRIPTION
                            }
                            variableValue={variable.variableValue?.value ?? NO_DEFINED_VALUE}
                            isRedacted={variable.isRedacted}
                            highlightText={highlightText}
                        />
                    ))
                ) : (
                    <GenericEmptyState
                        title="No matching variable found"
                        isButtonAvailable
                        noImage
                        renderButton={renderClearSearchButton}
                        classname="h-200"
                    />
                )}
            </div>

            <SuggestionsInfo />
        </>
    )

    const renderBody = (): JSX.Element => {
        if (loading) {
            return (
                <div className="flexbox-col dc__align-self-stretch dc__overflow-scroll bcn-0 flex-grow-1 h-200">
                    <Progressing pageLoader size={32} />
                </div>
            )
        }

        if (variables?.length === 0) {
            return (
                <>
                    <div className="flexbox-col dc__align-self-stretch dc__overflow-scroll bcn-0 flex-grow-1 h-200 bcn-0">
                        <GenericEmptyState title="No variables found" image={NoVariables} />
                    </div>

                    <SuggestionsInfo />
                </>
            )
        }

        if (!enableSearch) return <Reload reload={reloadVariables} className="bcn-0 pb-16" />

        return renderSuggestions()
    }

    return (
        <>
            {renderHeader()}
            {renderBody()}
        </>
    )
}

export default memo(Suggestions)
