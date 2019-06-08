import { DomainError } from "./DomainError";

export const positiveNumber = (n: string|string) => {
    const i = Number(n);
    if (i < 0) {
        throw new DomainError(`${i} must be positive`);
    }
    return i;
}
