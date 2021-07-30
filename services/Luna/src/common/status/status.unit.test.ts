/**
 * Tests Status Value Object
 * 
 * @group unit/common
 */


import Status from '.'

describe('Status Value Object', () => {
    describe('#isValid', () => {
        it('should throw Error if value is null', () => {
            expect(() => new Status('')).toThrowErrorMatchingInlineSnapshot(
                `"String provided is null"`,
            )
        })
    });

    describe('#equals', () => {
        it('should return true if value is equal',  () => {
            const status1 = new Status("OK");
            const status2 = new Status("OK");

            expect(status1.equals(status2)).toBeTruthy();
        });
        
        it('should return false if value is not equal', () => {
            const status1 = new Status("OK");
            const status2 = new Status("DOWN");

            expect(status1.equals(status2)).toBeFalsy();
        })
    });
})
