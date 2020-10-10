
import { createChangeset } from '../src/changeset';

describe('changeset', () => {
  test('calls validate on data change with autoValidate: true', () => {
    const validate = jest.fn();
    const changeset = createChangeset({ name: 'Alexander' }, { validate, autoValidate: true });
    changeset.data.name = 'Joseph';
    console.log(changeset.data.name);
    expect(validate).toBeCalledWith('name', 'Joseph');
  });
});
