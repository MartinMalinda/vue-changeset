import clone from 'fast-copy';
import { computed, reactive, ref, Ref, watch, toRefs, toRef } from 'vue';

// <IDEA>
// const model = reactive({
//   name: 'foo'
// });

// const refs = toRefs(model);
// Object.entries(refs).forEach(([key, ref]) => {
//   watch(() => ref, () => {
//     // validate ETC
//   });
// });
// </IDEA>

// <IDEA>
// const count = ref(1)
// const plusOne = computed({
//   get: () => count.value + 1,
//   set: val => {
//     count.value = val - 1
//   }
// })
// </IDEA>


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
    data: clone(model),
    change: createChangeMap(model),
    async validate(prop?, value?) {
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

  if (_options.autoValidate) {
    Object.keys(model).forEach((key) => {
      watch(() => changeset.data[key], (newValue) => {
        changeset.validate(key, newValue);
      });
    });
  }

  // console.log({ name: name.value });
  // console.log({ data });
  // console.log({ value: data.value });


  return changeset;
}
