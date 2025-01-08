export function adjustedWeight(currentWeightId, idealWeightId, adjustedWeightId) {
    try {
        // Obtém os valores dos campos de entrada
        const currentWeight = parseFloat(document.getElementById(currentWeightId).value);
        const idealWeight = parseFloat(document.getElementById(idealWeightId).value);
        // Se currentWeight ou idealWeight menor que zero, retorna erro
        if (currentWeight < 0 || idealWeight < 0) {
            return 1;
        }
        // Calcula o peso ajustado
        const isOverWeight = currentWeight > idealWeight;
        let adjusted;
        if (isOverWeight) {
            adjusted = (currentWeight - idealWeight) * 0.25 + idealWeight;
        } else {
            adjusted = (idealWeight - currentWeight) * 0.25 + currentWeight;
        }
        console.table({
            currentWeight,
            idealWeight,
            isOverWeight,
            adjusted,
        });
        document.getElementById(adjustedWeightId).innerHTML = `${adjusted.toFixed(2)} kg`;
        if (!isNaN(adjusted)) {
            return -1;
        }
    } catch (error) {
        console.error(error);
        return 1;
    }
}
