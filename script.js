// DOM Elements
const loader = document.getElementById('loader');
const viewPrompt = document.getElementById('view-prompt');
const viewSounds = document.getElementById('view-sounds');
const navBtns = document.querySelectorAll('.nav-btn');
const promptInput = document.getElementById('prompt-input');
const outputJson = document.getElementById('output-json');
const generateBtn = document.getElementById('generate-btn');
const copyBtn = document.getElementById('copy-btn');
const toast = document.getElementById('toast');
const modelSelect = document.getElementById('model-select');
const scBtn = document.querySelectorAll('.sc-btn');
const toggleBtn = document.querySelectorAll('.toggle-btn');
const intensitySlider = document.getElementById('intensity-slider');
const intensityVal = document.getElementById('intensity-val');

// API Configuration
const API_KEY = "AIzaSyAwkDcos9APbj5PVzuKXYMpJo0bX0AfMaE"; // Reemplaza con tu API Key de Google AI Studio

// Navigation Logic
const views = {
    'prompt': document.getElementById('view-prompt'),
    'sounds': document.getElementById('view-sounds'),
    'results': document.getElementById('view-results'),
    'settings': document.getElementById('view-settings')
};

navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const selectedView = btn.dataset.view;
        if (!selectedView) return;

        // Toggle active button
        navBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Show/Hide sections
        Object.keys(views).forEach(v => {
            if (v === selectedView) {
                views[v].classList.remove('hidden');
            } else {
                views[v].classList.add('hidden');
            }
        });
    });
});

let debounceTimer;
let currentSettings = {
    contentType: 'video',
    style: 'Cinemático',
    intensity: 0.8
};

// Event Listeners
promptInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(generateResponse, 800);
});

scBtn.forEach(btn => {
    btn.addEventListener('click', () => {
        scBtn.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentSettings.contentType = btn.dataset.type;
        generateResponse();
    });
});

toggleBtn.forEach(btn => {
    btn.addEventListener('click', () => {
        toggleBtn.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentSettings.style = btn.dataset.style;
        generateResponse();
    });
});

intensitySlider.addEventListener('input', (e) => {
    currentSettings.intensity = e.target.value;
    intensityVal.textContent = e.target.value;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(generateResponse, 1000);
});

modelSelect.addEventListener('change', generateResponse);

generateBtn.addEventListener('click', generateResponse);

copyBtn.addEventListener('click', () => {
    const text = outputJson.innerText;
    navigator.clipboard.writeText(text).then(() => {
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2000);
    });
});

async function generateResponse() {
    const prompt = promptInput.value.trim();
    if (!prompt) {
        outputJson.innerText = "Esperando prompt...";
        return;
    }

    try {
        loader.classList.remove('hidden');
        outputJson.style.opacity = "0.5";

        const modelValue = modelSelect.value;
        const taskType = currentSettings.contentType === 'video' ? 'video_generation' : 'image_generation';

        // Map UI selection to actual model IDs
        let modelId = "gemini-1.5-flash";
        if (modelValue.includes("Pro")) modelId = "gemini-1.5-pro";

        const payload = {
            contents: [{
                parts: [{
                    text: `Genera un JSON de configuración para este prompt: "${prompt}". 
                    El JSON debe seguir este formato exacto:
                    {
                      "api_endpoint": "https://jeandesignia.api/v1",
                      "model": "${modelValue}",
                      "task_type": "${taskType}",
                      "scene": "${prompt}",
                      "style": "${currentSettings.style}",
                      "parameters": {
                        "intensity": ${currentSettings.intensity},
                        "scene_complexity": "High",
                        "content_safety": true,
                        "seed": 445890211
                      }
                    }
                    Responde únicamente con el JSON puro, sin bloques de código ni texto adicional.`
                }]
            }]
        };

        if (!API_KEY || API_KEY === "PONER_TU_API_KEY_AQUI") {
            throw new Error("Por favor, configura tu API Key en script.js");
        }

        // Using v1beta endpoint which is required for AI Studio keys and newer models
        const finalUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${API_KEY.trim()}`;

        const response = await fetch(finalUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

        const data = await response.json();
        let resultText = data.candidates[0].content.parts[0].text;

        // Clean markdown if present
        resultText = resultText.replace(/```json|```/gi, '').trim();

        outputJson.innerText = resultText;
        outputJson.style.color = "#00FF7F";
        outputJson.style.opacity = "1";

        // Update status text
        document.getElementById('status-text').textContent = "Gemini 1.5 Flash Online";

    } catch (error) {
        outputJson.innerText = `Error: ${error.message}`;
        outputJson.style.color = "#DC143C";
        outputJson.style.opacity = "1";

        // Update status text to error
        document.getElementById('status-text').textContent = "Error de Conexión";
    } finally {
        loader.classList.add('hidden');
    }
}
