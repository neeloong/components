栅格 `<nl-row>`
------------------------

支持多层嵌套

### 属性

| HTML属性    | JS 属性     | CSS 属性    | 类型     | 默认值 | 说明           |
| ----------- | ----------- | ----------- | -------- | -------- | -------------- |
| `column` | `column`  | | `boolean` | `24` | 是否为列的方向 |
| `space` | `space` | | `number` | `16` | 间隙宽度的大小 |
| `unit` | `unit` | | `string` | `px` | 间隙宽度的单位 |
| | | `nl-space` | `length` | - | 间隙宽度，优先级高于 `space` `unit` |

### 实例

```html
<nl-space space="20">
	<div style="background-color:antiquewhite">1</div>
	<div style="background-color:burlywood">1</div>
	<div style="background-color:aqua">1</div>
	<div style="background-color:chartreuse">1</div>
</nl-space>
```
