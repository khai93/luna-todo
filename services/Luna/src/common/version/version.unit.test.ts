/**
 * Tests Version Value Object
 * 
 * @group unit/common
 */

import Version from '.'
import { VersionNotValidError } from './version'

describe('Version Value Object', () => {
    describe('#isValid', () => {
        it.each([
            [undefined],
            [[-5]],
            [[""]],
            [[false]],
            [[.0393]]
        ])(
            'should throw Error if value is %i',
            (a) => {
                expect(
                    () => new Version(a as unknown as string),
                ).toThrow();
            },
        )
    });

    describe('#equals', () => {
        it.each([
            ["1", "2", false],
            ["500.2", "5", false],
            ["20.5.1", "58287", false],
            ["1.2", "1.2", true],
            ["0.0.1", "0.0.1", true]
        ])('.equals(%s, %s): %s ', (a, b, expected) => {
            const aVersion = new Version(a);
            const bVersion = new Version(b);

            expect(aVersion.equals(bVersion)).toBe(expected);
        });
    });
})
