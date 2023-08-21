import React from 'react'
import '@testing-library/jest-dom'
import { fireEvent, getByTestId, render, screen } from '@testing-library/react'
import Docker from '../Docker'
import { BrowserRouter } from 'react-router-dom'

describe('Docker Form', () => {
    
    it('renders the docker component', () => {
        render(<Docker />)
    })

    it('renders the list of tokens', () => {
        const { container } = render(
            <Docker />,
            {
                wrapper: BrowserRouter,
            },
        )
        expect(container).toBeInTheDocument()
    })


    it('check if add registry exists', () => {
        const { getByTestId, getByLabelText, getByRole } = render(
            <Docker />,
            {
                wrapper: BrowserRouter,
            },
        )
        // expect(container).toBeInTheDocument()
        const nameLabel = getByLabelText(/Name/i)
        const urlLabel = getByLabelText('URL')
        const usernameLabel = getByLabelText('Username')
        const passwordLabel = getByLabelText('Password')
        const addButton = getByTestId('add-registry-button')
        const registryProvider = getByTestId('registry-provider')
        const registryType = getByTestId('registry-type')
        const privateRegistry = getByTestId('private-registry')
        const publicRegistry = getByTestId('public-registry')
        const selectExistingContainerRegistryList = getByTestId('select-existing-container-registry-list')
        const containerOciRegistryHeading = getByTestId('container-oci-registry-heading')
        const addRegistryButton = getByTestId('add-registry-button')
       
        const registryProviderLabel = getByLabelText('Registry provider')
        const registryTypeLabel = getByLabelText('Registry type')
        const privateRegistryLabel = getByLabelText('Private Registry')
        const publicRegistryLabel = getByLabelText('Public Registry')
        const selectExistingContainerRegistryListLabel = getByLabelText('select-existing-container-registry-list')
        const containerOciRegistryHeadingLabel = getByLabelText('container-oci-registry-heading')
        const addRegistryButtonLabel = getByLabelText('add-registry-button')
        
        const nameInput = getByLabelText(/Name/i)
        fireEvent.change(nameInput, { target: { value: '' } })
        const btn = getByRole('button', { name: 'Save' })
        expect(btn).toBeDisabled()
        
        expect(screen.getByText('select-existing-container-registry-list')).toBeInTheDocument() 
        expect(screen.getByText('container-oci-registry-heading')).toBeInTheDocument() 
        expect(screen.getByText('add-registry-button')).toBeInTheDocument() 
        fireEvent.click(getByTestId('add-registry-button'))
        expect(screen.getByText('Registry provider')).toBeInTheDocument() 
        expect(screen.getByText('Registry type')).toBeInTheDocument() 
        expect(screen.getByText('Private Registry')).toBeInTheDocument() 
        expect(screen.getByText('Private Registry')).toBeInTheDocument() 
        
    })

  

})
