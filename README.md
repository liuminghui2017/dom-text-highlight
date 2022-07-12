# dom-text-highlight
iterate dom tree and highlight the keyword

# 描述
查找dom树，寻找关键字，并使用自定义标签进行包裹

# 使用
```html
<div class="container">
  <p>
    xxxxxx keyword xxxxxxkeywordkeywordkeyword
    <span>aaaaaaakeywordaaaaaa</span>
  </p>
</div>
```
```javascript
const util = new HighlightUtil('.container', 'keyword', { tag: 'span', class: 'customClass' })
util.highlight()
// util.clearHighLight()
```
最终效果：
```html
<div class="container">
  <p>
    xxxxxx <span class="customClass">keyword</span> xxxxxx<span class="customClass">keyword</span><span class="customClass">keyword</span><span class="customClass">keyword</span>
    <span>aaaaaaa<span class="customClass">keyword</span>aaaaaa</span>
  </p>
</div>
```

