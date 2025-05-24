module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    setupFiles: ['<rootDir>/tests/setup.ts'], // aquí cargas dotenv
    testTimeout: 10000,
    testMatch: [
        "**/?(*.)+(spec|test).[tj]s?(x)",   // ya existente
        "**/?(*_test).[tj]s?(x)"            // para archivos que terminan en _test.ts o _test.js
    ],

};
