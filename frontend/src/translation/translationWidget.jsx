import useTranslatePage from './translate';
import {useState} from 'react';

/**
 * Component for selecting a language to translate the page.
 * Integrates with useTranslatePage to dynamically update the language of the page content.
 *
 */
function SelectLang(){
    const [language, setLanguage] = useState('en');
    const langOpts = [
        {value: 'en', label: 'English'},
        {value: 'es', label: 'Espanol'},
        {value: 'fr', label: 'Francais'},
        {value: 'de', label: 'Deutsch'},
    ];

    useTranslatePage(language);

    /**
     * Updates the selected language and triggers translation.
     *
     * @param {string} newLang - The new language code selected by the user.
     */
    const handleLanguageChange = (newLang) => {
        setLanguage(newLang);
    };

    return(
        <div className="flex items-center space-x-2">
            {/*<label className="text-sm font-medium text-gray-700"> Choose Language:</label>*/}
            <select 
                className="px-3 py-1 text-sm bg-[#E53935] text-white rounded-lg transition-all duration-300 hover:bg-[#F55A4E] focus:outline-none focus:ring focus:ring-red-300"
                id="dropdown" value={language} onChange={(e) => handleLanguageChange(e.target.value)}>
                {langOpts.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default SelectLang;