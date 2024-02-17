滚动数字 `<nl-roll-digit>`
------------------------

### 属性

| HTML属性    | JS 属性     | 类型     | 默认值 | 说明           |
| ----------- | ----------- | -------- | ------ | -------------- |
| `value` | `value` | `number` | `0`  | 要显示的数字 |
| `sign` | `sign` | `boolean` | `false`  | 是否为显示符号而非数字 |
| `digit` | `digit` | `number` | `0`  | 要显示的数字的位数， 0 表示个位，1 表示十位，2 表示百位...,负数表示小数点部分 |
| `plus` | `plus` | `boolean` | `false`  | 当为正数时，是否显示加号 |
| `zero` | `plus` | `+` ` ` `-` | ` `  | 当为 0 时，所显示的符号 |

### 实例

```html
<nl-roll-digit value="56789" digit="1" style="
	background-color: #88F;
	line-height: 2em;
	inline-size: .8em;
	border-radius: .2em;
"></nl-roll-digit>
```
