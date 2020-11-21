import { ValidateFn } from './changeset';

type ValidationMap<T> = { [K in keyof Partial<T>]: (value: T[K]) => boolean | string | Promise<boolean | string> };
export default function createValidator<T = any>(map: ValidationMap<T>, model?: T) : ValidateFn<T> {
  return (prop, value) => {
    if (prop && map[prop]) {
      return map[prop](value);
    }

    // if the prop is not present on the validator object the property is always valid.
    return true;
  };
}
