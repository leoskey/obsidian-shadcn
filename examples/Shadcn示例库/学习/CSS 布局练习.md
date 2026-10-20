---
tags: [前端, CSS]
---

# CSS 布局练习

## 今天的练习

使用 Grid 排列标题、标签和日期，给标题保留可伸缩空间。

```css
.note-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  gap: 16px;
  align-items: center;
}
```

## 验证

- [ ] 长标题保持省略
- [ ] 日期对齐
- [ ] 小屏保留主要信息
