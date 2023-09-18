import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import DeploymentConfigToolbar from '../DeploymentConfigToolbar'

describe('DeploymentConfigToolbar', () => {
    const defaultProps = {
        selectedTabIndex: 1,
        handleTabSelection: jest.fn(),
        noReadme: false,
        showReadme: false,
        handleReadMeClick: jest.fn(),
        isValues: true,
        setIsValues: jest.fn(),
    }

    it('renders with the correct tabs and icons', () => {
        render(<DeploymentConfigToolbar {...defaultProps} />)

        const valuesTab = screen.queryByTestId('values-tab') as HTMLElement
        expect(valuesTab).toBeTruthy()

        const compareTab = screen.queryByTestId('compare-values-tab') as HTMLElement
        expect(compareTab).toBeTruthy()

        const dropdownIcon = screen.queryByTestId('dropdown-icon')
        expect(dropdownIcon).toBeTruthy()
    })

    it('renders the Readme icon when showReadme is false', () => {
        const propsWithReadme = {
            ...defaultProps,
            noReadme: false,
            showReadme: false,
        }

        render(<DeploymentConfigToolbar {...propsWithReadme} />)

        const readmeIcon = screen.queryByTestId('readme-icon')
        expect(readmeIcon).toBeTruthy()
    })

    it('handles tab selection', () => {
        render(<DeploymentConfigToolbar {...defaultProps} />)

        const compareTab = screen.queryByTestId('compare-values-tab') as HTMLElement
        fireEvent.click(compareTab)

        expect(defaultProps.handleTabSelection).toHaveBeenCalledWith(2)
    })

    it('handles clicking the dropdown options', () => {
        render(<DeploymentConfigToolbar {...defaultProps} />)

        const dropdownIcon = screen.queryByTestId('dropdown-icon') as HTMLElement
        fireEvent.click(dropdownIcon)

        const compareValuesOption = screen.getByText('Compare values')
        const compareManifestOption = screen.getByText('Compare generated manifest')

        expect(compareValuesOption).toBeTruthy()
        expect(compareManifestOption).toBeTruthy()

        fireEvent.click(compareValuesOption)

        expect(defaultProps.setIsValues).toHaveBeenCalledWith(true)
    })

    it('handles clicking the Readme icon', () => {
        const propsWithReadme = {
            ...defaultProps,
            noReadme: false,
            showReadme: false,
        }

        render(<DeploymentConfigToolbar {...propsWithReadme} />)

        const readmeIcon = screen.queryByTestId('readme-icon') as HTMLElement
        fireEvent.click(readmeIcon)

        expect(defaultProps.handleReadMeClick).toHaveBeenCalled()
    })
    it('should render close icon when showReadme is true', () => {
        const propsWithReadme = {
            ...defaultProps,
            noReadme: false,
            showReadme: true,
        }

        render(<DeploymentConfigToolbar {...propsWithReadme} />)

        const closeIcon = screen.queryByTestId('close-icon')
        expect(closeIcon).toBeTruthy()
    })
    it('should render manifest when isValues is false', () => {
        const propsWithReadme = {
            ...defaultProps,
            noReadme: false,
            showReadme: false,
            isValues: false,
        }

        render(<DeploymentConfigToolbar {...propsWithReadme} />)

        const compareManifestOption = screen.getByText('Manifest')
        expect(compareManifestOption).toBeTruthy()
    })
})
