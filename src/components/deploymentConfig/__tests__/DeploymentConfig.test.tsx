import React from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import DeploymentConfig, { DeploymentConfigContext } from '../DeploymentConfig'
import Router from 'react-router'
import { mainContext } from '../../common/navigation/NavigationRoutes'
import * as service from '../service'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(),
}))

// mock getDeploymentTemplateData

jest.mock('../DeploymentTemplateView/DeploymentTemplateEditorView', () =>
    jest.fn(() => <div style={{ backgroundColor: '#000000' }} data-testid="test-div"></div>),
)
describe('DeploymentConfig', () => {
    const mockProps = {
        respondOnSuccess: jest.fn(),
        isUnSet: true,
        navItems: [],
        isCiPipeline: true,
        environments: [],
        isProtected: true,
        reloadEnvironments: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render correctly', () => {
        ;(Router as any).useParams = jest.fn().mockReturnValue({ id: '1' })

        const { getByTestId } = render(
            <mainContext.Provider value={{ currentServerInfo: {} }}>
                <DeploymentConfig {...mockProps} />
            </mainContext.Provider>,
        )
        const deploymentConfig = getByTestId('deployment-config')
        expect(deploymentConfig).toBeTruthy()
    })
    it('should open dropdown when clicked on dropdown icon', () => {
        ;(Router as any).useParams = jest.fn().mockReturnValue({ id: '1' })

        const { getByTestId } = render(
            <mainContext.Provider value={{ currentServerInfo: {} }}>
                <DeploymentConfig {...mockProps} />
            </mainContext.Provider>,
        )
        const deploymentConfig = getByTestId('deployment-config')
        expect(deploymentConfig).toBeTruthy()
        fireEvent.click(screen.getByTestId('dropdown-icon'))
        const allDropdownItems = screen.getAllByTestId('dropdown-item')
        // fireEvent.click(allDropdownItems[0])
        expect(allDropdownItems).toBeTruthy()
    })
    it('should select values whn click on first item in dropdown', () => {
        ;(Router as any).useParams = jest.fn().mockReturnValue({ id: '1' })

        const { getByTestId } = render(
            <mainContext.Provider value={{ currentServerInfo: {} }}>
                <DeploymentConfig {...mockProps} />
            </mainContext.Provider>,
        )
        const deploymentConfig = getByTestId('deployment-config')
        expect(deploymentConfig).toBeTruthy()
        fireEvent.click(screen.getByTestId('dropdown-icon'))
        let allDropdownItems = screen.getAllByTestId('dropdown-item')
        fireEvent.click(allDropdownItems[0])
        allDropdownItems = screen.queryAllByTestId('dropdown-item')
        expect(allDropdownItems).toEqual([])
    })
    it('should select manifest when click on first item in dropdown', async () => {
        ;(Router as any).useParams = jest.fn().mockReturnValue({ id: '1' })
        //@ts-ignore
        jest.spyOn(service, 'getDeploymentManisfest').mockResolvedValue({ result: { data: 'hello' } })

        let component
        await act(async () => {
            component = render(
                <mainContext.Provider value={{ currentServerInfo: {} }}>
                    <DeploymentConfig {...mockProps} />
                </mainContext.Provider>,
            )
            await component.getByTestId('test-div')

            const deploymentConfig = component.getByTestId('deployment-config')
            expect(deploymentConfig).toBeTruthy()
            fireEvent.click(screen.getByTestId('dropdown-icon'))
            let allDropdownItems = screen.getAllByTestId('dropdown-item')
            fireEvent.click(allDropdownItems[1])
            screen.debug()
            allDropdownItems = screen.queryAllByTestId('dropdown-item')
            expect(allDropdownItems).toEqual([])
            expect(component.getByTestId('test-div')).toBeTruthy()
        })
    })
    it('should select manifest when click on first item in dropdown', async () => {
        ;(Router as any).useParams = jest.fn().mockReturnValue({ id: '1' })
        //@ts-ignore
        jest.spyOn(service, 'getDeploymentTemplate').mockRejectedValue('Error')
        let component

        await act(async () => {
            component = render(
                <mainContext.Provider value={{ currentServerInfo: {} }}>
                    <DeploymentConfig {...mockProps} />
                </mainContext.Provider>,
            )
        })
        const deploymentConfig = component.getByTestId('deployment-config')
        expect(deploymentConfig).toBeTruthy()
        //expect react toast to appear below
    })
})
