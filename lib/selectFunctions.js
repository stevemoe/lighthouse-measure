import readline from "readline";


export async function selectThrottlingOption() {
    const throttlingProfiles = {
        '3g': {
            down: 1600,
            up: 768,
            rtt: 150
        },
        '3gfast': {
            down: 1600,
            up: 768,
            rtt: 75
        },
        '3gslow': {
            down: 400,
            up: 400,
            rtt: 200
        },
        '2g': {
            down: 280,
            up: 256,
            rtt: 400
        },
        cable: {
            down: 5000,
            up: 1000,
            rtt: 14
        },
        dsl: {
            down: 1500,
            up: 384,
            rtt: 25
        },
        '3gem': {
            down: 400,
            up: 400,
            rtt: 200
        },
        '4g': {
            down: 9000,
            up: 9000,
            rtt: 85
        },
        lte: {
            down: 12_000,
            up: 12_000,
            rtt: 35
        },
        edge: {
            down: 240,
            up: 200,
            rtt: 420
        },
        dial: {
            down: 49,
            up: 30,
            rtt: 60
        },
        fois: {
            down: 20_000,
            up: 5000,
            rtt: 2
        }
    };
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const throttlingOptions = Object.entries(throttlingProfiles).map(([name, profile]) => {
        return name
    });
    console.log("Wähle eine Throttling-Option:");
    throttlingOptions.forEach((option, index) => console.log(`${index}) ${option}`))


    return new Promise((resolve) => {
        rl.question('Ihre Auswahl: ', (answer) => {
            const selectedOption = parseInt(answer, 10);
            if (selectedOption >= 0 && selectedOption < throttlingOptions.length) {
                rl.close();
                resolve([throttlingOptions[selectedOption], throttlingProfiles[throttlingOptions[selectedOption]]]);
            } else {
                console.log("Ungültige Auswahl. Bitte versuchen Sie es erneut.");
                rl.close();
                process.exit(1);
            }
        });
    });
}

export async function selectCacheOption() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    console.log("Wähle eine Cache-Option:");
    console.log("1) cache");
    console.log("2) no-cache");

    return new Promise((resolve) => {
        rl.question('Ihre Auswahl: ', (answer) => {
            const selectedOption = parseInt(answer, 10);
            if (selectedOption === 1) {
                rl.close();
                resolve('cache');
            } else if (selectedOption === 2) {
                rl.close();
                resolve('no-cache');
            } else {
                console.log("Ungültige Auswahl. Bitte versuchen Sie es erneut.");
                rl.close();
                process.exit(1);
            }
        });
    });
}

export async function selectFramework(frameworks) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    console.log("Wähle ein Framework oder 'alle' zum Testen aller:");
    frameworks.forEach((fw, index) => {
        console.log(`${index + 1}) ${fw}`);
    });
    console.log(`${frameworks.length + 1}) alle`);

    return new Promise((resolve) => {
        rl.question('Ihre Auswahl: ', (answer) => {
            const selectedIndex = parseInt(answer, 10) - 1;
            if (selectedIndex >= 0 && selectedIndex < frameworks.length) {
                rl.close();
                resolve(frameworks[selectedIndex]);
            } else if (selectedIndex === frameworks.length) {
                rl.close();
                resolve('alle');
            } else {
                console.log("Ungültige Auswahl. Bitte versuchen Sie es erneut.");
                rl.close();
                process.exit(1);
            }
        });
    });
}
