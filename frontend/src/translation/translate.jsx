import {  useEffect  } from 'react';
import { useLocation } from 'react-router-dom';
import getAllTextNodes from './extract';

/**
 * Translates an array of text strings to a target language using the Google Translate API.
 *
 * @param {Array<string>} texts - An array of text strings to translate.
 * @param {string} targetLang - The target language code (e.g., 'es' for Spanish, 'fr' for French).
 * @returns {Promise<Array<string>>} - A promise that resolves to an array of translated text strings.
 */
const translateText = async (texts, targetLang) => {
    const API_KEY = import.meta.env.VITE_API_KEY; // API key for Google Translate API
    const url = `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            q: texts,
            target: targetLang,
        }),
    });
    const data = await response.json();
    // console.log("translation done.", data);
    return data.data.translations.map((translation) => translation.translatedText);
};

/**
 * Custom React hook that translates the content of a page into a target language.
 * Observes changes in the root element's content and re-translates if updates occur.
 *
 * @param {string} targetLang - The target language code for translation.
 */
function useTranslatePage(targetLang) {
    const location = useLocation();
    let rootElement = document.getElementById('root');
    
    /**
     * Translates the text content of the page.
     * Handles text in chunks if the total number exceeds the maximum allowed by the API.
     */
    useEffect(() => {
        const translatePage = async () => {
            const maxChunkSize = 50; // Maximum chunk size for translation API
            let translatedTexts = [];
            const { textNodes, textsToTranslate } = getAllTextNodes(rootElement);
            if (textsToTranslate.length > maxChunkSize) {
                let chunk = [];
                for (let i = 0; i < textsToTranslate.length; i += maxChunkSize) {
                    chunk = textsToTranslate.slice(i, i + maxChunkSize);
                    const translatedChunk = await translateText(chunk, targetLang);
                    translatedTexts = translatedTexts.concat(translatedChunk);
                }
            }
            else {
                translatedTexts = await translateText(textsToTranslate, targetLang);
            }
            textNodes.forEach((node, index) => {
                node.nodeValue = translatedTexts[index];
            });
        };

        translatePage();

    }, [targetLang, location.pathname]);
}

export default useTranslatePage;