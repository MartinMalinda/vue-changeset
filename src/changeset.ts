import clone from 'fast-copy';
import { computed, reactive, ref, Ref } from 'vue';

type BaseModel = Record<any, any>;
type ValidationError = boolean | string;
type ValidateFn = (prop, value) => ValidationError | Promise<ValidationError>;

interface ChangesetOptions {
  autoValidate: boolean;
  validate: ValidateFn;
};
const defaultOptions : ChangesetOptions = {
  autoValidate: false,
  validate: (prop, value) => true
};

type Change = {
  oldValue: any;
  newValue: any;
  isDirty: Ref<boolean>;
  error: ValidationError;
  isValidating: boolean;
};

type ChangeMap = Record<any, Change>;

type Changeset<T> = {
  _model: T,
  _data: T,
  data: T,
  change: ChangeMap,
  validate: ValidateFn,
  assign: () => void,
};

function createChangeMap(model : BaseModel) : ChangeMap {
  const change : Record<any, Change> = {};

  Object.keys(model).forEach(key => {
    change[key] = {
      oldValue: model[key],
      newValue: ref(model[key]),
      isDirty: computed(() => change.oldValue !== change.newValue), // TODO: abstract and improve
      error: false,
      isValidating: false,
    };
  });

  return change;
}

export function createChangeset<T extends BaseModel>(model: T, options? : Partial<ChangesetOptions>) : Changeset<T> {

  const _options = {
    ...defaultOptions,
    ...options
  };

  const changeset = reactive<Changeset<T>>({
    _model: model,
    _data: clone(model),
    data: null as any, // to be assigned later
    change: createChangeMap(model),
    async validate(prop, value) {
      changeset.change[prop].isValidating = true;
      changeset.change[prop].error = await _options.validate(prop, value);
      changeset.change[prop].isValidating = false;
      return changeset.change[prop].error;
    },
    assign() {
      Object.assign(model, changeset.data);
      changeset.data = clone(model);
      changeset.change = createChangeMap(model);
    }
  });

  changeset.data = new Proxy(changeset, {
    get(target, prop : string | number) {
      console.log('get', { target, prop, value: target[prop] });
      return target[prop];
    },

    set(target, prop: string | number, value) {
      target[prop] = value;
      if (_options.autoValidate) {
        changeset.validate(prop, value)
      }

      console.log('set', { target, prop, value });
      changeset.change[prop].newValue = value;
      changeset._data[prop] = value;

      return true;
    }
  });

  return changeset;
}

function demo() {
  const changeset = createChangeset({
    name: 'Martin',
    isAdmin: false,
    roles: ['foo', 'bar', 'baz']
  });

  changeset.data.name = 'bar';
}
