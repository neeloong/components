折叠面板 `<nl-collapse>`
------------------------

支持多层嵌套

### 属性

| HTML属性    | JS 属性     | 类型     | 默认值 | 说明           |
| ----------- | ----------- | -------- | -------- | -------------- |
| `nonTrigger` | `nonTrigger`  | `boolean` | `false` | 是否隐藏切换器 |
| `startTrigger` | `startTrigger`  | `boolean` | `false` | 切换器位置是否在标签之前 |
| `accordion` | `accordion`  | `boolean` | `false` | 是否为手风琴模式 |
| `disabled` | `disabled`  | `boolean` | `false` | 是否禁用 |
| `open` | `open`  | `boolean` | `false` | 是否打开 |
| `animation` | `animation`  | `boolean` | `false` | 是否启用动画 |
| `menu` | `menu`  | `boolean` | `false` | 是否为菜单 |
| `label` | `label` | `string` | `` | 标签内容 |


### 伪元素

- `::part(header)` 头部部分
- `::part(main)` 主体部分

### 插槽

| 插槽       | 说明                 |
| ---------- | ---------------- |
| _默认插槽_ | 主体内容         |
| `label`    | 自定义标签内容   |
| `trigger`  | 自定义切换器图标 |

### 实例

```html
<nl-collapse animation accordion>
	<div slot="label">label<button>111</button></div>
	<div style="background-color:antiquewhite">1</div>
	<div style="background-color:burlywood">1</div>
	<div style="background-color:aqua">1</div>
	<div style="background-color:chartreuse">1</div>
</nl-collapse>
```
