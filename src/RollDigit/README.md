滚动数字 `<nl-roll-digit>`
------------------------

### 属性

| HTML属性    | JS 属性     | 类型     | 默认值 | 说明           |
| ----------- | ----------- | -------- | ------ | -------------- |
| `value` | `value` | `number` | `0`  | 要显示的数字 |
| `digit` | `digit` | `number` | `0`  | 要显示的数字的位数， 0 表示个位，1 表示十位，2 表示百位...,负数表示小数点部分 |

### 实例

```html
<nl-roll-digit value="56789" digit="1" style="
	background-color: #88F;
	line-height: 2em;
	inline-size: .8em;
	border-radius: .2em;
"></nl-roll-digit>
```
