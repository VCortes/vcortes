import { scrollToTop } from './scrollToTop.js';
import { preventDefaultForms, setSubmitButton, showElement } from './forms.js';
import { setMarkdown, markdownToHTML } from './markdown.js';
import { idealWeight } from './idealWeight.js';
import { estimatedWeight } from './estimatedWeight.js';
import { adjustedWeight } from './adjustedWeight.js';
import { ponderalWeightLoss } from './ponderalWeightLoss.js';
import { calculateIMC } from './imc.js';
import { armCircumference, tricepsSkinfold } from './anthropometry.js';

/* ------------------------- Funcionamento da página ------------------------ */
setMarkdown();
preventDefaultForms();
scrollToTop('l-floating-button');
/* -------------------------- Cálculo do peso ideal ------------------------- */
setSubmitButton('calculate-ideal-weight', () => {
    const errorCode = idealWeight(
        'current-weight',
        'height',
        'gender-2',
        'age-2',
        'fluid-retention',
        'amputations',
        'ideal-weight',
        'estimated-weight-2'
    );
    showElement('ideal-weight-result', errorCode < 0);
});
/* ------------------------ Cálculo do peso estimado ------------------------ */
setSubmitButton('calculate-estimated-weight', () => {
    const errorCode = estimatedWeight(
        'knee-height',
        'arm-circumference',
        'ethnicity',
        'gender',
        'age',
        'estimated-weight'
    );
    showElement('estimated-weight-result', errorCode < 0);
});
/* ------------------------ Cálculo do peso ajustado ------------------------ */
setSubmitButton('calculate-adjusted-weight', () => {
    const errorCode = adjustedWeight('current-weight-2', 'ideal-weight-2', 'adjusted-weight');
    showElement('adjusted-weight-result', errorCode < 0);
});
/* ---------------------- Cálculo da perda ponderal ------------------------ */
setSubmitButton('calculate-ponderal-weight-loss', () => {
    const errorCode = ponderalWeightLoss(
        'current-weight-3',
        'usual-weight',
        'time',
        'ponderal-weight-loss'
    );
    console.log(errorCode);
    showElement('ponderal-weight-loss-result', errorCode < 0);
});
/* ----------------------------------- IMC ---------------------------------- */
setSubmitButton('calculate-imc', () => {
    const errorCode = calculateIMC('current-weight', 'height', 'age', 'imc', 'imc-table');
    document.getElementById('imc-table').innerHTML = markdownToHTML(
        document.getElementById('imc-table').innerHTML
    );
    showElement('imc-result', errorCode < 0);
});
/* -------------------------- Circunferência do braço ----------------------- */
setSubmitButton('calculate-cb', () => {
    const errorCode = armCircumference(
        'cb-obtained',
        'cb-age',
        'cb-gender',
        'cb',
        'cb-interpretation'
    );
    showElement('cb-result', errorCode < 0);
});
/* ------------------------ Dobra cutânea tricipital ------------------------ */
setSubmitButton('calculate-dct', () => {
    const errorCode = tricepsSkinfold('dct-obtained', 'dct-age', 'dct-gender', 'dct');
    showElement('dct-result', errorCode < 0);
});
/* -------------------------------------------------------------------------- */
setTimeout(() => {
    const script = document.createElement('script');
    script.src =
        'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.1/MathJax.js?config=TeX-AMS-MML_HTMLorMML';
    document.head.appendChild(script);
}, 3000);
