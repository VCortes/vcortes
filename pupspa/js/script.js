let originalBorders = {};

document.addEventListener('keydown', function (event) {
    if (event.ctrlKey) {
        const elements = document.querySelectorAll('*');

        elements.forEach((element) => {
            if (!originalBorders.hasOwnProperty(element)) {
                let computedStyle = getComputedStyle(element);
                originalBorders[element] = computedStyle.border;
            }

            element.style.border = '1px solid red'; // set new border
        });
    }
});

document.addEventListener('keyup', function (event) {
    console.log('up');
    if (event.key === 'Control') {
        const elements = document.querySelectorAll('*');

        elements.forEach((element) => {
            if (originalBorders[element]) {
                element.style.border = originalBorders[element]; // restore original border
            } else {
                element.style.border = ''; // remove border if it didn't have one before
            }
        });

        originalBorders = {}; // clear the saved borders
    }
});
F;
