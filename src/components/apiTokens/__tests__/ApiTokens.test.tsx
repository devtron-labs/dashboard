import React from 'react';
import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react';
import APITokenList from '../APITokenList';
import { BrowserRouter } from 'react-router-dom';
import { tokenList } from '../__mocks__/ApiTokens.mock'

describe('APITokenList', () => {
  
    it('renders the component', () => {
      render(<APITokenList tokenList={[]} renderSearchToken={jest.fn()} reload={jest.fn()} />);
    });

    it('renders the list of tokens', () => {
        const { getByText , container} = render(<APITokenList tokenList={tokenList} renderSearchToken={jest.fn()} reload={jest.fn()} /> , {
            wrapper:BrowserRouter});
        expect(container).toBeInTheDocument();
        expect(getByText('Token 1')).toBeInTheDocument();
        expect(getByText('127.0.0.1')).toBeInTheDocument();
        expect(getByText('190.160.0.0')).toBeInTheDocument();
        expect(getByText('Token 2')).toBeInTheDocument();

    });

    it('create token button trigger', () => {

        const reload = jest.fn();
        const { container , getByText } = render(<APITokenList tokenList={tokenList} renderSearchToken={jest.fn()} reload={reload} /> , {
            wrapper:BrowserRouter});
        const generateTokenButton = container.querySelector('.flex.cta.h-32.ml-10') as HTMLElement;
        expect(generateTokenButton).toBeInTheDocument();
        fireEvent.click(generateTokenButton);

    });
});

