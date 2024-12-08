/**
 * Extracts all text nodes from a given DOM element, excluding text within script and style tags.
 * 
 * @param {HTMLElement} element - The root DOM element to start extracting text nodes from.
 * @returns {Object} - An object containing two arrays:
 *  - textNodes: The list of text node objects found within the element.
 *  - textsToTranslate: The corresponding text content of the text nodes.
 */
const getAllTextNodes = (element) => {
    const textNodes = [];
    const textsToTranslate = [];
  
    /**
     * Recursively traverses the DOM tree starting from the provided node,
     * collecting text nodes and their content.
     * 
     * @param {Node} node - The current DOM node being traversed.
     */
    const traverseNodes = (node) => {
      if (node.nodeType === Node.TEXT_NODE && node.nodeValue.trim()) {
        textNodes.push(node);
        textsToTranslate.push(node.nodeValue);
      } else if (node.nodeType === Node.ELEMENT_NODE && node.nodeName !== 'SCRIPT' && node.nodeName !== 'STYLE') {
        node.childNodes.forEach(traverseNodes);
      }
    };
    traverseNodes(element);
    return { textNodes, textsToTranslate };
}

export default getAllTextNodes;