高亮 `<nl-highlighter>`
------------------------

支持多层嵌套

### 属性

| HTML属性    | JS 属性     | 类型     | 默认值   | 说明           |
| ----------- | ----------- | -------- | -------- | -------------- |
| `pattern` | `pattern` | `string` | `''` | 高亮内容匹配规则，与 `<input>` 的 `pattern` 类似，但会额外使用 `g` 标志且不会为其前后添加`^(?:` 和 `)$` |
| `text` | `text` | `string` | `''` | 高亮内容，只有当未配置 `pattern` 属性，或 `pattern` 无效时才有效 |

### 引入的 CSS 选择器

- `::highlight(nl-highlighter)` 高亮文本部分，对于高亮部分，需要手动定义样式。

### 实例

```html
<style>
::highlight(nl-highlighter) {
	background-color: yellow;
}
</style>
<nl-highlighter text="bc">
12345a<a href="#a">b</a>c12345ab123456abc
</nl-highlighter>
```
