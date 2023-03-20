import React from 'react';
import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import APITokenList from '../APITokenList';
import { BrowserRouter } from 'react-router-dom';

describe('APITokenList', () => {

    const tokenList   = [
        {
            expireAtInMs: 1647519,
            id: 1,
            name: 'Token 1',
            token: 'Token 1',
            updatedAt: '2022-03-16T18:04:08.590Z',
            userId: 1 ,
            userIdentifier: '1',
            description: 'This is Token 1',
            lastUsedByIp: '127.0.0.1',
            lastUsedAt: '2022-03-16T18:04:08.590Z',
            
        },
        {

            expireAtInMs: 1660470,
            id: 2,
            name: 'Token 2',
            token: 'Token 2',
            updatedAt: '2022-03-15T15:22:20.123Z',
            userId: 2 ,
            userIdentifier: '2',
            description: 'This is Token 2',
            lastUsedByIp: '192.168.1.1',
            lastUsedAt: '2022-03-15T15:22:20.123Z',
            
        },
    ];
  
    it('renders the component', () => {
      render(<APITokenList tokenList={[]} renderSearchToken={jest.fn()} reload={jest.fn()} />);
    });

    it('renders the list of tokens', () => {
        const { getByText , container} = render(<APITokenList tokenList={tokenList} renderSearchToken={jest.fn()} reload={jest.fn()} /> , {
            wrapper:BrowserRouter});
        expect(container).toBeInTheDocument();
        expect(getByText('Token 1')).toBeInTheDocument();
        expect(getByText('127.0.0.1')).toBeInTheDocument();
        expect(getByText('192.168.1.1')).toBeInTheDocument();
        expect(getByText('Token 2')).toBeInTheDocument();

    });

    it('create token button trigger', () => {

        const reload = jest.fn();
        const { container , getByText } = render(<APITokenList tokenList={tokenList} renderSearchToken={jest.fn()} reload={reload} /> , {
            wrapper:BrowserRouter});
        const generateTokenButton = container.querySelector('.app-status-card__divider') as HTMLElement;
        expect(generateTokenButton).toBeInTheDocument();
        fireEvent.click(generateTokenButton);

    });

    // it('edit token button trigger', async () => {
    //     const user = userEvent.setup();
    //     const reload = jest.fn();
    //     const { container , findByText } = render(<APITokenList tokenList={tokenList} renderSearchToken={jest.fn()} reload={reload} /> , {
    //         wrapper:BrowserRouter});
    //     const editTokenButton = container.querySelectorAll('.dc__transparent.cursor')[0] as HTMLElement;
    //     expect(editTokenButton).toBeInTheDocument();
    //     await userEvent.click(editTokenButton);
    //     expect(await screen.findByText('Edit API token')).toBeVisible();
    // });

});

