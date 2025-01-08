export function estimatedWeight(
    kneeHeightID,
    armCircumferenceID,
    ethnicityID,
    genderID,
    ageID,
    estimatedWeightID
) {
    try {
        const kneeHeight = parseFloat(document.getElementById(kneeHeightID).value);
        const armCircumference = parseFloat(document.getElementById(armCircumferenceID).value);
        const ethnicity = document.getElementById(ethnicityID).value.toLowerCase();
        const gender = document.getElementById(genderID).value.toLowerCase();
        const age = parseFloat(document.getElementById(ageID).value);
        // Se kneeHeight ou armCircumference menor que zero ou age menor que 19 ou maior que 80, retorna erro 
        if (kneeHeight < 0 || armCircumference < 0 || age < 19 || age > 80) {
            return 1;
        }
        // Exibir todos os valores em console table para depuração
        console.table({
            kneeHeight,
            armCircumference,
            ethnicity,
            gender,
            age,
        });
        // Definição de coeficientes a, b, c
        let a = 0;
        let b = 0;
        let c = 0;
        // Ajuste conforme o gênero, etnia e faixa etária
        if (gender === 'feminino' && ethnicity === 'negra') {
            if (age >= 19 && age <= 59) {
                a = 1.24;
                b = 2.97;
                c = -82.48;
            } else if (age >= 60 && age <= 80) {
                a = 1.5;
                b = 2.58;
                c = -84.22;
            }
        } else if (gender === 'feminino' && ethnicity === 'branca') {
            if (age >= 19 && age <= 59) {
                a = 1.01;
                b = 2.81;
                c = -66.04;
            } else if (age >= 60 && age <= 80) {
                a = 1.09;
                b = 2.68;
                c = -65.51;
            }
        } else if (gender === 'masculino' && ethnicity === 'negra') {
            if (age >= 19 && age <= 59) {
                a = 1.09;
                b = 3.14;
                c = -83.72;
            } else if (age >= 60 && age <= 80) {
                a = 0.44;
                b = 2.86;
                c = -39.21;
            }
        } else if (gender === 'masculino' && ethnicity === 'branca') {
            if (age >= 19 && age <= 59) {
                a = 1.19;
                b = 3.14;
                c = -86.82;
            } else if (age >= 60 && age <= 80) {
                a = 1.1;
                b = 3.07;
                c = -75.81;
            }
        }
        // Cálculo do peso estimado usando a fórmula: Peso = (AJ * a) + (CB * b) + c
        const weight = kneeHeight * a + armCircumference * b + c;
        // Calcular peso estimado
        const estimatedWeight = parseFloat(weight.toFixed(2));
        document.getElementById(estimatedWeightID).innerHTML = `${estimatedWeight.toFixed(2)} kg`;
        if (!isNaN(estimatedWeight)) {
            return -1;
        }
    } catch (error) {
        console.error(error);
        return 1;
    }
}
