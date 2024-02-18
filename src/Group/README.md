组 `<nl-group>`
------------------------

支持多层嵌套

### 属性

| HTML属性    | JS 属性     | CSS 属性    | 类型     | 默认值 | 说明           |
| ----------- | ----------- | ----------- | -------- | -------- | -------------- |
| `column` | `column`  | | `boolean` | `false` | 是否为列的方向 |
| `nl-long` | `long` | | `boolean` | `false` | 是否占用整行 |
| `radius` | `radius` | | `number` | `0` | 圆角的大小 |
| `unit` | `unit` | | `string` | `px` | 圆角的单位 |
| | | `nl-group-radius` | `length` | - | 圆角，优先级高于 `radius` `unit` |

### 子元素属性

| HTML属性    | 类型     | 默认值 | 说明           |
| ----------- | -------- | -------- | -------------- |
| `nl-long` | `boolean` | `false` | 是否默认填充此元素 |
