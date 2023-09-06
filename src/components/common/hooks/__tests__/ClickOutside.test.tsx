import React, { useRef } from 'react'
import { fireEvent, render } from '@testing-library/react'
import { useClickOutside } from '../ClickOutside'

describe('hooks', () => {
    describe('useClickOutside', () => {
        it('should call the callback when clicked outside', () => {
            const mockCallback = jest.fn()
            const DummyComponent = () => {
                const ref = useRef(null)
                useClickOutside(ref, mockCallback)
                return <div ref={ref}></div>
            }
            render(<DummyComponent />)
            fireEvent.click(document)
            expect(mockCallback).toHaveBeenCalled()
        })

        it('should not call the callback when clicked inside', () => {
            const mockCallback = jest.fn()
            const DummyComponent = () => {
                const ref = useRef(null)
                useClickOutside(ref, mockCallback)
                return (
                    <>
                        <div ref={ref}>
                            <button className="test-class" />
                        </div>
                    </>
                )
            }
            const { container } = render(<DummyComponent />)
            const button = container.querySelector('.test-class')
            if (button) fireEvent.click(button)
            expect(mockCallback).not.toHaveBeenCalled()
        })
    })
})
