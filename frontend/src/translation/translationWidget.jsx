import useTranslatePage from './translate';
import {useState} from 'react';

function SelectLang(){
    const [language, setLanguage] = useState('en');
    const langOpts = [
        {value: 'en', label: 'English'},
        {value: 'es', label: 'Espanol'},
        {value: 'fr', label: 'Francais'},
        {value: 'ds', label: 'Deutsch'},
    ];

    useTranslatePage(language);

    const handleLanguageChange = (newLang) => {
        setLanguage(newLang);
    };

    return(
        <div>
            <label> Choose Language:</label>
            <select id="dropdown" value={language} onChange={(e) => handleLanguageChange(e.target.value)}>
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