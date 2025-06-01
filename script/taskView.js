function taskViewFunction() {

    const svg = "http://www.w3.org/2000/svg";
    let dialog = document.getElementById("categoryTaskDialog");
    if (document.getElementById('notCloseTask') != null) {
        document.getElementById('notCloseTask').remove();
    }
    let taskDiv = document.createElement("div");
    taskDiv.innerHTML = '';
    taskDiv.style.setProperty('display', 'flex')
    taskDiv.id = 'notCloseTask';
    let taskCircle = document.createElementNS(svg, "svg");
    let taskWCircle = document.createElementNS(svg, "svg");

    taskCircle.classList.add('circleView');
    taskWCircle.classList.add('circleView');
    viewBox = "0 0 64 64"
    const cx = '50%';
    const cy = '50%';
    const r = 100 / (2 * Math.PI);
    taskCircle.setAttributeNS(null, 'viewBox', '0 0 64 64');
    taskWCircle.setAttributeNS(null, 'viewBox', '0 0 64 64');

    if (document.getElementById('taskDialogTitle') == null) {
        let taskTitleDiv = document.createElement("h2");
        taskTitleDiv.innerText = "状況確認"
        taskTitleDiv.id = 'taskDialogTitle';
        dialog.appendChild(taskTitleDiv);
    }

    let taskViewDiv = document.createElement("div");
    taskViewDiv.classList.add('taskViewDiv');
    taskViewDiv.id = 'taskViewCircle';
    let taskWViewDiv = document.createElement("div");
    taskWViewDiv.classList.add('taskWViewDiv');
    taskWViewDiv.id = 'taskWViewCircle';
    const list = getList();
    let total = getTotalTaskCount(list);
    let totalW = getTotalEstimatedCount(list);
    let wExistCheck = false;
    if (total > 0) {
        let text = '';
        let closeCardCount = 0;
        let totalPercent = 100;
        let closeWCardCount = 0;
        let totalWPercent = 100;
        //完了したタスクの数を整理
        let notClosePercent = 0;
        let notClosePercentW = 0;

        for (let i = 0; i < list.length; i++) {
            let count = getTaskCount(list[i]);
            let title = getTitle(list[i]);
            let wcount = getEstimatedCount(list[i]);
            if (title === '処理済み' || title === '完了') {
                closeCardCount += count;
                closeWCardCount += wcount;
            } else if (count > 0) {
                let percent = Math.floor(count * 100 / total);
                if (percent < 1) {
                    percent = 1;
                }
                notClosePercent += percent;

                let wpercent = Math.floor(wcount * 100 / totalW);
                if (wpercent < 1) {
                    wpercent = 1;
                }
                notClosePercentW += wpercent;
            }
        }
        if (closeCardCount > 0) {
            totalPercent = 100 - notClosePercent;
            if (totalPercent < 0) {
                totalPercent = 0;
            }
        } else {
            totalPercent = 0;
        }

        if (closeWCardCount > 0) {
            totalWPercent = 100 - notClosePercentW;
            if (totalWPercent < 0) {
                totalWPercent = 0;
            }
        } else {
            totalWPercent = 0;
        }

        if (notClosePercent > 0) {
            let ajust = 0;
            let ajustW = 0;
            if (closeCardCount == 0 && notClosePercent != 100) {
                ajust = 100 - notClosePercent;
            }
            if (closeWCardCount == 0 && notClosePercentW != 100) {
                ajustW = 100 - notClosePercentW;
            }

            if (document.getElementById('taskCloseCheck') == null) {
                let checkbox = document.createElement('label');
                checkbox.classList.add('custom-checkbox');
                checkbox.innerText = '完了および処理済み除く';
                checkbox.id = 'closeTaskCheckbox';
                let checkboxinput = document.createElement('input');
                checkboxinput.type = 'checkbox';
                checkboxinput.id = 'taskCloseCheck';
                checkboxinput.addEventListener('change', function () {
                    taskViewFunction();
                });
                checkbox.appendChild(checkboxinput);
                let checkboxSpan = document.createElement('span');
                checkboxSpan.classList.add('checkmark');
                checkbox.appendChild(checkboxSpan);
                dialog.appendChild(checkbox);

                // AI要約ボタンをチェックボックスの右に追加
                let aiSummaryButton = document.createElement('button');
                aiSummaryButton.id = 'aiSummaryButton';
                aiSummaryButton.textContent = 'AI要約';
                aiSummaryButton.style.marginLeft = '10px';
                aiSummaryButton.addEventListener('click', async () => {
                    taskViewFunction()
                    try {
                        const storage = await new Promise((resolve) => {
                            chrome.storage.local.get(['openaiApiKey', 'geminiApiKey', 'llmModel', 'geminiModel', 'aiType', 'summaryPrompt'], resolve);
                        });
                        const openaiApiKey = storage.openaiApiKey || '';
                        const geminiApiKey = storage.geminiApiKey || '';
                        const aiType = storage.aiType || 'chatgpt'; // デフォルトはchatgpt
                        const openaiModel = storage.llmModel || 'gpt-3.5-turbo';
                        const geminiModel = storage.geminiModel || 'gemini-pro'; // Geminiのデフォルトモデル
                        let prompt = storage.summaryPrompt || '';

                        let taskDescriptionsText = '';
                        const taskDiscriptionEls = document.getElementsByClassName('taskDiscription');
                        for (let i = 0; i < taskDiscriptionEls.length; i++) {
                            taskDescriptionsText += taskDiscriptionEls[i].innerText + '\\n';
                        }

                        if (!prompt) {
                            alert('要約プロンプトが設定されていません。');
                            return;
                        }

                        prompt += '\\n' + taskDescriptionsText;

                        let reply = '応答がありませんでした。';

                        if (aiType === 'chatgpt') { // OpenAIサービスの場合
                            if (!openaiApiKey) {
                                alert('OpenAI APIキーが設定されていません。');
                                return;
                            }
                            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + openaiApiKey
                                },
                                body: JSON.stringify({
                                    model: openaiModel,
                                    messages: [
                                        { role: 'user', content: prompt }
                                    ]
                                })
                            });

                            if (!response.ok) {
                                const errorData = await response.json();
                                alert('OpenAI APIエラー: ' + (errorData.error?.message || response.statusText));
                                return;
                            }

                            const data = await response.json();
                            reply = data.choices?.[0]?.message?.content || '応答がありませんでした。';

                        } else if (aiType === 'gemini') { // Geminiサービスの場合
                            if (!geminiApiKey) {
                                alert('Gemini APIキーが設定されていません。');
                                return;
                            }
                            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    contents: [
                                        {
                                            parts: [
                                                {
                                                    text: prompt
                                                }
                                            ]
                                        }
                                    ]
                                })
                            });

                            if (!response.ok) {
                                const errorData = await response.json();
                                alert('Gemini APIエラー: ' + (errorData.error?.message || response.statusText));
                                return;
                            }

                            const data = await response.json();
                            reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '応答がありませんでした。';

                        } else {
                            alert('サポートされていないAIサービスです。');
                            return;
                        }

                        // classがtaskDiscriptionの要素を一度消す
                        const taskDiscriptionElements = document.getElementsByClassName('taskDiscription');
                        while (taskDiscriptionElements.length > 0) {
                            taskDiscriptionElements[0].parentNode.removeChild(taskDiscriptionElements[0]);
                        }

                        // レスポンスの文字列を表示
                        const taskDiv = document.getElementById('notCloseTask');
                        if (taskDiv) {
                            const responseDiv = document.createElement('div');
                            responseDiv.textContent = reply;
                            responseDiv.style.whiteSpace = 'pre-wrap';
                            taskDiv.appendChild(responseDiv);
                        }
                    } catch (error) {
                        alert('AI要約処理中にエラーが発生しました: ' + error.message);
                    }
                });
                dialog.appendChild(aiSummaryButton);
            }

            if (document.getElementById('taskCloseCheck').checked) {
                total = total - closeCardCount;
                totalPercent = 0;
                totalW = totalW - closeWCardCount;
                totalWPercent = 0;
            }
            for (let i = 0; i < list.length; i++) {
                let color = getIconColor(list[i]);
                let count = getTaskCount(list[i]);
                let title = getTitle(list[i]);
                let wcount = getEstimatedCount(list[i]);
                let wacount = getActualCount(list[i]);

                if (title != '処理済み' && title != '完了' && count > 0) {
                    let percent = Math.floor(count * 100 / total) + ajust;
                    if (percent < 1) {
                        percent = 1;
                    }
                    let percentW = Math.floor(wcount * 100 / totalW) + ajustW;
                    if (percentW < 1) {
                        percentW = 1;
                    }
                    let circle = document.createElementNS(svg, 'circle');
                    circle.style.setProperty('stroke', color);
                    circle.style.setProperty('animation', 'percent' + totalPercent + ' 2s ease-in-out forwards');
                    circle.classList.add('circleClass');
                    circle.setAttribute('cx', cx);
                    circle.setAttribute('cy', cy);
                    circle.setAttribute('r', r);
                    taskCircle.appendChild(circle);

                    let circleW = document.createElementNS(svg, 'circle');
                    circleW.style.setProperty('stroke', color);
                    circleW.style.setProperty('animation', 'percent' + totalWPercent + ' 2s ease-in-out forwards');
                    circleW.classList.add('circleClass');
                    circleW.setAttribute('cx', cx);
                    circleW.setAttribute('cy', cy);
                    circleW.setAttribute('r', r);
                    taskWCircle.appendChild(circleW);
                    if (percent > 0 && wcount == 0) {
                        text = text + '<span class="taskDiscription" style="color:' + color + ';">' + title + ' 課題数:' + percent + "%</span><br/>"
                    } else if (percent > 0 && wcount != 0) {
                        text = text + '<span class="taskDiscription" style="color:' + color + ';">' + title + ' 課題数:' + percent + "%(実績/予定 " + wacount + "/" + wcount + ")</span><br/>"
                        wExistCheck = true;
                    }
                    totalPercent += percent;
                    if (totalPercent > 100) {
                        totalPercent = 100;
                    }
                    ajust = 0;

                    totalWPercent += percentW;
                    if (totalWPercent > 100) {
                        totalWPercent = 100;
                    }
                    ajustW = 0;

                }
                console.log(getTitle(list[i]));
            }
            const animate = document.createElementNS(svg, "animate");
            animate.setAttribute("attributeName", "r");
            animate.setAttribute("from", "50");
            animate.setAttribute("to", "100");
            animate.setAttribute("dur", "2s");
            animate.setAttribute("fill", "freeze");
            animate.setAttribute("repeatCount", "1");
            taskCircle.appendChild(animate);

            //タイトル
            const titleTag = document.createElement("div");
            titleTag.textContent = "課題数";
            titleTag.classList.add('container-title');
            taskViewDiv.appendChild(titleTag);

            taskViewDiv.appendChild(taskCircle);
            taskDiv.appendChild(taskViewDiv)
            if (wExistCheck) {
                const titleTagW = document.createElement("div");
                titleTagW.textContent = "予定進捗状況";
                titleTagW.classList.add('container-title');
                taskWViewDiv.appendChild(titleTagW);
                taskWViewDiv.appendChild(taskWCircle);
                taskDiv.appendChild(taskWViewDiv);
            }
            let taskDataDiv = document.createElement("div");
            taskDataDiv.innerHTML = text
            taskDiv.appendChild(taskDataDiv);

            dialog.appendChild(taskDiv);
            taskCircle.display = 'block'
            animate.beginElement();
        } else {
            let taskDataDiv = document.createElement("div");
            taskDataDiv.innerText = "未完了の課題はありません"
            taskDiv.appendChild(taskDataDiv);
            dialog.appendChild(taskDiv);
        }
        if (wExistCheck) {
            dialog.classList.remove('categoryDialogMini');
            dialog.classList.add('categoryDialog');
        } else {
            dialog.classList.remove('categoryDialog');
            dialog.classList.add('categoryDialogMini');
        }

        dialog.showModal();
    }
}

function getTotalTaskCount(list) {
    let total = 0;
    list.forEach(item => {
        total = total + getTaskCount(item);
    });

    return total;
}

function getTotalEstimatedCount(list) {
    let total = 0;
    list.forEach(item => {
        total = total + getEstimatedCount(item);
    });

    return total;
}
