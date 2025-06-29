const apiKeyInput = document.getElementById('apiKeyInput');
const saveApiKeyBtn = document.getElementById('saveApiKey');
const deleteApiKeyBtn = document.getElementById('deleteApiKey');
const currentKeyDiv = document.getElementById('currentKey');
const status = document.getElementById('status');

// 右下に表示する通知用divを作成
let notificationDiv = document.createElement('div');
notificationDiv.style.position = 'fixed';
notificationDiv.style.bottom = '20px';
notificationDiv.style.right = '20px';
notificationDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
notificationDiv.style.color = 'white';
notificationDiv.style.padding = '10px 20px';
notificationDiv.style.borderRadius = '8px';
notificationDiv.style.fontSize = '14px';
notificationDiv.style.zIndex = '1000';
notificationDiv.style.display = 'none';
document.body.appendChild(notificationDiv);

// 通知表示関数（3秒後に自動で非表示）
function showNotification(message) {
    notificationDiv.textContent = message;
    notificationDiv.style.display = 'block';
    setTimeout(() => {
        notificationDiv.style.display = 'none';
    }, 3000);
}

const modelSelect = document.getElementById('modelSelect');
const saveModelBtn = document.getElementById('saveModel');
const deleteModelBtn = document.getElementById('deleteModel');
const currentModelDiv = document.getElementById('currentModel');

const aiSelect = document.getElementById('aiSelect');
const currentAiDiv = document.getElementById('currentAi');

const geminiApiKeyInput = document.getElementById('geminiApiKeyInput');
const saveGeminiApiKeyBtn = document.getElementById('saveGeminiApiKey');
const deleteGeminiApiKeyBtn = document.getElementById('deleteGeminiApiKey');
const currentGeminiKeyDiv = document.getElementById('currentGeminiKey');

const geminiModelSelect = document.getElementById('geminiModelSelect');
const saveGeminiModelBtn = document.getElementById('saveGeminiModel');
const deleteGeminiModelBtn = document.getElementById('deleteGeminiModel');
const currentGeminiModelDiv = document.getElementById('currentGeminiModel');

const chatgptSettingsDiv = document.getElementById('chatgptSettings');
const geminiSettingsDiv = document.getElementById('geminiSettings');

function updateVisibilityByAI(aiType) {
    if (chatgptSettingsDiv && geminiSettingsDiv) {
        if (aiType === 'chatgpt') {
            chatgptSettingsDiv.style.display = '';
            geminiSettingsDiv.style.display = 'none';
        } else if (aiType === 'gemini') {
            chatgptSettingsDiv.style.display = 'none';
            geminiSettingsDiv.style.display = '';
        } else {
            chatgptSettingsDiv.style.display = 'none';
            geminiSettingsDiv.style.display = 'none';
        }
    }
}

// 保存されているAPIキーを読み込み表示（マスク表示）および入力欄に反映
chrome.storage.local.get(['openaiApiKey', 'llmModel', 'aiType', 'geminiApiKey', 'geminiModel'], (result) => {
    if (result.openaiApiKey) {
        currentKeyDiv.textContent = '現在のAPIキー: ' + '*'.repeat(8);
        apiKeyInput.value = result.openaiApiKey;
    } else {
        currentKeyDiv.textContent = 'APIキーは設定されていません。';
        apiKeyInput.value = '';
    }
    if (result.llmModel) {
        currentModelDiv.textContent = '現在のモデル: ' + result.llmModel;
        modelSelect.value = result.llmModel;
    } else {
        currentModelDiv.textContent = 'モデルは設定されていません。';
        modelSelect.value = 'gpt-3.5-turbo';
    }
    if (result.aiType) {
        currentAiDiv.textContent = '現在のAI: ' + result.aiType;
        aiSelect.value = result.aiType;
        updateVisibilityByAI(result.aiType);
    } else {
        currentAiDiv.textContent = 'AIは設定されていません。';
        aiSelect.value = 'chatgpt';
        updateVisibilityByAI('chatgpt');
    }
    if (result.geminiApiKey) {
        currentGeminiKeyDiv.textContent = '現在のGemini APIキー: ' + '*'.repeat(8);
        geminiApiKeyInput.value = result.geminiApiKey;
    } else {
        currentGeminiKeyDiv.textContent = 'Gemini APIキーは設定されていません。';
        geminiApiKeyInput.value = '';
    }
    if (result.geminiModel) {
        currentGeminiModelDiv.textContent = '現在のGeminiモデル: ' + result.geminiModel;
        geminiModelSelect.value = result.geminiModel;
    } else {
        currentGeminiModelDiv.textContent = 'Geminiモデルは設定されていません。';
        geminiModelSelect.value = 'gemini-1';
    }
});

saveApiKeyBtn.addEventListener('click', () => {
    const key = apiKeyInput.value.trim();
    if (!key) {
        status.textContent = 'APIキーを入力してください。';
        return;
    }
    chrome.storage.local.set({ openaiApiKey: key }, () => {
        status.textContent = 'APIキーを保存しました。';
        currentKeyDiv.textContent = '現在のAPIキー: ' + '*'.repeat(8);
        apiKeyInput.value = '';
        showNotification('APIキーを保存しました。');
    });
});

saveGeminiApiKeyBtn.addEventListener('click', () => {
    const key = geminiApiKeyInput.value.trim();
    if (!key) {
        status.textContent = 'Gemini用APIキーを入力してください。';
        return;
    }
    chrome.storage.local.set({ geminiApiKey: key }, () => {
        status.textContent = 'Gemini用APIキーを保存しました。';
        currentGeminiKeyDiv.textContent = '現在のGemini APIキー: ' + '*'.repeat(8);
        geminiApiKeyInput.value = '';
        showNotification('Gemini用APIキーを保存しました。');
    });
});

aiSelect.addEventListener('change', () => {
    const selectedAI = aiSelect.value;
    currentAiDiv.textContent = '現在のAI: ' + selectedAI;
    chrome.storage.local.set({ aiType: selectedAI }, () => {
        status.textContent = 'AIを保存しました。';
        updateVisibilityByAI(selectedAI);
        showNotification('AIを保存しました。');
    });
});

deleteApiKeyBtn.addEventListener('click', () => {
    chrome.storage.local.remove('openaiApiKey', () => {
        status.textContent = 'APIキーを削除しました。';
        currentKeyDiv.textContent = 'APIキーは設定されていません。';
        showNotification('APIキーを削除しました。');
    });
});

deleteGeminiApiKeyBtn.addEventListener('click', () => {
    chrome.storage.local.remove('geminiApiKey', () => {
        status.textContent = 'Gemini用APIキーを削除しました。';
        currentGeminiKeyDiv.textContent = 'Gemini APIキーは設定されていません。';
        showNotification('Gemini用APIキーを削除しました。');
    });
});

saveModelBtn.addEventListener('click', () => {
    const model = modelSelect.value;
    chrome.storage.local.set({ llmModel: model }, () => {
        status.textContent = 'モデルを保存しました。';
        currentModelDiv.textContent = '現在のモデル: ' + model;
        showNotification('モデルを保存しました。');
    });
});

saveGeminiModelBtn.addEventListener('click', () => {
    const model = geminiModelSelect.value;
    chrome.storage.local.set({ geminiModel: model }, () => {
        status.textContent = 'Geminiモデルを保存しました。';
        currentGeminiModelDiv.textContent = '現在のGeminiモデル: ' + model;
        showNotification('Geminiモデルを保存しました。');
    });
});

deleteModelBtn.addEventListener('click', () => {
    chrome.storage.local.remove('llmModel', () => {
        status.textContent = 'モデルを削除しました。';
        currentModelDiv.textContent = 'モデルは設定されていません。';
        modelSelect.value = 'gpt-3.5-turbo';
        showNotification('モデルを削除しました。');
    });
});

deleteGeminiModelBtn.addEventListener('click', () => {
    chrome.storage.local.remove('geminiModel', () => {
        status.textContent = 'Geminiモデルを削除しました。';
        currentGeminiModelDiv.textContent = 'Geminiモデルは設定されていません。';
        geminiModelSelect.value = 'gemini-1';
        showNotification('Geminiモデルを削除しました。');
    });
});

const summaryPromptTextarea = document.getElementById('summaryPrompt');
const savePromptBtn = document.getElementById('savePrompt');
const deletePromptBtn = document.getElementById('deletePrompt');
const currentPromptDiv = document.getElementById('currentPrompt');

const taskListSummaryPromptTextarea = document.getElementById('taskListSummaryPrompt');
const saveTaskListPromptBtn = document.getElementById('saveTaskListPrompt');
const deleteTaskListPromptBtn = document.getElementById('deleteTaskListPrompt');
const currentTaskListPromptDiv = document.getElementById('currentTaskListPrompt');

// 保存されている要約プロンプトを読み込み表示および入力欄に反映
chrome.storage.local.get(['summaryPrompt'], (result) => {
    if (result.summaryPrompt) {
        currentPromptDiv.textContent = '現在のプロンプト:\n' + result.summaryPrompt;
        summaryPromptTextarea.value = result.summaryPrompt;
    } else {
        currentPromptDiv.textContent = 'プロンプトは設定されていません。';
        summaryPromptTextarea.value = '';
    }
});

// 保存されている課題一覧画面用要約プロンプトを読み込み表示および入力欄に反映
chrome.storage.local.get(['taskListSummaryPrompt'], (result) => {
    if (result.taskListSummaryPrompt) {
        currentTaskListPromptDiv.textContent = '現在のプロンプト:\n' + result.taskListSummaryPrompt;
        taskListSummaryPromptTextarea.value = result.taskListSummaryPrompt;
    } else {
        currentTaskListPromptDiv.textContent = 'プロンプトは設定されていません。';
        taskListSummaryPromptTextarea.value = '';
    }
});

savePromptBtn.addEventListener('click', () => {
    const prompt = summaryPromptTextarea.value.trim();
    if (!prompt) {
        // 入力が空の場合は削除と同じ動きにする
        chrome.storage.local.remove('summaryPrompt', () => {
            status.textContent = 'プロンプトを削除しました。';
            currentPromptDiv.textContent = 'プロンプトは設定されていません。';
            summaryPromptTextarea.value = '';
        });
        return;
    }
    chrome.storage.local.set({ summaryPrompt: prompt }, () => {
        status.textContent = 'プロンプトを保存しました。';
        currentPromptDiv.textContent = '現在のプロンプト:\n' + prompt;

        // taskView.jsのAI要約処理を呼び出すメッセージを送信
        chrome.runtime.sendMessage({ type: 'requestSummary' }, (response) => {
            if (response.error) {
                status.textContent = 'AI要約エラー: ' + response.error;
            } else {
                status.textContent = 'AI要約結果: ' + response.result;
            }
        });
    });
});

deletePromptBtn.addEventListener('click', () => {
    chrome.storage.local.remove('summaryPrompt', () => {
        status.textContent = 'プロンプトを削除しました。';
        currentPromptDiv.textContent = 'プロンプトは設定されていません。';
        summaryPromptTextarea.value = '';
    });
});

saveTaskListPromptBtn.addEventListener('click', () => {
    const prompt = taskListSummaryPromptTextarea.value.trim();
    if (!prompt) {
        // 入力が空の場合は削除と同じ動きにする
        chrome.storage.local.remove('taskListSummaryPrompt', () => {
            status.textContent = '課題一覧画面用プロンプトを削除しました。';
            currentTaskListPromptDiv.textContent = 'プロンプトは設定されていません。';
            taskListSummaryPromptTextarea.value = '';
        });
        return;
    }
    chrome.storage.local.set({ taskListSummaryPrompt: prompt }, () => {
        status.textContent = '課題一覧画面用プロンプトを保存しました。';
        currentTaskListPromptDiv.textContent = '現在のプロンプト:\n' + prompt;
    });
});

deleteTaskListPromptBtn.addEventListener('click', () => {
    chrome.storage.local.remove('taskListSummaryPrompt', () => {
        status.textContent = '課題一覧画面用プロンプトを削除しました。';
        currentTaskListPromptDiv.textContent = 'プロンプトは設定されていません。';
        taskListSummaryPromptTextarea.value = '';
    });
});
