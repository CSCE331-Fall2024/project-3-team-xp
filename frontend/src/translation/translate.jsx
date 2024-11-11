import {useEffect, useState} from 'react';
import getAllTextNodes from './extract';

const translateText = async (texts, targetLang) =>{
    //require('dotenv').config();
    const API_KEY = import.meta.env.VITE_API_KEY; //get googl;e api key in .env file
    console.log(import.meta.env);
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
    let rootElement = document.getElementById('root'); //replace root with smaller div.
    const [contentHash, setContentHash] = useState(null);
    const getRootContentHash = () => (rootElement ? rootElement.innerHTML : '');
    useEffect(() =>{
        const translatePage = async () =>{
            const {textNodes, textsToTranslate} = getAllTextNodes(rootElement);
            // console.log('texts to be translated', textsToTranslate);
            const translatedTexts = await translateText(textsToTranslate, targetLang);
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