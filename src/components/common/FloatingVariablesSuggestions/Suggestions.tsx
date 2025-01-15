/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useState, memo, useEffect } from 'react'
import {
    GenericEmptyState,
    Progressing,
    Reload,
    DebouncedSearch,
    Button,
    ComponentSizeType,
    ButtonVariantType,
    ButtonStyleType,
} from '@devtron-labs/devtron-fe-common-lib'
import SuggestionItem from './SuggestionItem'
import { ReactComponent as ICClose } from '../../../assets/icons/ic-cross.svg'
import { ReactComponent as ICSearch } from '../../../assets/icons/ic-search.svg'
import { ReactComponent as ICVariable } from '../../../assets/icons/ic-variable.svg'
import NoVariables from '../../../assets/img/no-artifact@2x.png'
import { SuggestionsProps, ScopedVariableType } from './types'
import SuggestionsInfo from './SuggestionsInfo'
import { NO_DEFINED_DESCRIPTION, NO_DEFINED_VALUE } from './constants'

const Suggestions = ({ handleDeActivation, loading, variables, reloadVariables, error }: SuggestionsProps) => {
    const [suggestions, setSuggestions] = useState<ScopedVariableType[]>(variables)
    const [clearSearch, setClearSearch] = useState<boolean>(false)
    const [highlightText, setHighlightText] = useState<string>('')

    const enableSearch = !loading && !error && !!variables?.length

    useEffect(() => {
        setSuggestions(variables)
    }, [variables])

    const onSearch = (text: string) => {
        // No need to check if variables exists since we are not even showing search bar if there are no variables
        const trimmedText = text.trim().toLowerCase()
        const filteredSuggestions = variables.filter(
            (variable) =>
                variable.variableName.toLowerCase().includes(trimmedText) ||
                variable.shortDescription?.toLowerCase().includes(trimmedText),
        )
        setSuggestions(filteredSuggestions)
        setHighlightText(trimmedText)
    }

    const handleClearSearch = () => {
        setClearSearch(!clearSearch)
    }

    const renderClearSearchButton = (): JSX.Element => (
        <button
            className="dc__outline-none-imp flexbox mw-56 pt-5 pb-5 pl-12 pr-12 dc__gap-8 dc__align-items-center dc__border-radius-4-imp dc__border bg__primary cb-5 fs-12 fw-6 lh-18 dc__align-center dc__hover-cn1 dc__hover-b500"
            onClick={handleClearSearch}
            type="button"
        >
            Clear Search
        </button>
    )

    const renderHeader = (): JSX.Element => (
        <div className="flexbox-col dc__align-self-stretch">
            <div className="handle-drag flexbox pt-8 pl-12 pr-12 dc__gap-16 dc__align-start dc__align-self-stretch dc__grabbable dc__border-bottom">
                <div className="flexbox-col dc__content-center dc__align-start flex-grow-1 dc__no-shrink">
                    <div className="flex center dc__gap-4">
                        <p className="m-0 cn-7 fs-13 fw-6 lh-20 dc__align-self-stretch">Scoped variables</p>

                        <ICVariable className="icon-dim-16 scn-7" />
                    </div>

                    <p className="dc__align-self-stretch cn-7 fs-12 fw-1 lh-20">Use variable to set dynamic value</p>
                </div>

                <div className="h-100">
                    <Button
                        icon={<ICClose />}
                        ariaLabel="Close suggestions"
                        showAriaLabelInTippy={false}
                        dataTestId="deactivate-suggestions"
                        onClick={handleDeActivation}
                        size={ComponentSizeType.xs}
                        variant={ButtonVariantType.borderLess}
                        style={ButtonStyleType.negativeGrey}
                    />
                </div>
            </div>

            {enableSearch && (
                <div
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault()
                        }
                    }}
                    className="flexbox dc__align-self-stretch pt-8 pb-8 pl-12 pr-12 bg__primary"
                >
                    <DebouncedSearch
                        onSearch={onSearch}
                        placeholder="Search variables"
                        containerClass="flexbox flex-grow-1 pt-8 pb-8 pl-10 pr-10 dc__gap-8 dc__align-self-stretch dc__align-items-center bg__secondary dc__border dc__border-radius-4-imp focus-within-border-b5 dc__hover-border-n300"
                        inputClass="flex-grow-1 dc__no-border dc__outline-none-imp bg__secondary lh-20 fs-13 cn-9 fw-4 p-0 placeholder-cn5"
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
            <div className="flexbox-col dc__align-self-stretch dc__overflow-auto bg__primary flex-grow-1">
                {suggestions.length ? (
                    suggestions.map((variable) => (
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
                <div className="flexbox-col dc__align-self-stretch dc__overflow-auto bg__primary flex-grow-1 h-200">
                    <Progressing pageLoader size={32} />
                </div>
            )
        }

        if (variables?.length === 0) {
            return (
                <>
                    <div className="flexbox-col dc__align-self-stretch dc__overflow-auto flex-grow-1 h-250">
                        <GenericEmptyState title="No variables found" image={NoVariables} />
                    </div>

                    <SuggestionsInfo />
                </>
            )
        }

        if (!enableSearch) {
            return <Reload reload={reloadVariables} className="bg__primary pb-16" />
        }

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
