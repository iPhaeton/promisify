import { promisify } from '../src';

describe('promisify', () => {   
    describe('default function', () => {
        it(`Should promisify a function that accepts an arbitrary number of parameters,
            including a callback as the last parameter.
            The result of the promise should be an array of parameters passed to the callback`,
            async () => {
                const funcSpy = jest.fn((arg1: any, arg2: any, cb: (...args: any[]) => void) => {
                    expect(arg1).toBe(1);
                    expect(arg2).toBe(2);
                    setTimeout(() => cb(1, 2, 3), 0);
                });
                const promise = promisify(funcSpy);
                const results = await promise(1, 2);
                expect(funcSpy).toHaveBeenCalledTimes(1);
                expect(results).toEqual([1, 2, 3])
            });

        it(`Promisified function should throw an error, 
            if callback gets an error among parameters`,
            async () => {
                const funcSpy = jest.fn((cb: (...args: any[]) => void) => {
                    setTimeout(() => cb(1, 2, new Error('test error'), 3), 0);
                });
                const promise = promisify(funcSpy);

                let errMessage = null;
                try {
                    const result = await promise();
                } catch (err) {
                    errMessage = err.message;
                }
                expect(errMessage).toBe('test error');
            });
    });

    describe('context', () => {
        it('If no context passed, the context of the function should be null', async () => {
            const funcSpy = jest.fn(function (cb: (...args: any[]) => void) {
                expect(this).toBe(null);
                setTimeout(() => cb(1, 2, 3), 0);
            });

            const promise = promisify(funcSpy);
            await promise();
        });

        it('If a context passed, should be called within the passed context', async () => {
            const funcSpy = jest.fn(function (cb: (...args: any[]) => void) {
                expect(this).toBe('context');
                setTimeout(() => cb(1, 2, 3), 0);
            });

            const promise = promisify(funcSpy, 'context');
            await promise();
        });
    });

    describe('errorFirst', () => {
        it(`If errorFirst parameter is true,
            promisified function should resolve
            when callback's first parameter is null`, async () => {
            const funcSpy = jest.fn(function (cb: (...args: any[]) => void) {
                setTimeout(() => cb(null, 1, 2, 3), 0);
            });

            const promise = promisify(funcSpy, null, true);

            const result = await promise();
            expect(result).toEqual([1, 2, 3]);
        });

        it(`If errorFirst parameter is true,
            promisified function should resolve
            when callback's first parameter is undefined`, async () => {
            const funcSpy = jest.fn(function (cb: (...args: any[]) => void) {
                setTimeout(() => cb(undefined, 1, 2, 3), 0);
            });

            const promise = promisify(funcSpy, null, true);

            const result = await promise();
            expect(result).toEqual([1, 2, 3]);
        });

        it(`If errorFirst parameter is true,
            promisified function should throw
            when callback's first parameter is neither null nor undefined`, async () => {
            const funcSpy = jest.fn(function (cb: (...args: any[]) => void) {
                setTimeout(() => cb(0, 1, 2, 3), 0);
            });

            const promise = promisify(funcSpy, null, true);

            try {
                const result = await promise();
                expect(result).toEqual([1, 2, 3]);
            } catch (err) {
                expect(err).toBe(0);
            }
        });
    })
})