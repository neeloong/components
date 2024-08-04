分页 `<nl-pagination>` `<nl-pagination-jumper>` `<nl-pagination-next>` `<nl-pagination-page>` `<nl-pagination-pager>` `<nl-pagination-prev>` `<nl-pagination-sizer>` `<nl-pagination-value>`
------------------------

`<nl-pagination>` 为分页内容的容器组件，其余为分页子组件，具体为：
- `<nl-pagination-jumper>` 页码跳转组件
- `<nl-pagination-next>` 下一页组件
- `<nl-pagination-page>` 指定页组件
- `<nl-pagination-pager>` 分页导航组件
- `<nl-pagination-prev>` 上一页组件
- `<nl-pagination-sizer>` 分页尺寸切换组件
- `<nl-pagination-value>` 分页信息组件

### `<nl-pagination>` 属性

| HTML属性    | JS 属性     | 类型     | 默认值 | 说明           |
| ----------- | ----------- | -------- | -------- | -------------- |
| `size` | `size`  | `number` | `0` | 每页数量，0 表示不分页 |
| `total` | `total` | `number` | `0` | 总数 |
| `pages` | `pages` | `number` | `1` | 总分页数，如果未设置，则为 `Math.ceil(total / size)` |
| `page` | `page` | `number` | `1` | 当前页码 |

### `<nl-pagination-jumper>` 属性

| HTML属性    | JS 属性     | 类型     | 默认值 | 说明           |
| ----------- | ----------- | -------- | -------- | -------------- |
| `disabled` | `disabled`  | `boolean` | `false` | 是否禁用 |

### `<nl-pagination-next>` 属性

| HTML属性    | JS 属性     | 类型     | 默认值 | 说明           |
| ----------- | ----------- | -------- | -------- | -------------- |
| `disabled` | `disabled`  | `boolean` | `false` | 是否禁用 |

### `<nl-pagination-page>` 属性

| HTML属性    | JS 属性     | 类型     | 默认值 | 说明           |
| ----------- | ----------- | -------- | -------- | -------------- |
| `disabled` | `disabled`  | `boolean` | `false` | 是否禁用 |
| `value` | `value`  | `number` | `1` | 要跳转的页码 |

### `<nl-pagination-pager>` 属性

| HTML属性    | JS 属性     | 类型     | 默认值 | 说明           |
| ----------- | ----------- | -------- | -------- | -------------- |
| `disabled` | `disabled`  | `boolean` | `false` | 是否禁用 |

### `<nl-pagination-prev>` 属性

| HTML属性    | JS 属性     | 类型     | 默认值 | 说明           |
| ----------- | ----------- | -------- | -------- | -------------- |
| `disabled` | `disabled`  | `boolean` | `false` | 是否禁用 |

### `<nl-pagination-sizer>` 属性

| HTML属性    | JS 属性     | 类型     | 默认值 | 说明           |
| ----------- | ----------- | -------- | -------- | -------------- |
| `disabled` | `disabled`  | `boolean` | `false` | 是否禁用 |
| `sizes` | `sizes`  | `number[]` | `false` | 可选的分页数 |
| `label` | `label`  | `string` | `'#'` | 各选项的标签，`#` 将会被替换为每页的条数  |
| `non-label` | `nonLabel`  | `string` | `'-'` | 不分页选项的标签 |

### `<nl-pagination-value>` 属性

| HTML属性    | JS 属性     | 类型     | 默认值 | 说明           |
| ----------- | ----------- | -------- | -------- | -------------- |
| `name` | `name`  | `string` | `page` | 要显示的内容 |


### `<nl-pagination>` 事件

#### `change`

| 事件     | JS 类型 | 是否冒泡 | 可否取消 | 说明           |
| -------- | ------- | -------- | -------- | -------------- |
| `change` | `Event` | 否 | 否 | 分页子组件组件改变每页数量或当前页码时触发 |


### `<nl-pagination-value>` 的 name 属性说明

- `size` 每页数量
- `total` 总数
- `pages` 总分页数
- `page` 当前页码
- `start` 当前页的第一项序号
- `end` 当前页的最后一项序号


### 实例

```html
<nl-pagination size="20" total="1563" page="6">
	<nl-pagination-value name="start"></nl-pagination-value>
	-
	<nl-pagination-value name="end"></nl-pagination-value>
	/
	<nl-pagination-value name="total"></nl-pagination-value>
	<nl-pagination-prev>上一页</nl-pagination-prev>
	<nl-pagination-pager></nl-pagination-pager>
	<nl-pagination-next>下一页</nl-pagination-next>
	<nl-pagination-jumper></nl-pagination-jumper>
	<nl-pagination-page value="11">11</nl-pagination-page>
	<nl-pagination-sizer sizes="10,20,50,0" non-label="不分页" label="# 条/页"></nl-pagination-sizer>
</nl-pagination>
```
