import createValidator from '../src/create-validator';

describe('createValidator()', () => {
  test('returns a function', () => {
    const validate = createValidator({
      name: (value) => value.length > 5
    }, { name: 'bar' });
    expect(validate).toBeInstanceOf(Function);
  });

  test('creates a validator function that checks for all properties', () => {
    const validate = createValidator({
      name: (value) => value.length > 5,
      age: (value) => value > 18
    }, { name: 'bar', age: 50 });
    
    expect(validate('name', 'Joe')).toBe(false);
    expect(validate('name', 'Joseph')).toBe(true);

    expect(validate('age', 0)).toBe(false);
    expect(validate('age', 100)).toBe(true);
  });

  test('creates a validator that returns false on unknown property', () => {
    const validate = createValidator({
      name: (value) => value.length > 5,
    });

    expect(validate('foo', 'bar')).toBe(false);
  });
});
