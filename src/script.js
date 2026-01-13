let currentTeam = null;
let teamNames = { red: "RED TEAM", blue: "BLUE TEAM" };
let scores = { red: 0, blue: 0 };
let currentQ = null;
let timer = null;
let timeLeft = 30;

const db = {
    1: { q: "Which country's flag is this?", img: "static/ph.png", a: "philippines" },
    2: { q: "Which country's flag is this?", img: "static/jp.png", a: "japan" },
    3: { q: "Which country's flag is this?", img: "https://flagcdn.com/w320/kr.png", a: "south korea" },
    4: { q: "Which country's flag is this?", img: "https://flagcdn.com/w320/us.png", a: "usa" },
    5: { q: "Which country's flag is this?", img: "https://flagcdn.com/w320/gb.png", a: "united kingdom" },
    6: { q: "Which country's flag is this?", img: "https://flagcdn.com/w320/fr.png", a: "france" },
    7: { q: "Which country's flag is this?", img: "https://flagcdn.com/w320/it.png", a: "italy" },
    8: { q: "Which country's flag is this?", img: "https://flagcdn.com/w320/de.png", a: "germany" },
    9: { q: "Which country's flag is this?", img: "https://flagcdn.com/w320/br.png", a: "brazil" },
    10: { q: "Which country's flag is this?", img: "https://flagcdn.com/w320/ca.png", a: "canada" },
    
    11: { q: "What is the brain of the computer?", options: ["RAM", "CPU", "Hard drive", "Monitor"], correct: "CPU" },
    12: { q: "What does RAM do?", options: ["Stores files forever", "Displays images", "Temporarily stores data", "Prints documents"], correct: "Temporarily stores data" },
    13: { q: "Which part shows images on the screen?", options: ["Keyboard", "Monitor", "CPU", "USB"], correct: "Monitor" },
    14: { q: "What is used to type text?", options: ["Mouse", "Speaker", "Keyboard", "Webcam"], correct: "Keyboard" },
    15: { q: "Which part stores files like photos and videos?", options: ["RAM", "Hard drive", "CPU", "Fan"], correct: "Hard drive" },
    16: { q: "What does a mouse do?", options: ["Prints files", "Moves the cursor", "Stores data", "Plays music"], correct: "Moves the cursor" },
    17: { q: "Which part helps keep the computer cool?", options: ["Fan", "Screen", "Keyboard", "USB cable"], correct: "Fan" },
    18: { q: "What is a USB used for?", options: ["Cooling the computer", "Connecting devices", "Displaying graphics", "Typing code"], correct: "Connecting devices" },
    19: { q: "Which part produces sound?", options: ["Monitor", "Speaker", "Mouse", "CPU"], correct: "Speaker" },
    20: { q: "What turns electricity into usable power for the computer?", options: ["Motherboard", "Power supply", "RAM", "Hard drive"], correct: "Power supply" },
    21: { q: "What do you call the 'address' of a website?", a: "url" },
    22: { q: "What is the most popular search engine in the world?", a: "google" },
    23: { q: "What software is used to view websites (Chrome, Safari, etc.)?", a: "browser" },
    24: { q: "What is the global system of interconnected computer networks called?", a: "internet" }
};
function selectTeam(t) {
    currentTeam = t;
    teamNames.red = document.getElementById('name-red').value.toUpperCase();
    teamNames.blue = document.getElementById('name-blue').value.toUpperCase();
        

    //cause ng bug sa ibang browser ETH3322
    document.getElementById('label-red').textContent = teamNames.red;
    document.getElementById('label-blue').textContent = teamNames.blue;

    const indicator = document.getElementById('active-team-indicator');
    indicator.textContent = teamNames[t] + " TURN";
    indicator.style.backgroundColor = t === 'red' ? 'var(--red-team)' : 'var(--blue-team)';
    indicator.style.color = 'white';
    indicator.style.borderColor = 'transparent';
    
    document.getElementById('turn-prompt').textContent = teamNames[t] + ": Choose a Number";
    document.getElementById('team-modal').style.display = 'none';
    document.getElementById('q-num-input').focus();
}

function startQuestion() {
    let val = document.getElementById('q-num-input').value;
    if(!db[val]) return;
    currentQ = db[val];
    
    // LOGIC FOR SHOWING/HIDING IMAGE
    const imgEl = document.getElementById('q-image');
    if(currentQ.img) {
        imgEl.src = currentQ.img;
        imgEl.style.display = 'block';
    } else {
        imgEl.style.display = 'none';
    }

    document.getElementById('q-text').textContent = currentQ.q;
    
    if(currentQ.options) {
        document.getElementById('mcq-area').style.display = 'grid';
        document.getElementById('input-area').style.display = 'none';
        setupMCQ();
    } else {
        document.getElementById('mcq-area').style.display = 'none';
        document.getElementById('input-area').style.display = 'block';
        document.getElementById('ans-input').value = "";
        setTimeout(() => document.getElementById('ans-input').focus(), 50);
    }
    showScreen('view-quiz');
    startTimer();
}

function setupMCQ() {
    const area = document.getElementById('mcq-area');
    area.innerHTML = "";
    let shuffled = [...currentQ.options].sort(() => Math.random() - 0.5);
    shuffled.forEach((opt) => {
        const btn = document.createElement('button');
        btn.className = "option-btn";
        btn.textContent = opt;
        btn.onclick = () => checkMCQAnswer(opt);
        area.appendChild(btn);
    });
}

function startTimer() {
    timeLeft = 30;
    document.getElementById('timer-display').textContent = timeLeft;
    clearInterval(timer);
    timer = setInterval(() => {
        timeLeft--;
        document.getElementById('timer-display').textContent = timeLeft;
        if(timeLeft <= 0) {
            clearInterval(timer);
            showFeedback(false, "TIME'S UP", "Correct: " + (currentQ.a || currentQ.correct).toUpperCase());
        }
    }, 1000);
}

function checkMCQAnswer(selected) {
    clearInterval(timer);
    if(selected === currentQ.correct) processWin();
    else showFeedback(false, "WRONG", "Correct: " + currentQ.correct.toUpperCase());
}

function checkInputAnswer() {
    clearInterval(timer);
    let userAns = document.getElementById('ans-input').value.toLowerCase().trim();
    if(userAns === (currentQ.a || "").toLowerCase()) processWin();
    else showFeedback(false, "WRONG", "Correct: " + currentQ.a.toUpperCase());
}

function processWin() {
    scores[currentTeam]++;
    updateScores();
    showFeedback(true, "CORRECT", "Point for " + teamNames[currentTeam]);
}

function showFeedback(isCorrect, title, reveal) {
    const overlay = document.getElementById('feedback-overlay');
    document.getElementById('feedback-msg').textContent = title;
    document.getElementById('feedback-reveal').textContent = reveal;
    overlay.className = isCorrect ? 'correct-bg' : 'wrong-bg';
    overlay.style.display = 'flex';
}

function closeFeedback() {
    document.getElementById('feedback-overlay').style.display = 'none';
    document.getElementById('team-modal').style.display = 'flex';
    showScreen('view-input');
    document.getElementById('q-num-input').value = "";
    currentTeam = null;
    document.getElementById('active-team-indicator').textContent = "PICK A TEAM";
    document.getElementById('active-team-indicator').style.backgroundColor = "transparent";
    document.getElementById('active-team-indicator').style.color = "var(--bronze)";
    document.getElementById('active-team-indicator').style.borderColor = "var(--bronze)";
}

function updateScores() {
    document.getElementById('score-red').textContent = scores.red;
    document.getElementById('score-blue').textContent = scores.blue;
}

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}