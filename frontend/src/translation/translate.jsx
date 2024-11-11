import {useEffect} from 'react';
import getAllTextNodes from './extract';


const translateText = async (text, targetLang) =>{
    const API_KEY = 'AIzaSyANn7rvIo06Tg58rlS0gWpduGwvuuiQIfQ'; //get googl;e api key in .env file
    const url = `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`; //get url
    const response = await fetch(url, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            q: text,
            target: targetLang,
        }),
    });
    const data = await response.json();
    console.log("translation done.")
    return data.data.translations[0].translatedText;
};

const translateAllNodes = async (textNodes, targetLang) => {
    for(const node of textNodes){
        const originalText = node.nodeValue;
        const translatedText = await translateText(originalText, targetLang);
        node.nodeValue = translatedText;
    }
};

function useTranslatePage(targetLang) {
    let rootElement = document.getElementById('root');
    useEffect(() =>{
        const translatePage = async () =>{
            const textNodes = getAllTextNodes(rootElement);
            await translateAllNodes(textNodes, targetLang);
        };

        translatePage();

        const observer = new MutationObserver(async (mutations) =>{
            for(let mutation of mutations){
                if(mutation.type === 'childList' || mutation.type === 'characterData') {
                    await translatePage();
                }
            }
        });

        observer.observe(rootElement, {
            childList: true,
            subtree: true,
            characterData: true,
        });

        return () => observer.disconnect();

    }, [targetLang]);
}

export default useTranslatePage;