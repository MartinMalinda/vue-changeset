
import { createChangeset } from '../src/changeset';
import { waitFor } from '@testing-library/dom';

describe('changeset with validation', () => {
  test('calls validate on data change with autoValidate: true', async () => {
    const validate = jest.fn();
    const changeset = createChangeset({ name: 'Alexander' }, { validate, autoValidate: true });
    changeset.data.name = 'Joseph';
    await waitFor(() => expect(validate).toBeCalledWith('name', 'Joseph'));
  });

  test('does not call validate on data change with autoValidate: false', async () => {
    const validate = jest.fn();
    const changeset = createChangeset({ name: 'Alexander' }, { validate, autoValidate: false });
    changeset.data.name = 'Joseph';
    await waitFor(() => expect(validate).not.toBeCalled());
  });

  test('calls validate function via explicit call of changeset.validate(prop)', async () => {
    const validate = jest.fn();
    const changeset = createChangeset({ name: 'Alexander' }, { validate, autoValidate: false });
    changeset.data.name = 'Joseph';
    changeset.validate('name');
    await waitFor(() => expect(validate).toBeCalledWith('name', 'Joseph'));
  });

  test('calls validate function via explicit call of changeset.validate() (without prop name)', async () => {
    const validate = jest.fn();
    const changeset = createChangeset({ name: 'Alexander', isAdmin: true }, { validate, autoValidate: false });
    changeset.data.name = 'Joseph';
    changeset.data.isAdmin = false;
    changeset.validate();
    await waitFor(() => expect(validate).toBeCalledWith('name', 'Joseph'));
    await waitFor(() => expect(validate).toBeCalledWith('isAdmin', false));
  });
});
