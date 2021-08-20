const tsconfig = require('./tsconfig.json');

const { paths } = tsconfig.compilerOptions;
const moduleNameMapper = Object
    .keys(paths)
    .reduce((result, key) => {
        const value = paths[key][0];
        const nextKey = key.replace(/\*$/, '(.*)');
        const nextValue = value
            .replace(/^\./, '<rootDir>')
            .replace(/\*$/, '$1');

        return {
            ...result,
            [nextKey]: nextValue
        };
    }, {});

module.exports = {
    preset: 'ts-jest',
    coverageDirectory: '<rootDir>/coverage',
    coverageProvider: 'v8',
    coverageReporters: ['lcov'],
    roots: ['<rootDir>/tests/'],
    moduleNameMapper: {
        ...moduleNameMapper,
        '\\.(css|less|svg|scss)$': '<rootDir>/tests/__mocks__/style.ts'
    },
    transform: {
        '^.+\\\\.(ts|tsx)$': 'ts-jest'
    },
    setupFilesAfterEnv: [
        '<rootDir>/tests/config.ts'
    ],
    testEnvironment: 'jsdom'
};
