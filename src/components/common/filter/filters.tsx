import React, { Component } from 'react'
import { Progressing } from '@devtron-labs/devtron-fe-common-lib'
import { FilterProps, FilterState } from './types'
import { ReactComponent as ErrorExclamationIcon } from '../../../assets/icons/ic-error-exclamation.svg'
import './filter.css'
import Tippy from '@tippyjs/react'
import { replaceLastOddBackslash } from '../../../util/Util'
import { AppListConstants } from '../../../config'

export class Filter extends Component<FilterProps, FilterState> {
    node

    constructor(props) {
        super(props)
        this.state = {
            list: this.props.list.map((item) => {
                return { ...item }
            }),
            filteredList: this.props.list.map((item) => {
                return { ...item }
            }),
            searchStr: '',
            show: false,
        }
    }

    componentDidMount() {
        const list = JSON.parse(JSON.stringify(this.props.list))
        this.setState({ list, filteredList: list })
    }

    componentWillReceiveProps(nextProps) {
        const _searchKey = this._getSearchKey()
        const list = JSON.parse(JSON.stringify(nextProps.list))
        const filteredList = list.filter(
            (item) => item[_searchKey]?.search(replaceLastOddBackslash(this.state.searchStr).toLocaleLowerCase()) != -1,
        )
        this.setState({ list, filteredList })
    }

    handleClick = (event: React.MouseEvent): void => {
        event.stopPropagation()
        const _show = false
        const list = JSON.parse(JSON.stringify(this.props.list))
        this.setState({ list, filteredList: list, searchStr: '', show: _show })
        this.notifiyShowHideFilterContent(_show)
    }

    handleSearch = (event): void => {
        const _searchKey = this._getSearchKey()
        const searchStr = event.target.value
        const filteredList = this.state.list.filter((item) => {
            if (item[_searchKey].toLowerCase().search(replaceLastOddBackslash(searchStr).toLocaleLowerCase()) != -1) {
                return {
                    key: item.key,
                    label: item.label,
                    isSaved: item.isSaved,
                    isChecked: item.isChecked,
                }
            }
        })
        this.setState({ filteredList, searchStr })
    }

    handleSelection = (event) => {
        let { list } = this.state
        list = list.map((item) => {
            return {
                ...item,
                isChecked: event.target.value == item.key ? event.target.checked : item.isChecked,
                isSaved: event.target.value == item.key ? !item.isSaved : item.isSaved,
            }
        })
        const searchStr = replaceLastOddBackslash(this.state.searchStr)
        const filteredList = list.filter((item) => item.label.search(searchStr.toLocaleLowerCase()) != -1)
        this.setState({ list, filteredList })
    }

    shouldApplyFilter = (): boolean => {
        const unsavedFilters = this.state.list.filter((item) => !item.isSaved) || []
        return !(unsavedFilters.length > 0)
    }

    applyFilter = (): void => {
        const _show = false
        this.setState({ show: _show })
        this.props.applyFilter(this.props.type, this.state.list)
        this.notifiyShowHideFilterContent(_show)
    }

    getSavedFilter = (): number => {
        let count = 0
        this.props.list.map((item) => {
            if (item.isChecked) {
                count++
            }
        })
        return count
    }

    onFilterButtonClick = (): void => {
        const _show = !this.state.show
        this.setState({ show: _show })
        this.notifiyShowHideFilterContent(_show)
    }

    notifiyShowHideFilterContent = (show: boolean): void => {
        if (this.props.onShowHideFilterContent) {
            this.props.onShowHideFilterContent(show)
        }
    }

    _getSearchKey = (): string => {
        const _searchKey = this.props.searchKey || this.props.labelKey
        return _searchKey
    }

    render() {
        const classNames = `filter__menu ${this.props.appType !== AppListConstants.AppType.ARGO_APPS ? `filter__menu-${this.props.position === 'right' ? 'right' : 'left'}` : 'dc__right-0'} ${
            this.state.show ? 'filter__menu--show' : ''
        }`
        const faIcon = this.state.show ? 'fa fa-caret-up' : 'fa fa-caret-down'
        const isDisable = this.shouldApplyFilter()
        const badge = this.props.badgeCount ? this.props.badgeCount : this.getSavedFilter()

        let filterOptions = this.state.filteredList.map((env, index) => {
            return (
                <label
                    key={index}
                    className={`filter-element ${this.props.isFirstLetterCapitalize ? 'dc__first-letter-capitalize' : ''} ${!env.key ? 'fw-6' : 'fw-4'}`}
                >
                    <input
                        type="checkbox"
                        className="filter-element__input"
                        value={env.key}
                        checked={env.isChecked}
                        onChange={this.handleSelection}
                    />
                    {this.props.isLabelHtml ? (
                        <div dangerouslySetInnerHTML={{ __html: env[this.props.labelKey] }} />
                    ) : (
                        <span>{env[this.props.labelKey]}</span>
                    )}

                    <span className="filter-element__checkmark" />
                </label>
            )
        })

        if (filterOptions.length == 0) {
            filterOptions = [
                <p key="none" className="filter__no-result">
                    {this.state.searchStr.length ? 'No Matching Results' : 'No Filters Found'}
                </p>,
            ]
        }

        return (
            <div className={`filter ${this.props.rootClassName || ''}`}>
                {(!this.props.isDisabled || !this.props.disableTooltipMessage) && (
                    <div>
                        {this.props.showPulsatingDot && !this.state.show && <div className="pulse-highlight" />}
                        <button
                            data-testid={`${this.props.dataTestId}-button`}
                            type="button"
                            className="filter__trigger"
                            onClick={() => this.onFilterButtonClick()}
                        >
                            {this.props.buttonText}
                            {badge > 0 ? <span className="badge">{badge}</span> : null}
                            <span className="filter-icon">
                                <i className={faIcon} />
                            </span>
                        </button>
                    </div>
                )}
                {this.props.isDisabled && this.props.disableTooltipMessage && (
                    <Tippy
                        className="default-tt"
                        arrow
                        placement="top"
                        content={this.props.disableTooltipMessage}
                        hideOnClick={false}
                    >
                        <button type="button" className="filter__trigger disable__button">
                            {this.props.buttonText}
                            <span className="filter-icon">
                                <i className={faIcon} />
                            </span>
                        </button>
                    </Tippy>
                )}
                {!this.props.isDisabled && (
                    <>
                        {this.state.show ? <div className="dc__transparent-div" onClick={this.handleClick} /> : null}
                        <div className={classNames} ref={(node) => (this.node = node)}>
                            {this.props.loading ? (
                                <Progressing />
                            ) : this.props.errored ? (
                                <div className="flex w-100 h-100 column">
                                    <div className="mr-8 flex">
                                        <ErrorExclamationIcon className="icon-dim-20" />
                                    </div>
                                    <div className="flex">{this.props.errorMessage}</div>
                                    <div className="flex">
                                        <button
                                            className="btn btn-link p-0 fw-6 cb-5"
                                            onClick={() => {
                                                this.props.errorCallbackFunction()
                                            }}
                                        >
                                            Retry
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {this.props.searchable && (
                                        <input
                                            type="text"
                                            placeholder={this.props.placeholder}
                                            className="filter__search"
                                            onChange={this.handleSearch}
                                            value={this.state.searchStr}
                                            data-testid={`${this.props.dataTestId}-search`}
                                        />
                                    )}
                                    <div
                                        className="filter__options"
                                        data-testid={`${this.props.dataTestId}-optionlist`}
                                    >
                                        {filterOptions}
                                    </div>
                                    {this.props.multi && (
                                        <button
                                            type="button"
                                            data-testid={`${this.props.buttonText}-apply-filter-button`}
                                            className="filter__apply"
                                            disabled={isDisable}
                                            onClick={() => {
                                                this.applyFilter()
                                            }}
                                        >
                                            Apply Filter
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </>
                )}
            </div>
        )
    }
}
