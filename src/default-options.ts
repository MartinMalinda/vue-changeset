import { ChangesetOptions } from './changeset';

const defaultOptions : ChangesetOptions<any> = {
  autoValidate: false,
  validate: (prop, value) => true,
  copy: obj => ({ ...obj }), // shallow copy
  checkifDirty: ({ key, oldValue, newValue }) => oldValue !== newValue 
};

export default defaultOptions;
