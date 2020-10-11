import { defineComponent, createApp, h, ref, nextTick } from "vue";
import { Changeset } from "../src/changeset";
import useChangeset from "../src/use-changeset";

const mount = async setup => {
  const component = defineComponent({
    setup() {
      setup();

      return () => 'div';
    }
  });
  const renderComponent = ref(true);
  const root = defineComponent({
    setup() {
      return () => {
        const children = [renderComponent.value ? h(component) : h('div')];
        return h('div', children);
      };
    }
  });
  createApp(root).mount(document.body);
  await nextTick();
  return async () => {
    renderComponent.value = false;
    await nextTick();
  };
};

describe('useChangeset()', () => {
  test('returns a changeset', async () => {
    expect.assertions(1);
    await mount(() => {
      const changeset = useChangeset({ quantity: 5 });
      expect(!!changeset).toBe(true);
    });
  });

  test('it cleans up on unmount', async () => {
    expect.assertions(2);
    let changeset: Changeset<any>;
    const unmount = await mount(() => {
      changeset = useChangeset({ quantity: 5 }, { autoValidate: true });
      expect(changeset._stopHandles.length).toBe(1);
    });
    await unmount();
    // @ts-ignore
    expect(changeset._stopHandles).toBe(undefined);
  });
});
