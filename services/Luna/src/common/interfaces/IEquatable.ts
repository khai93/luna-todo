export interface IEquatable<T> {
    /**
     * Compare itself to another object for equality
     * @param object T
     */
    equals(object: T): boolean
}