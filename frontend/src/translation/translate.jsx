import {useEffect, useState} from 'react';
import getAllTextNodes from './extract';

const translateText = async (texts, targetLang) =>{
    console.log(texts);
    const API_KEY = import.meta.env.VITE_API_KEY; 
    const url = `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`; 
    const response = await fetch(url, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            q: texts,
            target: targetLang,
        }),
    });
    const data = await response.json();
    console.log("translation done.", data);
    return data.data.translations.map((translation) => translation.translatedText);
};

function useTranslatePage(targetLang) {
    let rootElement = document.getElementById('root'); 
    const [contentHash, setContentHash] = useState(null);
    const getRootContentHash = () => (rootElement ? rootElement.innerHTML : '');
    useEffect(() =>{
        const translatePage = async () =>{
            const maxChunkSize = 50;
            let translatedTexts = [];
            const {textNodes, textsToTranslate} = getAllTextNodes(rootElement);
            if(textsToTranslate.length > maxChunkSize){
                let chunk = [];
                for (let i = 0; i < textsToTranslate.length; i += maxChunkSize) {
                    chunk = textsToTranslate.slice(i, i + maxChunkSize);
                    const translatedChunk = await translateText(chunk, targetLang);
                    translatedTexts = translatedTexts.concat(translatedChunk);
                }
            } 
            else{
                translatedTexts = await translateText(textsToTranslate, targetLang);
            }
            textNodes.forEach((node, index) => {
                node.nodeValue = translatedTexts[index];
            });
        };

        const initialHash = getRootContentHash();
        setContentHash(initialHash);
        translatePage();

        const interval = setInterval(() => {
            const currentHash = getRootContentHash();
            if(currentHash !== contentHash){
                setContentHash(currentHash);
                translatePage();
            }
        }, 100);

        return () => clearInterval(interval);

    }, [targetLang, contentHash]);
}

export default useTranslatePage;