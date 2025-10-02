function step1Promise() {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log("Step 1 completed");
            resolve("data from step 1");
        }, 1000);
    });
}

function step2Promise(dataFromStep1) {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log("Step 2 completed with:", dataFromStep1);
            resolve("data from step 2");
        }, 800);
    });
}

function step3Promise(dataFromStep2) {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log("Step 3 completed with:", dataFromStep2);
            resolve("data from step 3");
        }, 500);
    });
}

// Using Promises
step1Promise()
    .then((result1) => step2Promise(result1))
    .then((result2) => step3Promise(result2))
    .then((result3) => {
        console.log("All steps completed with:", result3);
    })
    .catch((error) => {
        console.error("An error occurred:", error);
    });