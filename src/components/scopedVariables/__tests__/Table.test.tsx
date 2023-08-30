import React from 'react'
import { render } from '@testing-library/react'
import { TableList, TableItem } from '../Table'

describe('Table', () => {
    describe('When TableList mounts', () => {
        it('should have all the headings with the correct width', () => {
            const headings = ['heading1', 'heading2', 'heading3']
            const width = ['100px', '200px', '300px']
            const { container } = render(<TableList headings={headings} width={width} />)
            const headingElements = container.querySelectorAll('.scoped-variables-list-header > div')
            expect(headingElements.length).toBe(3)
            headingElements.forEach((headingElement, index) => {
                expect(headingElement.getAttribute('style')).toBe(`width: ${width[index]};`)
                expect(headingElement.querySelector('.scoped-variables-list-item__heading')?.textContent).toBe(
                    headings[index],
                )
            })
        })

        it('should have all the children', () => {
            const { container } = render(
                <TableList>
                    <p>children</p>
                </TableList>,
            )
            expect(container.querySelector('.scoped-variables-list-container > p')?.textContent).toBe('children')
        })
    })

    describe('TableItem', () => {
        it('should have all the data with the correct width', () => {
            const columnsData = ['data1', 'data2', 'data3']
            const width = ['100px', '200px', '300px']
            const { container } = render(<TableItem columnsData={columnsData} width={width} />)
            const dataElements = container.querySelectorAll('.scoped-variables-list-item > div')
            expect(dataElements.length).toBe(3)
            dataElements.forEach((dataElement, index) => {
                expect(dataElement.getAttribute('style')).toBe(`width: ${width[index]};`)
                expect(dataElement.querySelector('.scoped-variables-list-item__data')?.textContent).toBe(
                    columnsData[index],
                )
            })
        })
    })
})
