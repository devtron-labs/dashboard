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

import { useEffect, useState } from 'react'
import PageSizeSelector from './PageSizeSelector'
import { Page, PageValueItemProps, PaginationProps } from './types'
import { createPageArr } from './utils'
import './pagination.scss'

const PageValueItem = ({ value, isSelected, selectPage }: PageValueItemProps) => {
    const classes = isSelected ? 'page__button page__button--selected' : 'page__button'
    const handlePageSelection = () => {
        selectPage(value)
    }

    return (
        <li className="page">
            <button className={classes} onClick={handlePageSelection} type="button">
                {value}
            </button>
        </li>
    )
}

// NOTE: This component will heavily benefit from data normalization
const Pagination = ({
    size,
    pageSize,
    offset,
    changePage,
    changePageSize,
    isPageSizeFix,
    pageSizeOptions,
    rootClassName,
}: PaginationProps) => {
    const [pages, setPages] = useState<Page[]>([])

    useEffect(() => {
        const _pages = createPageArr({ size, pageSize, selectedPageNo: 1 })
        setPages(_pages)
    }, [size, pageSize])

    useEffect(() => {
        const selectedPageNo = 1 + Math.floor(offset / pageSize)
        const _pages = createPageArr({ size, pageSize, selectedPageNo })
        setPages(_pages)
    }, [offset])

    const selectPage = (selectedPageNo: number): void => {
        const _pages = createPageArr({ size, pageSize, selectedPageNo })
        setPages(_pages)
        changePage(selectedPageNo)
    }

    const selectPreviousPage = (): void => {
        const currPage = pages.find((page) => page.selected)
        const selectedPageNo = currPage.value - 1
        selectPage(selectedPageNo)
    }

    const selectNextPage = (): void => {
        const currPage = pages.find((page) => page.selected)
        const selectedPageNo = currPage.value + 1
        selectPage(selectedPageNo)
    }

    const lastPageNo = offset + pageSize < size ? offset + pageSize : size
    const pageNoIndex = pages.findIndex((page) => page.selected)
    const visiblePages = pages.filter((page) => page.isVisible)
    return (
        <div className={rootClassName || ''}>
            <div className="page-number">
                {offset + 1} - {lastPageNo} of {size}
            </div>

            <ul className="pagination">
                <li className="page">
                    <button
                        className="page__button page__button--icon"
                        disabled={!pageNoIndex}
                        onClick={selectPreviousPage}
                        type="button"
                        aria-label="Previous page"
                    >
                        <span className="left-icon">
                            <i className="fa fa-chevron-left" />
                        </span>
                    </button>
                </li>

                {visiblePages.map((page) => (
                    <PageValueItem
                        value={page.value}
                        isSelected={page.selected}
                        key={page.value}
                        selectPage={selectPage}
                    />
                ))}

                <li className="page">
                    <button
                        className="page__button page__button--icon"
                        disabled={pageNoIndex === pages.length - 1}
                        onClick={selectNextPage}
                        type="button"
                        aria-label="Next page"
                    >
                        <span className="left-icon">
                            <i className="fa fa-chevron-right" />
                        </span>
                    </button>
                </li>
            </ul>

            {!isPageSizeFix && (
                <div className="select">
                    <span className="select__placeholder">Rows per page</span>
                    <PageSizeSelector
                        pageSizeOptions={pageSizeOptions}
                        pageSize={pageSize}
                        changePageSize={changePageSize}
                    />
                </div>
            )}
        </div>
    )
}

export default Pagination
