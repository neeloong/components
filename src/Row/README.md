栅格 `<nl-row>`
------------------------

支持多层嵌套

### 属性

| HTML属性    | JS 属性     | 类型     | 默认值 | 说明           |
| ----------- | ----------- | -------- | -------- | -------------- |
| `aliquot` | `aliquot` | `int` | `24` | 栅格间隔 |
| `gutter-inline` | `gutterInline` | `string` | `0` | 行内间距 |
| `gutter-block` | `gutterBlock` | `string` | `0` | 行间间距 |

### 子元素属性
| HTML属性    | 类型     | 默认值 | 说明           |
| ----------- | -------- | -------- | -------------- |
| `nl-span` | `int` | `1` | 栅格占位格数 |
| `nl-offset` | `string` | `0` | 栅格左侧的间隔格数 |

### 实例

```html
<nl-row aliquot="240" gutter-inline=2 gutter-block=20>
	<span nl-span=60><div style="background-color:antiquewhite">1</div></span>
	<span nl-span=40><div style="background-color:burlywood">1</div></span>
	<span nl-span=40 nl-offset=60><div style="background-color:aqua">1</div></span>
	<span nl-span=40><div style="background-color:chartreuse">1</div></span>
</nl-row>
```
