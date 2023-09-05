import React, { useState, useRef } from 'react'
import Draggable from 'react-draggable'
import Tippy from '@tippyjs/react'
import DebouncedSearch from '../DebouncedSearch/DebouncedSearch'
import { FloatingVariablesSuggestionsProps, RenderSuggestionsItemProps } from './types'
import { ReactComponent as ICDrag } from '../../../assets/icons/drag.svg'
import { ReactComponent as ICGridView } from '../../../assets/icons/ic-grid-view.svg'
import { ReactComponent as ICClose } from '../../../assets/icons/ic-close.svg'
import { ReactComponent as Clipboard } from '../../../assets/icons/ic-copy.svg'
import SearchSvg from '../../../assets/icons/ic-search.svg'

export default function FloatingVariablesSuggestions({ zIndex }: FloatingVariablesSuggestionsProps) {
    const variables = [
        {
            variableName: 'First Name',
            variableDescription: 'First name of the user',
            variableValue: 'John',
        },
        {
            variableName: 'Last Name',
            variableDescription: 'Last name of the user',
            variableValue: 'Doe',
        },
        {
            variableName: 'Email',
            variableDescription: 'Email of the user',
            variableValue: 'email@gmail.com',
        },
        {
            variableName: 'Phone',
            variableDescription: 'Phone of the user',
            variableValue: '1234567890',
        },
        {
            variableName: 'Address',
            variableDescription: 'Address of the user',
            variableValue: '123, Street, City, State, Country',
        },
        {
            variableName: 'Company',
            variableDescription:
                'Company of the user, It is used to send the email to the user, this is the company name, not the email address',
            variableValue: 'Company Name',
        },
        {
            variableName: 'Website',
            variableDescription:
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, vitae aliquam, Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, vitae aliquam',
            variableValue: 'https://www.website.com',
        },
    ]
    const [isActive, setIsActive] = useState(false)
    // In case of StrictMode, we get error findDOMNode is deprecated in StrictMode
    // So we use useRef to get the DOM node
    const nodeRef = useRef(null)
    const [suggestions, setSuggestions] = useState(variables)

    const handleActivation = () => {
        setIsActive(true)
    }

    const handleDeActivation = (e: React.MouseEvent<HTMLOrSVGElement, MouseEvent>) => {
        e.stopPropagation()
        setIsActive(false)
    }

    const onSearch = (text: string) => {
        const filteredSuggestions = variables.filter((variable) =>
            variable.variableName.toLowerCase().includes(text.toLowerCase()),
        )
        setSuggestions(filteredSuggestions)
    }

    const renderVariableItem = ({
        variableName,
        variableDescription,
        variableValue,
    }: RenderSuggestionsItemProps): JSX.Element => (
        <Tippy className="default-tt" content={variableValue} placement="left" key={variableName}>
            <div className="flexbox-col pt-8 pb-8 pl-12 pr-12 dc__align-self-stretch bcn-0 dc__border-bottom-n1">
                <div className="flexbox dc__align-items-center dc__gap-2">
                    <p className="m-0 fs-13 fw-6 lh-20 cn-9">
                        {'{{'}
                        {variableName}
                        {'}}'}
                    </p>

                    <div className="icon-dim-16 ml-8">
                        <Clipboard onClick={() => {}} className="icon-dim-16 cursor" />
                    </div>
                </div>

                <div className="flexbox dc__align-items-center">
                    <p className="m-0 dc__ellipsis-right__2nd-line fs-12 fw-4 lh-18">{variableDescription}</p>
                </div>
            </div>
        </Tippy>
    )

    return (
        <Draggable bounds="parent" handle=".handle-drag" nodeRef={nodeRef}>
            {isActive ? (
                <div
                    ref={nodeRef}
                    className="flex column dc__no-shrink w-356 dc__content-space dc__border-radius-8-imp dc__border-n7 dc__overflow-hidden"
                    style={{
                        zIndex,
                        height: '504px',
                        boxShadow: '0px 4px 8px 0px rgba(0, 0, 0, 0.25)',
                    }}
                >
                    <div className="flexbox-col dc__align-self-stretch">
                        <div className="handle-drag flexbox pt-8 pl-12 pr-12 dc__gap-16 dc__align-start dc__align-self-stretch bcn-7">
                            <div className="flexbox-col dc__content-center dc__align-start flex-grow-1 dc__no-shrink">
                                <p className="m-0 cn-0 fs-13 fw-6 lh-20 dc__align-self-stretch">Scoped variables</p>

                                <p className="dc__align-self-stretch c-n50 fs-12 fw-4 lh-20">
                                    Use variable to set dynamic value
                                </p>
                            </div>

                            <ICClose className="fcn-0 icon-dim-20 cursor" onClick={handleDeActivation} />
                        </div>

                        <div className="flexbox dc__align-self-stretch pt-8 pb-8 pl-12 pr-12 bcn-0">
                            <DebouncedSearch
                                onSearch={onSearch}
                                placeholder="Search variables"
                                containerClass="flexbox flex-grow-1 pt-8 pb-8 pl-10 pr-10 dc__gap-8 dc__align-self-stretch dc__align-items-center bc-n50 dc__border dc__border-radius-4-imp"
                                inputClass="flex-grow-1 dc__no-border dc__outline-none-imp bc-n50 lh-20 fs-13 cn-5 fw-4 p-0"
                                debounceTimeout={500}
                                icon={SearchSvg}
                                iconClass="icon-dim-16 scn-6"
                            />
                        </div>
                    </div>

                    <div className="flexbox-col dc__align-self-stretch dc__overflow-scroll bcn-0 flex-grow-1">
                        {suggestions.map((variable) => renderVariableItem(variable))}
                    </div>

                    <div className="flexbox dc__align-self-stretch dc__align-items-center pt-12 pb-12 pl-10 pr-10 bcv-1 m-0 fs-13 fw-4 lh-20 cn-9">
                        Type &nbsp;<span className="fw-6">{'{{}}'}</span>&nbsp; to use a variable instead of fixed
                        value.
                    </div>
                </div>
            ) : (
                <button
                    className="bcn-7 dc__outline-none-imp dc__border-n0 br-48 flex h-40 pt-8 pb-8 pl-12 pr-12 dc__gap-8 dc__no-shrink"
                    style={{ zIndex, boxShadow: '0px 4px 8px 0px rgba(0, 0, 0, 0.20)' }}
                    ref={nodeRef}
                    onClick={handleActivation}
                >
                    <ICDrag className="handle-drag scn-4 icon-dim-20" onClick={(e) => e.stopPropagation()} />
                    {/* DUMMY ICON */}
                    <ICGridView className="scn-0 icon-dim-20" />
                </button>
            )}
        </Draggable>
    )
}
