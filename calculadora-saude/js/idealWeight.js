export function idealWeight(
    currentWeightId,
    heightId,
    genderId,
    ageId,
    fluidRetentionId,
    amputationsId,
    idealWeightId,
    estimatedWeightId
) {
    try {
        // Obtém os valores dos campos de entrada
        const currentWeight = parseFloat(document.getElementById(currentWeightId).value);
        const height = parseFloat(document.getElementById(heightId).value);
        const gender = document.getElementById(genderId).value;
        const isWoman = gender === 'feminino';
        const age = parseInt(document.getElementById(ageId).value, 10);
        const fluidRetentionInput = document.getElementById(fluidRetentionId);
        const fluidRetention = fluidRetentionInput.value
            ? parseFloat(fluidRetentionInput.value)
            : 0;
        // Se currentWeight, height, age ou fluidRetention menor que zero, retorna erro
        if (currentWeight < 0 || height < 0 || age < 0 || fluidRetention < 0) {
            return 1;
        }
        // Obtém todas as checkboxes de amputações que estão marcadas
        const amputationsCheckboxes = document.querySelectorAll(
            `#${amputationsId} > input:checked`
        );
        const amputations = Array.from(amputationsCheckboxes).map((checkbox) => checkbox.value);
        // Calcula amputationsPercentage
        const amputationsPercentage = amputations.reduce((total, value) => {
            return total + parseFloat(value);
        }, 0);
        // Calcula o peso ideal
        let IMC_medio;
        if (isWoman) {
            if (age >= 60 && age <= 69) {
                IMC_medio = 26.5;
            } else if (age >= 70 && age <= 74) {
                IMC_medio = 26.3;
            } else if (age >= 75 && age <= 79) {
                IMC_medio = 25.1;
            } else if (age >= 80 && age <= 84) {
                IMC_medio = 24.5;
            } else if (age > 85) {
                IMC_medio = 23.6;
            } else {
                IMC_medio = 21;
            }
        } else {
            if (age >= 60 && age <= 69) {
                IMC_medio = 24.3;
            } else if (age >= 70 && age <= 74) {
                IMC_medio = 25.1;
            } else if (age >= 75 && age <= 79) {
                IMC_medio = 23.9;
            } else if (age >= 80 && age <= 84) {
                IMC_medio = 23.7;
            } else if (age > 85) {
                IMC_medio = 23.1;
            } else {
                IMC_medio = 22;
            }
        }
        // Calcula o Peso Ideal
        const PI = Math.pow(height, 2) * IMC_medio;
        console.table({
            currentWeight,
            height,
            gender,
            age,
            fluidRetention,
            amputations,
            amputationsPercentage,
            IMC_medio,
            PI,
        });
        // Calcular peso sem as amputações
        const weightWithoutAmputations = currentWeight / (1 - amputationsPercentage / 100);
        // Calcular peso seco
        const dryWeight = weightWithoutAmputations - fluidRetention;
        // Exibir os resultados
        document.getElementById(idealWeightId).innerHTML = `${PI.toFixed(2)} kg`;
        document.getElementById(estimatedWeightId).innerHTML = `${dryWeight.toFixed(2)} kg`;
        if (!isNaN(PI) && !isNaN(dryWeight)) {
            return -1;
        }
    } catch (error) {
        console.error(error);
        return 1;
    }
}
