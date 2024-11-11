//TO-DO: Make faster
const getAllTextNodes = (element) => {
    const textNodes = [];
    const textsToTranslate = [];
  
    const traverseNodes = (node) => {
      if (node.nodeType === Node.TEXT_NODE && node.nodeValue.trim()) {
        textNodes.push(node);
        textsToTranslate.push(node.nodeValue);
      } else if (node.nodeType === Node.ELEMENT_NODE && node.nodeName !== 'SCRIPT' && node.nodeName !== 'STYLE') {
        node.childNodes.forEach(traverseNodes);
      }
    };
    traverseNodes(element);
    //console.log(textsToTranslate);
    return { textNodes, textsToTranslate };
}

export default getAllTextNodes;