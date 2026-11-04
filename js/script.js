
const API = "https://api.dictionaryapi.dev/api/v2/entries/en/";

let savedWords = JSON.parse(localStorage.getItem("words")) || [];

let totalQuiz = Number(localStorage.getItem("totalQuiz")) || 0;
let correctQuiz = Number(localStorage.getItem("correctQuiz")) || 0;


// Show sections

function showSection(sectionId) {

    document.querySelectorAll("main section").forEach(section => {
        section.classList.add("hidden");
    });

    document.getElementById(sectionId).classList.remove("hidden");

    if (sectionId === "savedSection") {
        showSavedWords();
    }
}


// Save words in localStorage

function saveData() {
    localStorage.setItem("words", JSON.stringify(savedWords));
}


// Search word using API

async function searchWord() {

    let word = document.getElementById("wordInput").value.trim();

    let result = document.getElementById("wordResult");

    if (word === "") {
        result.innerHTML = "<p>Please enter a word.</p>";
        return;
    }

    result.innerHTML = "<p>Searching...</p>";

    try {

        let response = await fetch(API + encodeURIComponent(word));

        if (response.status === 404) {
            result.innerHTML = "<p class='text-red-600'>Word not found!</p>";
            return;
        }

        if (!response.ok) {
            throw new Error("Something went wrong");
        }

        let data = await response.json();

        let wordData = data[0];

        let meaning = wordData.meanings[0];
        let definition = meaning.definitions[0].definition;

        let example = meaning.definitions.find(item => item.example)?.example || "No example available.";

        result.innerHTML = `
            <h2 class="text-2xl font-bold">${wordData.word}</h2>

            <p class="text-gray-500">${wordData.phonetic || ""}</p>

            <p class="mt-3">
                <b>Part of Speech:</b> ${meaning.partOfSpeech}
            </p>

            <p class="mt-2">
                <b>Meaning:</b> ${definition}
            </p>

            <p class="mt-2">
                <b>Example:</b> ${example}
            </p>

            <button onclick="saveWord('${wordData.word}', '${definition.replace(/'/g, "\\'")}', '${meaning.partOfSpeech}')"
                class="bg-blue-600 text-white px-4 py-2 rounded mt-3">
                Save Word
            </button>
        `;

    } catch (error) {

        result.innerHTML =
            "<p class='text-red-600'>Unable to fetch word. Try again.</p>";

    }
}


// Save a word

function saveWord(word, definition, partOfSpeech) {

    let exists = savedWords.find(item => item.word === word);

    if (exists) {
        alert("Word already saved!");
        return;
    }

    savedWords.push({
        word: word,
        definition: definition,
        partOfSpeech: partOfSpeech,
        known: 0,
        unknown: 0
    });

    saveData();

    updateStats();

    alert("Word saved successfully!");
}


// Display saved words

function showSavedWords() {

    let search = document.getElementById("savedSearch").value.toLowerCase();

    let list = document.getElementById("savedList");

    let filteredWords = savedWords.filter(item =>
        item.word.toLowerCase().includes(search)
    );

    if (filteredWords.length === 0) {
        list.innerHTML = "<p>No saved words found.</p>";
        return;
    }

    list.innerHTML = filteredWords.map(item => `

        <div class="border p-4 rounded mb-3">

            <h3 class="font-bold text-xl">${item.word}</h3>

            <p>${item.definition}</p>

            <p class="text-sm text-gray-500">${item.partOfSpeech}</p>

            <button onclick="deleteWord('${item.word}')"
                class="bg-red-500 text-white px-3 py-1 rounded mt-2">
                Delete
            </button>

        </div>

    `).join("");

}


// Delete a word

function deleteWord(word) {

    savedWords = savedWords.filter(item => item.word !== word);

    saveData();

    showSavedWords();

    updateStats();

}


// Quiz

let currentWord = null;

function startQuiz() {

    let question = document.getElementById("quizQuestion");
    let answer = document.getElementById("quizAnswer");

    if (savedWords.length === 0) {

        question.innerHTML = "Please save some words before starting the quiz.";

        answer.innerHTML = "";

        return;
    }

    currentWord = savedWords[Math.floor(Math.random() * savedWords.length)];

    question.innerHTML = `
        <div class="bg-blue-50 p-5 rounded">
            <b>Definition:</b>
            <p>${currentWord.definition}</p>
        </div>
    `;

    answer.innerHTML = `
        <button onclick="revealAnswer()"
            class="bg-blue-600 text-white px-4 py-2 rounded">
            Reveal Answer
        </button>
    `;

}


// Reveal answer

function revealAnswer() {

    document.getElementById("quizAnswer").innerHTML = `

        <h3 class="text-xl font-bold mb-3">
            Answer: ${currentWord.word}
        </h3>

        <button onclick="checkAnswer(true)"
            class="bg-green-600 text-white px-4 py-2 rounded">
            I knew it
        </button>

        <button onclick="checkAnswer(false)"
            class="bg-red-600 text-white px-4 py-2 rounded">
            I didn't
        </button>

    `;

}


// Track quiz answers

function checkAnswer(known) {

    totalQuiz++;

    if (known) {
        correctQuiz++;
        currentWord.known++;
    } else {
        currentWord.unknown++;
    }

    localStorage.setItem("totalQuiz", totalQuiz);

    localStorage.setItem("correctQuiz", correctQuiz);

    saveData();

    updateStats();

    document.getElementById("quizAnswer").innerHTML =
        "<p class='text-green-600 font-bold'>Answer recorded!</p>";

}


// Update statistics

function updateStats() {

    document.getElementById("totalWords").innerText = savedWords.length;

    document.getElementById("totalQuiz").innerText = totalQuiz;

    let accuracy = totalQuiz === 0
        ? 0
        : Math.round((correctQuiz / totalQuiz) * 100);

    document.getElementById("accuracy").innerText = accuracy + "%";

}


// Initial load

updateStats();

