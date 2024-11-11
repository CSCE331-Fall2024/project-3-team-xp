
const getAllTextNodes = (element) =>{
    let textNodes = [];
    element.childNodes.forEach((node) => {
        if(node.nodeType === node.TEXT_NODE && node.nodeValue.trim()){
            textNodes.push(node);
        } else if(node.nodeType === node.ELEMENT_NODE && node.nodeName !== 'SCRIPT' && node.nodeName !== 'STYLE'){
            textNodes = textNodes.concat(getAllTextNodes(node));
        }
    });
    return textNodes;
}

export default getAllTextNodes;