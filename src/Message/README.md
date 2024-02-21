全局提示 `<nl-message>`
------------------------

支持多层嵌套

### 属性

| HTML属性    | JS 属性     | 类型     | 默认值   | 说明           |
| ----------- | ----------- | -------- | -------- | -------------- |
| `open` | `open` | `boolean` | `false` | 是否显示全局提示 |
| `duration` | `duration` | `number` | `1.5` | 全局提示显示的时长(s)，到时自动隐藏， 0 表示不自动关闭 |
| `closable` | `closable` | `boolean` | `false` | 是否显示关闭按钮 |

### 状态

- `--open` 菜单打开状态
- `--shown` 菜单显示状态

### 实例

```html
<nl-message open duration="3">111</nl-message>
<nl-message open>222</nl-message>
<nl-message open duration="0">333</nl-message>
```
