
import { createChangeset } from '../src/changeset';

describe('changeset', () => {
  test('calls validate on data change with autoValidate: true', async () => {
    const validate = jest.fn();
    const changeset = createChangeset({ name: 'Alexander' }, { validate, autoValidate: true });
    changeset.data.name = 'Joseph';
    // changeset.data = { ...changeset.data, name: 'Joseph' };
    await new Promise(resolve => setTimeout(resolve, 1000));
    expect(validate).toBeCalledWith('name', 'Joseph');
  });
});
