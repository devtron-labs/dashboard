import React, { Component } from 'react'
import { PaginationProps, PaginationState, Page } from './types'
import './pagination.css'

const VISIBLE_PAGES_LIMIT = 5

export class Pagination extends Component<PaginationProps, PaginationState> {
    node

    constructor(props) {
        super(props)
        let pages = this.createPageArr(this.props.size, this.props.pageSize, 1)
        let options = [
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
            options: options,
            pages: pages,
        }
    }

    componentDidMount() {
        window.addEventListener('mousedown', this.handleClick)
        let pageNo = 1 + Math.floor(this.props.offset / this.props.pageSize)
        let pages = this.createPageArr(this.props.size, this.props.pageSize, pageNo)
        this.setState({ pages })
    }

    componentDidUpdate(prevProps) {
        if (prevProps.size !== this.props.size || prevProps.pageSize !== this.props.pageSize) {
            let pages = this.createPageArr(this.props.size, this.props.pageSize, 1)
            this.setState({ pages: pages })
        }
        if (prevProps.offset !== this.props.offset) {
            let pageNo = 1 + Math.floor(this.props.offset / this.props.pageSize)
            let pages = this.createPageArr(this.props.size, this.props.pageSize, pageNo)
            this.setState({ pages: pages })
        }
    }
    componentWillUnmount() {
        window.removeEventListener('mousedown', this.handleClick)
    }

    selectPageSize(size: number) {
        let state = { ...this.state }
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
        let currPage = this.state.pages.find((page) => page.selected)
        let pageNo = currPage.value - 1
        this.selectPage(pageNo)
    }

    selectPage(pageNo: number): void {
        let pages = this.createPageArr(this.props.size, this.props.pageSize, pageNo)
        this.setState({ pages })
        this.props.changePage(pageNo)
    }

    selectNextPage(): void {
        let currPage = this.state.pages.find((page) => page.selected)
        let pageNo = currPage.value + 1
        this.selectPage(pageNo)
    }

    createPageArr(size: number, pageSize: number, selectedPageNo: number): Page[] {
        let arr = []
        let numberOfPages = Math.ceil(size / pageSize)
        let lowerBound = selectedPageNo - 2 < 1 ? 1 : selectedPageNo - 2
        let upperBound = selectedPageNo + 2 > numberOfPages ? numberOfPages : selectedPageNo + 2
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
        let pageNoIndex = this.state.pages.findIndex((page) => page.selected)
        let visiblePages = this.state.pages.filter((page) => page.isVisible)

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
                            <i className="fa fa-chevron-left"></i>
                        </span>
                    </button>
                </li>
                {visiblePages.map((page, index) => {
                    let classes = page.selected ? 'page__button page__button--selected' : 'page__button'
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
                            <i className="fa fa-chevron-right"></i>
                        </span>
                    </button>
                </li>
            </ul>
        )
    }

    renderDropdown() {
        let pageSize = this.state.options.find((option) => option.selected)
        let font = this.state.show ? 'fa fa-caret-up' : 'fa fa-caret-down'
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
                            <i className={font}></i>
                        </span>
                    </button>
                </div>
            </div>
        )
    }

    renderPageInfo() {
        let end =
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
            <div className="pagination-wrapper">
                {this.renderPageInfo()}
                {this.renderPages()}
                {!this.props.isPageSizeFix && this.renderDropdown()}
            </div>
        )
    }
}
