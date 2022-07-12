/*
 * @Author: LMH
 * @Date: 2022-07-12
 * @LastEditors: LMH
 * @LastEditTime: 2022-07-12
 * @Description: 在dom树中查找关键字文本，并使用自定义标签包裹起来;
 * 使用方法：
 * const util = new HighLightUtil('.container', '关键字')
 * util.highlight() // 高亮
 * util.clearHighlight() // 去除高亮
 */

export default class HighLightUtil {
  option = {
    tag: 'span', // 包裹高亮关键字的标签
    properties: {}, // 额外的标签属性
    class: 'highlight',
  }
  container = document.body
  keyword = null
  
  /**
   * 
   * @param {String | HTMLElement} container required
   * @param {String} keyword required
   * @param {*} option  optional 配置高亮标签
   */
  constructor(container, keyword, option) {
    // 初始化container
    if (typeof container === 'string') {
      this.container = document.querySelector(container)
    } else if (HTMLElement.prototype.isPrototypeOf(container)) {
      this.container = container
    }
    if (!this.container) {
      this.container = document.body
    }
    // 初始化关键字
    this.keyword = keyword
    // 初始化配置
    this.option = {
      ...this.option,
      ...(option || {})
    }
  }

  setKeyword(keyword) {
    this.keyword = `${keyword}`
  }

  /**
   * 查找关键字并高亮
   * @param {Boolean} clearBeforHighlight 在高亮前，清除旧高亮标签
   */
  highlight(clearBeforHighlight = true) {
    if (clearBeforHighlight) {
      this.clearHighlight()
    }
    const iterator = document.createNodeIterator(this.container, NodeFilter.SHOW_TEXT)
    let textNode = iterator.nextNode()
    while(textNode) {
      const text = textNode.nodeValue
      let keywordNum = text.split(this.keyword).length - 1 // 文本中关键字数量
      for (let i = 1; i <= keywordNum; i += 1) {
        this.createHighlightTag(textNode)
        iterator.nextNode() // 这里是跳过新创建的关键字tag
        if (i != keywordNum) { // 最后一个不用，因为while循环里已经有了
          textNode = iterator.nextNode()
        }
      }
      textNode = iterator.nextNode()
    }
  }

  /**
   * 生成高亮标签
   * @param {HTMLElement} textNode 
   */
  createHighlightTag(textNode) {
    const text = textNode.nodeValue
    const start = text.indexOf(this.keyword)
    const end = start + this.keyword.length
    const range = document.createRange()
    const tag = document.createElement(this.option.tag || 'span')
    tag.setAttribute('is-keyword', 1)
    tag.setAttribute('class', this.option.class || 'highlight')
    tag.innerText = this.keyword
    Object.keys(this.option.properties || {}).forEach((attr) => {
      tag.setAttribute(attr, this.option.properties[attr])
    })
    range.setStart(textNode, start)
    range.setEnd(textNode, end)
    range.deleteContents()
    range.insertNode(tag)
  }

  /**
   * 清空所有高亮标签
   * @param {HTMLElement} parentNode 可选
   */
  clearHighlight(parentNode) {
    const container = parentNode || this.container
    if (!container) {
      console.warn('container node is empty!')
      return
    }
    // 创建高亮标签遍历器
    const iterator = document.createNodeIterator(container, NodeFilter.SHOW_ELEMENT, {
      acceptNode(node) {
        return node.getAttribute('is-keyword') == '1' ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
      },
    })
    // 遍历高亮标签
    let node = iterator.nextNode()
    while(node) {
      this.deleteHighlightTag(node)
      node = iterator.nextNode()
    }
  }

  /**
   * 删除高亮标签，删除的同时，合并标签左右的文本，还原成一个完整的TextNode，方便后续关键字查找
   * @param {HTMLElement} node 节点
   */
  deleteHighlightTag(node) {
    if (!node) {
      console.warn('deleteHighlightTag error: empty node')
      return
    }
    // 抽取关键字左右两边文本
    let prevText = ''
    let nextText = ''
    let previousSibling = node.previousSibling
    let nextSibling = node.nextSibling
    const previousSiblingList = []
    const nextSiblingList = []
    while(previousSibling && previousSibling.nodeType === Node.TEXT_NODE) {
      previousSiblingList.push(previousSibling)
      prevText = previousSibling.nodeValue + prevText
      previousSibling = previousSibling.previousSibling
    }
    while(nextSibling && nextSibling.nodeType === Node.TEXT_NODE) {
      nextSiblingList.push(nextSibling)
      nextText += nextSibling.nodeValue
      nextSibling = nextSibling.nextSibling
    }
    // 删除就文本节点
    const range = document.createRange()
    range.selectNode(node)
    range.deleteContents()
    previousSiblingList.forEach((n) => {
      range.selectNode(n)
      range.deleteContents()
    })
    nextSiblingList.forEach((n) => {
      range.selectNode(n)
      range.deleteContents()
    })
    // 插入新文本节点
    const textNode = document.createTextNode(prevText + this.keyword + nextText)
    range.insertNode(textNode)
  }
}
