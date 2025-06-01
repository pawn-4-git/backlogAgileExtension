function handleAiCommentButtonClick() {
    const currentUrl = window.location.href;
    const shouldShowButton = currentUrl.includes("backlog.jp/find/") || currentUrl.includes("backlog.com/find/");

    let aiSummaryButton = document.getElementById("aiSummaryButton");

    if (shouldShowButton) {
        // Add AI summary button at bottom right if not exists
        if (!aiSummaryButton) {
            aiSummaryButton = document.createElement("button");
            aiSummaryButton.id = "aiSummaryButton";
            aiSummaryButton.type = "button";
            aiSummaryButton.textContent = "AI要約";

            aiSummaryButton.addEventListener("click", async function (event) { // asyncを追加
                event.stopPropagation();
                // Toggle the visibility of the speech bubble
                let bubble = document.getElementById("aiSummaryBubble");
                if (!bubble) {
                    bubble = document.createElement("div");
                    bubble.id = "aiSummaryBubble";
                    bubble.style.position = "fixed";
                    bubble.style.bottom = "60px";
                    bubble.style.right = "20px";
                    bubble.style.zIndex = "1001";
                    bubble.style.padding = "10px 15px";
                    bubble.style.backgroundColor = "white";
                    bubble.style.color = "black";
                    bubble.style.border = "1px solid #ccc";
                    bubble.style.borderRadius = "5px";
                    bubble.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
                    bubble.style.maxWidth = "300px";
                    bubble.style.fontSize = "14px";
                    bubble.style.lineHeight = "1.4";
                    bubble.style.whiteSpace = "normal";
                    bubble.style.wordWrap = "break-word";
                    bubble.style.overflowWrap = "break-word";
                    bubble.textContent = "要約中..."; // 要約が完了するまで表示するメッセージ

                    document.body.appendChild(bubble);

                    const summary = await summarizeIssueList(); // awaitを追加
                    bubble.textContent = summary;

                    // Add event listener to close bubble when clicking outside
                    document.addEventListener("click", function docClickListener(e) {
                        if (bubble && !bubble.contains(e.target) && e.target !== aiSummaryButton) {
                            bubble.remove();
                            document.removeEventListener("click", docClickListener);
                        }
                    });
                } else {
                    bubble.remove();
                }
            });

            document.body.appendChild(aiSummaryButton);
        }
    } else {
        // Remove AI summary button if it exists and URL does not contain "/find/"
        if (aiSummaryButton) {
            aiSummaryButton.remove();
        }
    }
}

// 5秒おきにhandleAiCommentButtonClickを実行
setInterval(() => {
    handleAiCommentButtonClick();
}, 5000);

async function summarizeIssueList() {
    let screenText;
    try {
        if (typeof getSummaryTextFromScreen === 'function') {
            screenText = getSummaryTextFromScreen();
        } else {
            console.error("getSummaryTextFromScreen関数が定義されていません。");
            return "エラー: 要約するための元のデータが取得できませんでした。";
        }
    } catch (error) {
        console.error("画面テキストの取得中にエラーが発生しました:", error);
        return "エラー: 要約するための元のデータが取得できませんでした。";
    }

    if (!screenText || screenText.trim() === "") {
        return "エラー: 要約するための元のデータが取得できませんでした。";
    }

    // chrome.storage.localから設定値を取得
    const settings = await new Promise(resolve => {
        chrome.storage.local.get(['openaiApiKey', 'llmModel', 'aiType', 'geminiApiKey', 'geminiModel', 'taskListSummaryPrompt'], result => {
            resolve(result);
        });
    });

    const { openaiApiKey, llmModel, aiType, geminiApiKey, geminiModel, taskListSummaryPrompt } = settings;

    if (!taskListSummaryPrompt) {
        return "エラー: 課題一覧画面用要約プロンプトが設定されていません。";
    }

    let apiKey;
    let model;
    let apiUrl;
    let headers;
    let body;

    if (aiType === 'chatgpt') {
        apiKey = openaiApiKey;
        model = llmModel || 'gpt-3.5-turbo';
        apiUrl = 'https://api.openai.com/v1/chat/completions';
        headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        };
        body = JSON.stringify({
            model: model,
            messages: [{ role: "user", content: `${taskListSummaryPrompt}\n\n${screenText}` }],
            temperature: 0.7
        });
    } else if (aiType === 'gemini') {
        apiKey = geminiApiKey;
        model = geminiModel || 'gemini-pro'; // Geminiのデフォルトモデル
        apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        headers = {
            'Content-Type': 'application/json'
        };
        body = JSON.stringify({
            contents: [{ parts: [{ text: `${taskListSummaryPrompt}\n\n${screenText}` }] }]
        });
    } else {
        return "エラー: 未知のAIタイプが設定されています。";
    }

    if (!apiKey) {
        return `エラー: ${aiType === 'chatgpt' ? 'OpenAI' : 'Gemini'} APIキーが設定されていません。`;
    }

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: headers,
            body: body
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("APIエラーレスポンス:", errorData);
            return `APIエラー: ${response.status} ${response.statusText} - ${errorData.error ? errorData.error.message : JSON.stringify(errorData)}`;
        }

        const data = await response.json();

        let summaryResult = "要約結果を取得できませんでした。";
        if (aiType === 'chatgpt' && data.choices && data.choices.length > 0) {
            summaryResult = data.choices[0].message.content;
        } else if (aiType === 'gemini' && data.candidates && data.candidates.length > 0) {
            summaryResult = data.candidates[0].content.parts[0].text;
        }

        return summaryResult;

    } catch (error) {
        console.error("API呼び出し中にエラーが発生しました:", error);
        return `API呼び出しエラー: ${error.message}`;
    }
}
