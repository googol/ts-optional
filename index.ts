import { Optional, Some, None, isSome, isNone } from 'ts-optional-type';

export * from 'ts-optional-type';

export const caseOf = <T, R>(actions: { some: (value: T) => R; none: () => R }) => (input: Optional<T>) =>
    isSome(input)
        ? actions.some(input.value)
        : actions.none();

export const toArray = <T>(input: Optional<T>): T[] => caseOf<T, T[]>({
    some: (x) => [x],
    none: () => [],
})(input);

export const singleFromArray = <T>(input: ReadonlyArray<T>): Optional<T> => {
    if (input.length === 0) {
        return None();
    } else if (input.length > 1) {
        return None();
    } else {
        return Some(input[0]);
    }
};

export const firstFromArray = <T>(input: ReadonlyArray<T>): Optional<T> =>
    input.length > 0
        ? Some(input[0])
        : None();

export const defaultTo = <T>(defaultValue: T) => (input: Optional<T>): T => caseOf({
    some: (x: T) => x,
    none: () => defaultValue,
})(input);

export const getValueOrFail = <T>(input: Optional<T>): T => caseOf({
    some: (x: T) => x,
    none: () => { throw new Error(`Tried to get value out of a none`); },
})(input);

// Functor
export const map = <T, R>(selector: (value: T) => R) => (input: Optional<T>): Optional<R> => caseOf<T, Optional<R>>({
    some: (value) => Some(selector(value)),
    none: None,
})(input);

export const flap = <T, R>(func: Optional<(input: T) => R>) => (value: T): Optional<R> => map<(input: T) => R, R>((f) => f(value))(func);

// Chain
export const chain = <T, R>(selector: (value: T) => Optional<R>) => (input: Optional<T>): Optional<R> => caseOf<T, Optional<R>>({
    some: selector,
    none: None,
})(input);

// Alt
export const alt = <T>(a: Optional<T>) => (b: Optional<T>): Optional<T> =>
    isSome(a)
        ? a
        : b;
export const altLazy = <T>(a: Optional<T>) => (b: () => Optional<T>): Optional<T> =>
    isSome(a)
        ? a
        : b();

// Extend
export const extend = <T, R>(selector: (value: Optional<T>) => R) => (input: Optional<T>): Optional<R> =>
    isSome(input)
        ? Some(selector(input))
        : None();

// Apply
export const apply = <T, R>(func: Optional<(value: T) => R>) => (value: Optional<T>): Optional<R> =>
    isSome(func)
        ? map<T, R>(func.value)(value)
        : None();

export const lift2 = <T1, T2, R>(func: (t1: T1) => (t2: T2) => R) => (t1: Optional<T1>) => (t2: Optional<T2>): Optional<R> => {
    if (isNone(t1)) {
        return t1;
    }
    if (isNone(t2)) {
        return t2;
    }
    return Some(func(t1.value)(t2.value));
};
export const lift3 = <T1, T2, T3, R>(func: (t1: T1) => (t2: T2) => (t3: T3) => R) => (t1: Optional<T1>) => (t2: Optional<T2>) => (t3: Optional<T3>): Optional<R> => {
    if (isNone(t1)) {
        return t1;
    }
    if (isNone(t2)) {
        return t2;
    }
    if (isNone(t3)) {
        return t3;
    }
    return Some(func(t1.value)(t2.value)(t3.value));
};

export const applyFirst = <T1, T2>(first: Optional<T1>) => (second: Optional<T2>): Optional<T1> => {
    if (isNone(first)) {
        return first;
    }
    if (isNone(second)) {
        return second;
    }
    return first;
};

export const applySecond = <T1, T2>(first: Optional<T1>) => (second: Optional<T2>): Optional<T2> => {
    if (isNone(first)) {
        return first;
    }
    if (isNone(second)) {
        return second;
    }
    return second;
};

export type OptionalProps<T extends object> = { [K in keyof T]: Optional<T[K]> };

export const liftProps = <T extends object>(input: OptionalProps<T>): Optional<T> => {
    const _input: Record<string, Optional<any>> = input as any;
    const result: Record<string, any> = {};
    for (const key of Object.keys(_input)) {
        const value = _input[key];
        if (isNone(value)) {
            return value;
        } else {
            result[key] = value.value;
        }
    }
    return Some(result as T);
};

// Applicative
export const of = Some;

// Plus
export const zero = None;
