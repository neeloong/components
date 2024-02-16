菜单 `<nl-menu>`
------------------------

支持多层嵌套

### 属性

| HTML属性    | JS 属性     | 类型     | 说明           |
| ----------- | ----------- | -------- | -------------- |
| `open` | `open` | `boolean` | 菜单是否为打开状态，仅根菜单有效 |
| modal | `modal` | `boolean` | 是否采用覆盖层，如果浏览器不支持 `showPopover()` 方法，则强制使用覆盖层，仅根菜单有效 |
| `target` | `target` | `string` | 菜单的显示位置(目标元素选择器)，仅根菜单有效 |
|   | `targetElement` | `Element?` | 菜单的显示位置(目标元素)，仅根菜单有效 |
| x | `x` | `number` | 菜单的显示位置(X)，仅根菜单有效 |
| y | `y` | `number` | 菜单的显示位置(Y)，仅根菜单有效 |
| direction | `direction` | `'inlineStart', 'inlineEnd', 'blockStart', 'blockEnd'` 中的一个或多个， HTML 属性中`,`隔开, js 属性中为数组 | 菜单的显示方向，仅根菜单有效 |
| align | `align` | `'start', 'end', 'center'` 中的一个或多个， HTML 属性中`,`隔开, js 属性中为数组 | 菜单的对其方式，仅根菜单有效 |
| disabled | `disabled` | `boolean` | 是否禁用当前菜单，仅子菜单有效 |

### 插槽

| 插槽 | 说明 |
| ---- | ---- |
| _默认插槽_ | 菜单内容 | 
| `label` | 子菜单在父菜单中的标签，仅子菜单有效 | 

### 菜单的显示位置说明

当配置有多种菜单的显示位置时，将按照以下优先级优先选择:
- `targetElement`
- `target`
- `x` `y`
