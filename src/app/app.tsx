import React from 'react';
import './app.scss';
import Logo from './logo.svg';

const { NODE_ENV = '' } = process.env;

export function App() {
    return (
        <main className="main">
            <Logo className="app-logo" />
            {NODE_ENV}
            <a
                href="https://reactjs.org"
                target="_blank"
                rel="noopener noreferrer"
            >
                Learn React
            </a>
        </main>
    );
}
