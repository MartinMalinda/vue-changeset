import { ValidateFn } from './changeset';

type ValidationMap<T> = { [K in keyof T]: (value: T[K]) => boolean | string | Promise<boolean | string> };
export default function createValidator<T = any>(map: ValidationMap<T>, model?: T) : ValidateFn<T> {
  return (prop, value) => {
    if (prop && map[prop]) {
      return map[prop](value);
    }

    return false;
  };
}
