export function ponderalWeightLoss(currentWeightID, usualWeightID, timeID, ponderalWeightLossID) {
    try {
        const currentWeight = parseFloat(document.getElementById(currentWeightID).value);
        const usualWeight = parseFloat(document.getElementById(usualWeightID).value);
        const time = parseFloat(document.getElementById(timeID).value);
        const ponderalWeightLoss = ((usualWeight - currentWeight) / usualWeight) * 100;
        // Se currentWeight ou usualWeight menor que zero, retorna erro
        if (currentWeight < 0 || usualWeight < 0) {
            return 1;
        }
        const Classification = {
            NORMAL: 'Normal',
            SIGNIFICANT: 'Significativa',
            SEVERE: 'Severa',
        };
        let classification = Classification.NORMAL;
        if (time <= 7) {
            if (ponderalWeightLoss > 2) {
                classification = Classification.SEVERE;
            } else if (ponderalWeightLoss >= 1) {
                classification = Classification.SIGNIFICANT;
            }
        } else if (time <= 30) {
            if (ponderalWeightLoss > 5) {
                classification = Classification.SEVERE;
            } else if (ponderalWeightLoss >= 2.5) {
                classification = Classification.SIGNIFICANT;
            }
        } else if (time <= 90) {
            if (ponderalWeightLoss > 7.5) {
                classification = Classification.SEVERE;
            } else if (ponderalWeightLoss >= 3.75) {
                classification = Classification.SIGNIFICANT;
            }
        } else if (time <= 180) {
            if (ponderalWeightLoss > 10) {
                classification = Classification.SEVERE;
            } else if (ponderalWeightLoss >= 5) {
                classification = Classification.SIGNIFICANT;
            }
        }
        document.getElementById(ponderalWeightLossID).innerText = `${ponderalWeightLoss.toFixed(
            2
        )}% (${classification.toLowerCase()})`;
        if (!isNaN(ponderalWeightLoss) && classification) {
            return -1;
        }
        return 1;
    } catch (error) {
        console.error(error);
        return 1;
    }
}
