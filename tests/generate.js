// // Esse script é um dedicated worker que gera números aleatórios e envia para a thread main. O script main.js envia uma mensagem para o worker com o comando 'generate' e a quantidade de números a serem gerados. O worker gera os números e envia para a thread main. A thread main exibe os números gerados no div #output.
// // Ouve o evento "message" para receber mensagens da thread main
// self.addEventListener('message', (message) => {
//     const { command, quota } = message.data;
//     if (command === 'generate') {
//         generatePrimes(quota);
//     }
// });

// // Generate primes (very inefficiently)
// function generatePrimes(quota) {
//     function isPrime(n) {
//         for (let c = 2; c <= Math.sqrt(n); ++c) {
//             if (n % c === 0) {
//                 return false;
//             }
//         }
//         return true;
//     }

//     const primes = [];
//     const maximum = 1000000;

//     while (primes.length < quota) {
//         const candidate = Math.floor(Math.random() * (maximum + 1));
//         if (isPrime(candidate)) {
//             console.log(candidate);
//             primes.push(candidate);
//         }
//     }

//     // When we have finished, send a message to the main thread,
//     // including the number of primes we generated.
//     self.postMessage(primes.length);
// }
