export function calculateIMC(currentWeightId, heightId, ageId, imcId, tableId) {
    try {
        
    
        const currentWeight = parseFloat(document.getElementById(currentWeightId).value);
        const height = parseFloat(document.getElementById(heightId).value);
        const age = parseFloat(document.getElementById(ageId).value);
        if (isNaN(currentWeight) || isNaN(height) || isNaN(age)) {
            return -1;
        }
        const imc = currentWeight / Math.pow(height, 2);

        // Definição das categorias de IMC conforme a tabela apropriada
        const categoriasAdultos = [
            { limiteInferior: 40, limiteSuperior: Infinity, estado: 'Obesidade grau III' },
            { limiteInferior: 35.0, limiteSuperior: 39.99, estado: 'Obesidade grau II' },
            { limiteInferior: 30.0, limiteSuperior: 34.99, estado: 'Obesidade grau I' },
            { limiteInferior: 25.0, limiteSuperior: 29.99, estado: 'Sobrepeso' },
            { limiteInferior: 18.5, limiteSuperior: 24.99, estado: 'Eutrófico (normal)' },
            { limiteInferior: 17.0, limiteSuperior: 18.49, estado: 'Magreza grau I' },
            { limiteInferior: 16.0, limiteSuperior: 16.99, estado: 'Magreza grau II' },
            { limiteInferior: -Infinity, limiteSuperior: 15.99, estado: 'Magreza grau III' },
        ];

        const categoriasIdosos = [
            { limiteInferior: 27.01, limiteSuperior: Infinity, estado: 'Sobrepeso' },
            { limiteInferior: 22.0, limiteSuperior: 27.0, estado: 'Eutrófico' },
            { limiteInferior: -Infinity, limiteSuperior: 21.99, estado: 'Baixo peso' },
        ];

        // Selecionar a tabela de categorias com base na idade
        const categorias = age >= 60 ? categoriasIdosos : categoriasAdultos;

        // Função para determinar o estado nutricional baseado no IMC
        function determinarEstado(imc) {
            for (let categoria of categorias) {
                if (imc >= categoria.limiteInferior && imc <= categoria.limiteSuperior) {
                    return categoria.estado;
                }
            }
            return 'Desconhecido';
        }

        // Determinar o estado atual do indivíduo
        const estadoAtual = determinarEstado(imc);

        // Função para calcular o peso correspondente para um dado IMC e altura
        function calcularPeso(imc, height) {
            return (imc * height * height).toFixed(1);
        }

        // Gerar a tabela Markdown
        let tabelaMarkdown = `| IMC               | Estado Nutricional       | Peso para h = ${height.toFixed(
            1
        )} m (kg) |\n`;
        tabelaMarkdown += `|-------------------|--------------------------|--------------------------------------|\n`;

        categorias.forEach((categoria) => {
            let imcRange;
            if (categoria.limiteInferior === -Infinity) {
                imcRange = `< ${categoria.limiteSuperior.toFixed(1)}`;
            } else if (categoria.limiteSuperior === Infinity) {
                imcRange = `≥ ${categoria.limiteInferior.toFixed(1)}`;
            } else {
                imcRange = `${categoria.limiteInferior.toFixed(1)} a ${categoria.limiteSuperior.toFixed(
                    1
                )}`;
            }

            let pesoMin = calcularPeso(categoria.limiteInferior, height);
            let pesoMax = calcularPeso(categoria.limiteSuperior, height);
            let pesoDisplay;

            if (categoria.limiteSuperior === Infinity) {
                pesoDisplay = `≥ ${pesoMin}`;
            } else if (categoria.limiteInferior === -Infinity) {
                pesoDisplay = `< ${pesoMax}`;
            } else {
                pesoDisplay = `${pesoMin} a ${pesoMax}`;
            }

            // Verificar se esta é a categoria atual para aplicar negrito
            let linha = `| ${imcRange} | ${categoria.estado} | ${pesoDisplay} |`;
            if (categoria.estado === estadoAtual) {
                linha = `| **${imcRange}** | **${categoria.estado}** | **${pesoDisplay}** |`;
            }

            tabelaMarkdown += `${linha}\n`;
        });

        // Retornar o IMC e a tabela Markdown
        document.getElementById(imcId).innerText = `${imc.toFixed(1)} - ${estadoAtual}`;
        document.getElementById(tableId).innerHTML = tabelaMarkdown;
        if (!isNaN(imc) && estadoAtual) {
            return -1;
        }
        return 1;
    }
    catch (error) {
        console.error(error);
        return 1;
    }
}
