import React, { Component } from 'react'
import { PaginationProps, PaginationState, Page } from './types'
import './pagination.css'

const VISIBLE_PAGES_LIMIT = 5

export class Pagination extends Component<PaginationProps, PaginationState> {
    node

    constructor(props) {
        super(props)
        const pages = this.createPageArr(this.props.size, this.props.pageSize, 1)
        let options =
            props.pageSizeOptions?.length > 0
                ? props.pageSizeOptions
                : [
                      { value: 20, selected: true },
                      { value: 40, selected: false },
                      { value: 50, selected: false },
                  ]
        options = options.map((option) => {
            return {
                value: option.value,
                selected: option.value === this.props.pageSize,
            }
        })
        this.state = {
            show: false,
            options,
            pages,
        }
    }

    componentDidMount() {
        window.addEventListener('mousedown', this.handleClick)
        const pageNo = 1 + Math.floor(this.props.offset / this.props.pageSize)
        const pages = this.createPageArr(this.props.size, this.props.pageSize, pageNo)
        this.setState({ pages })
    }

    componentDidUpdate(prevProps) {
        if (prevProps.size !== this.props.size || prevProps.pageSize !== this.props.pageSize) {
            const pages = this.createPageArr(this.props.size, this.props.pageSize, 1)
            this.setState({ pages })
        }
        if (prevProps.offset !== this.props.offset) {
            const pageNo = 1 + Math.floor(this.props.offset / this.props.pageSize)
            const pages = this.createPageArr(this.props.size, this.props.pageSize, pageNo)
            this.setState({ pages })
        }
    }

    componentWillUnmount() {
        window.removeEventListener('mousedown', this.handleClick)
    }

    selectPageSize(size: number) {
        const state = { ...this.state }
        state.options = state.options.map((option) => {
            return {
                value: option.value,
                selected: option.value === size,
            }
        })
        state.show = false
        this.setState(state)
        this.props.changePageSize(size)
    }

    selectPrevPage(): void {
        const currPage = this.state.pages.find((page) => page.selected)
        const pageNo = currPage.value - 1
        this.selectPage(pageNo)
    }

    selectPage(pageNo: number): void {
        const pages = this.createPageArr(this.props.size, this.props.pageSize, pageNo)
        this.setState({ pages })
        this.props.changePage(pageNo)
    }

    selectNextPage(): void {
        const currPage = this.state.pages.find((page) => page.selected)
        const pageNo = currPage.value + 1
        this.selectPage(pageNo)
    }

    createPageArr(size: number, pageSize: number, selectedPageNo: number): Page[] {
        const arr = []
        const numberOfPages = Math.ceil(size / pageSize)
        const lowerBound = selectedPageNo - 2 < 1 ? 1 : selectedPageNo - 2
        const upperBound = selectedPageNo + 2 > numberOfPages ? numberOfPages : selectedPageNo + 2
        for (let i = 1; i <= numberOfPages; i++) {
            arr.push({
                value: i,
                selected: i === selectedPageNo,
                isVisible: upperBound - VISIBLE_PAGES_LIMIT < i && i < lowerBound + VISIBLE_PAGES_LIMIT,
            })
        }
        return arr
    }

    handleClick = (event: MouseEvent): void => {
        event.stopPropagation()
        if (this.node && this.node.contains(event.target)) {
        } else {
            this.setState({ show: false })
        }
    }

    renderPages() {
        const pageNoIndex = this.state.pages.findIndex((page) => page.selected)
        const visiblePages = this.state.pages.filter((page) => page.isVisible)

        return (
            <ul className="pagination">
                <li className="page">
                    <button
                        className="page__button page__button--icon"
                        disabled={pageNoIndex === 0}
                        onClick={() => {
                            this.selectPrevPage()
                        }}
                    >
                        <span className="left-icon">
                            <i className="fa fa-chevron-left" />
                        </span>
                    </button>
                </li>
                {visiblePages.map((page, index) => {
                    const classes = page.selected ? 'page__button page__button--selected' : 'page__button'
                    return (
                        <li key={index} className="page">
                            <button
                                className={classes}
                                onClick={() => {
                                    this.selectPage(page.value)
                                }}
                            >
                                {page.value}
                            </button>
                        </li>
                    )
                })}
                <li className="page">
                    <button
                        className="page__button page__button--icon"
                        disabled={pageNoIndex === this.state.pages.length - 1}
                        onClick={() => {
                            this.selectNextPage()
                        }}
                    >
                        <span className="left-icon">
                            <i className="fa fa-chevron-right" />
                        </span>
                    </button>
                </li>
            </ul>
        )
    }

    renderDropdown() {
        const pageSize = this.state.options.find((option) => option.selected)
        const font = this.state.show ? 'fa fa-caret-up' : 'fa fa-caret-down'
        return (
            <div className="select">
                <span className="select__placeholder">Rows per page</span>
                <div ref={(node) => (this.node = node)}>
                    {this.state.show ? (
                        <div className="pagination__select-menu">
                            {' '}
                            {this.state.options.map((option, index) => {
                                return (
                                    <div
                                        key={index}
                                        className="select__item"
                                        onClick={() => {
                                            this.selectPageSize(option.value)
                                        }}
                                    >
                                        {option.value}
                                    </div>
                                )
                            })}
                        </div>
                    ) : null}
                    <button
                        type="button"
                        className="select__button"
                        onClick={() => {
                            this.setState({ show: !this.state.show })
                        }}
                    >
                        <span>{pageSize ? pageSize.value : ''}</span>
                        <span className="select__icon">
                            <i className={font} />
                        </span>
                    </button>
                </div>
            </div>
        )
    }

    renderPageInfo() {
        const end =
            this.props.offset + this.props.pageSize < this.props.size
                ? this.props.offset + this.props.pageSize
                : this.props.size
        return (
            <div className="page-number">
                {this.props.offset + 1} - {end} of {this.props.size}
            </div>
        )
    }

    render() {
        return (
            <div className={`pagination-wrapper ${this.props.rootClassName || ''}`}>
                {this.renderPageInfo()}
                {this.renderPages()}
                {!this.props.isPageSizeFix && this.renderDropdown()}
            </div>
        )
    }
}
