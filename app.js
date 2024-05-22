const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const path = require('path');

const app = express();
const server = http.createServer(app);

const hostname = '127.0.0.1';
const port = 3000;


app.use(bodyParser.json());
app.use(express.static('public'));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/result', (req, res) => {
    res.sendFile(__dirname + '/result.html');
});

app.post('/submit', (req, res) => {
    try {
        const formData = req.body;
        
        let bmr = calculateBMR({
            gender: formData.gender,
            weight: formData.weight,
            height: formData.height,
            age: formData.age
        });

        let calories = calculateCalories({
            bmr: bmr,
            activity: formData.activity
        });


        let lbm = calculateLeanBodyMass({
            weight: formData.weight,
            bfp: formData.fat
        });

        let protein = calculateProtein({
            weight: formData.weight
        })

        let fat = calculateFat({
            calories: calories
        })

        let carbs = caluclateCarbs({
            fat: fat,
            protien: protein,
            calories: calories
        })

        calories = calories*(lbm/formData.weight);

        if (formData.goal === 'lose'){
            calories = calories-500;
        }
        else {
            calories = calories+500;
        }

        res.json({ bmr: bmr, calories: calories, protein: protein, fat: fat, carbs: carbs });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

function calculateBMR({ gender, weight, height, age }) {
    if (!gender || !weight || !height || !age) {
        throw new Error('Missing required fields');
    }

    let bmr;
    if (gender === 'male') {
        bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else if (gender === 'female') {
        bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    } else {
        throw new Error('Invalid gender value');
    }

    return bmr;
}

function calculateCalories({ bmr, activity }) {
    if (!bmr || !activity) {
        throw new Error('Missing required fields');
    }

    return bmr * activity;
}

function calculateLeanBodyMass({ weight, bfp}){
    if (!weight || !bfp){
        throw new Error("Missing Required Fields");
    }

    return weight*(1-(bfp/100));
}

function calculateProtein({weight}){
    if (!weight){
        throw new Error("Missisng Required Fields");
    }
    return weight*2;
}

function calculateFat({calories}){
    if(!calories){
        throw new Error("Missing Required Fields");
    }
    return (0.25*calories)/9;
}

function caluclateCarbs({fat, protien, calories}){
    if(!fat || !protien || !calories){
        throw new Error("Missing Required Fields");
    }
    return (calories-((fat*9)+(protien*4)))/4
}

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
