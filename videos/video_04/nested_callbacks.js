function step1(callback) {
    setTimeout(() => {
        console.log("Step 1 completed");
        callback(null, "data from step 1");
    }, 1000);
}

function step2(dataFromStep1, callback) {
    setTimeout(() => {
        console.log("Step 2 completed with:", dataFromStep1);
        callback(null, "data from step 2");
    }, 800);
}

function step3(dataFromStep2, callback) {
    setTimeout(() => {
        console.log("Step 3 completed with:", dataFromStep2);
        callback(null, "data from step 3");
    }, 500);
}

// Callback Hell
step1((err, result1) => {
    if (err) {
        console.error(err);
        return;
    }
    step2(result1, (err, result2) => {
        if (err) {
            console.error(err);
            return;
        }
        step3(result2, (err, result3) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log("All steps completed with:", result3);
        });
    });
});