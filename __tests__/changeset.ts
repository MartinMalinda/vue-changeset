
import { createChangeset } from '../src/changeset';
import { waitFor } from '@testing-library/dom';

describe('changeset', () => {
  test('calls validate on data change with autoValidate: true', async () => {
    const validate = jest.fn();
    const changeset = createChangeset({ name: 'Alexander' }, { validate, autoValidate: true });
    changeset.data.name = 'Joseph';
    await waitFor(() => expect(validate).toBeCalledWith('name', 'Joseph'));
  });
});
