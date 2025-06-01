const url = location.href;

const safetyLevel = "lightblue";
const warningLevel = "khaki";
const dangerLevel = "lightcoral";

const typeEstimate = 1;
const typeActual = 2;


function getSelectedAccount() {
    let selectElement = document.getElementById('accountListSelect');
    let selectedValues = [];
    for (let i = 0; i < selectElement.options.length; i++) {
        let option = selectElement.options[i];
        if (option.selected) {
            selectedValues.push(option.value);
        }
    }
    return selectedValues;
}

function filterAccount() {
    let selectedValues = getSelectedAccount();
    let allCardElements = document.getElementsByClassName("card-user-icon");
    let allCardElementsArray = Array.from(allCardElements);

    allCardElementsArray.forEach(function (cardElements) {
        if (selectedValues.length === 0) {
            cardElements.parentNode.parentNode.classList.remove("cardFilter");
        } else {
            for (let i = 0; i < selectedValues.length; i++) {
                if (cardElements.dataset.tooltip == selectedValues[i]) {
                    cardElements.parentNode.parentNode.classList.remove("cardFilter");
                    break;
                } else {
                    cardElements.parentNode.parentNode.classList.add("cardFilter");
                }
            }
        }
    });
}

function addAccountFilterOption(account) {
    let accountlistElement = document.getElementById("accountListSelect");
    let existFlg = false;
    if (accountlistElement != null) {
        [...accountlistElement.options].forEach(option => {
            if (option.value === account) {
                existFlg = true;
            }
        });
        if (existFlg == false) {
            let accountListOption = document.createElement("option");
            accountListOption.value = account;
            accountListOption.textContent = account;
            accountlistElement.appendChild(accountListOption);
        }
    }
}

if (url.indexOf('backlog.jp/board/') != -1 || url.indexOf('backlog.com/board/') != -1) {
    function boardFunction() {
        let listElements = document.getElementsByClassName("css-hrpltn-col");

        let listElementsArray = Array.from(listElements);

        listElementsArray.forEach(function (element) {
            let titleElements = element.getElementsByClassName("css-e9ni64-box");
            let closeTaskList = false;

            let titleElementsArray = Array.from(titleElements);
            titleElementsArray.forEach(function (titleElements) {
                if (titleElements.tagName == "SPAN" || titleElements.tagName == "span") {
                    if (titleElements.innerText == "完了" || titleElements.innerText == "処理済み") {
                        closeTaskList = true;
                    }
                }
            });

            let cardElements = element.getElementsByClassName("card-summary");

            let cardElementsArray = Array.from(cardElements);

            let estimatedSum = 0;
            let actualSum = 0;

            cardElementsArray.forEach(function (cardElements) {
                let cardClassList = cardElements.parentNode.classList;
                let classCheck = true;
                for (let i = 0; i < cardClassList.length; i++) {
                    if (cardClassList[i] == "cardFilter") {
                        classCheck = false;
                        break;
                    }
                }
                if (classCheck) {
                    cardtitle = cardElements.innerHTML;
                    let estimatedValue = estimatedExtractNumberInParentheses(cardtitle);
                    if (estimatedValue != -1) {
                        estimatedSum += estimatedValue;
                    }
                    let actualValue = actualExtractNumberInParentheses(cardtitle);
                    if (actualValue != -1) {
                        actualSum += actualValue;
                    }

                    if (estimatedValue != -1) {
                        if (actualValue != -1) {
                            if (estimatedValue < actualValue) {
                                cardElements.parentNode.style.backgroundColor = dangerLevel;
                            } else if (estimatedValue * 0.7 < actualValue) {
                                cardElements.parentNode.style.backgroundColor = warningLevel;
                            } else {
                                cardElements.parentNode.style.backgroundColor = safetyLevel;
                            }
                        } else {
                            cardElements.parentNode.style.backgroundColor = safetyLevel;
                        }
                    }
                }
                if (!closeTaskList) {
                    let limitDate = cardElements.parentNode.querySelectorAll('input[aria-label]');
                    if (limitDate.length > 0) {
                        let limitDateValue = limitDate[0].value;
                        if (limitDateValue.match(/^\d{4}\/\d{2}\/\d{2}$/)) {
                            let limitDateValueDate = new Date(limitDateValue);
                            limitDateValueDate.setHours(23);
                            limitDateValueDate.setMinutes(59);
                            let nowDate = new Date();
                            let diffDate = limitDateValueDate - nowDate;
                            if (diffDate < 0) {
                                cardElements.parentNode.classList.add("overLimitDate")
                            } else {
                                let nearLimitDateValue = new Date(limitDateValue);
                                nearLimitDateValue.setHours(23);
                                nearLimitDateValue.setMinutes(59);
                                nearLimitDateValue.setDate(nearLimitDateValue.getDate() - 1);
                                diffDate = nearLimitDateValue - nowDate; {
                                    if (diffDate < 0) {
                                        cardElements.parentNode.classList.add("nearLimitDate")
                                    } else {
                                        cardElements.parentNode.classList.remove("nearLimitDate")
                                        cardElements.parentNode.classList.remove("overLimitDate")
                                    }
                                }
                            }
                        }
                    }
                    let name = cardElements.parentNode.querySelectorAll('button[aria-label="担当者"]')[0].querySelectorAll('img');
                    if (name.length === 1) {
                        addAccountFilterOption(name[0].alt);
                    }
                }
            });

            if (!closeTaskList) {
                titleElementsArray.forEach(function (titleElements) {
                    if (titleElements.tagName == "SPAN" || titleElements.tagName == "span") {
                        let timeElementsScheduledEstimated = titleElements.getElementsByClassName("estimated_time");
                        //timeElementsScheduledがなければ要素を追加する
                        if (timeElementsScheduledEstimated.length === 0) {
                            let timeElements = document.createElement("span");
                            timeElements.className = "estimated_time";
                            timeElements.textContent = "予定:" + estimatedSum;
                            titleElements.appendChild(timeElements);
                        } else {
                            timeElementsScheduledEstimated[0].textContent = "予定:" + estimatedSum;
                        }

                        let timeElementsScheduledPunctuation = titleElements.getElementsByClassName("punctuation");
                        //punctuationScheduledがなければ要素を追加する
                        if (timeElementsScheduledPunctuation.length === 0) {
                            let timeElements = document.createElement("span");
                            timeElements.className = "punctuation";
                            timeElements.textContent = "/";
                            titleElements.appendChild(timeElements);
                        }

                        let timeElementsScheduledActual = titleElements.getElementsByClassName("actual_time");
                        //timeElementsScheduledがなければ要素を追加する
                        if (timeElementsScheduledActual.length === 0) {
                            let timeElements = document.createElement("span");
                            timeElements.className = "actual_time";
                            timeElements.textContent = "実績:" + actualSum;
                            titleElements.appendChild(timeElements);
                        } else {
                            timeElementsScheduledActual[0].textContent = "実績:" + actualSum;
                        }
                    }
                });
            }

            //複数アカウント選択ボタン設定
            let accountFilterDialog = document.createElement("dialog");
            accountFilterDialog.id = "accountFilterDialog";
            let accountListSelect = document.createElement("select");
            accountListSelect.id = "accountListSelect";
            accountListSelect.multiple = "multiple";
            accountListSelect.classList.add('accountListSelect');
            accountListSelect.addEventListener("change", function () {
                filterAccount();
            });
            let accountListOptionNotSelect = document.createElement("option");
            accountListOptionNotSelect.value = "未設定";
            accountListOptionNotSelect.textContent = "未設定";
            accountListSelect.appendChild(accountListOptionNotSelect);
            accountFilterDialog.appendChild(accountListSelect);
            let brElement = document.createElement("br");
            accountFilterDialog.appendChild(brElement);
            let allAccountCheckClearbutton = document.createElement("button");
            allAccountCheckClearbutton.textContent = "選択解除";
            allAccountCheckClearbutton.classList.add('accountFilterCloseButton');
            allAccountCheckClearbutton.addEventListener("click", function () {
                let filter = document.getElementById("accountListSelect");
                for (let i = 0; i < filter.options.length; i++) {
                    let option = filter.options[i];
                    option.selected = false;
                }
                filterAccount();
            });
            accountFilterDialog.appendChild(allAccountCheckClearbutton);
            let accountFilterCloseButton = document.createElement("button");
            accountFilterCloseButton.textContent = "閉じる";
            accountFilterCloseButton.classList.add('accountFilterCloseButton');
            accountFilterCloseButton.addEventListener("click", function () {
                accountFilterDialog.close();
            });
            accountFilterDialog.appendChild(accountFilterCloseButton);
            accountFilterDialog.setAttribute("closedby", "any");

            let fileter = document.getElementById("filterButton").parentNode;
            let accountFilterButton = document.getElementById("accountFilterDialog");
            if (fileter != null && accountFilterButton == null) {
                fileter.appendChild(accountFilterDialog);
                let accountFilterButtonElement = document.createElement("button");
                let accountFilterButtonTextElement = document.createElement("span");
                accountFilterButtonTextElement.textContent = "担当者複数選択フィルター";
                accountFilterButtonTextElement.classList.add('_assistive-text');
                accountFilterButtonElement.id = "accountFilterButton";
                accountFilterButtonElement.type = "button";
                accountFilterButtonElement.classList.add('icon-button');
                accountFilterButtonElement.classList.add('icon-button--default');
                accountFilterButtonElement.classList.add('title-group__edit-actions-item');
                accountFilterButtonElement.classList.add('simptip-position-top');
                accountFilterButtonElement.classList.add('simptip-movable');
                accountFilterButtonElement.classList.add('simptip-smooth');
                accountFilterButtonElement.classList.add('-with-text');

                accountFilterButtonElement.appendChild(accountFilterButtonTextElement);
                accountFilterButtonElement.addEventListener("click", function () {
                    let dialog = document.getElementById("accountFilterDialog");
                    dialog.showModal();
                });
                fileter.appendChild(accountFilterButtonElement);
            }

            //カテゴリーで指定されたタスク実行状況
            let categoryElement = document.getElementById("filter.category");
            let categoryElementParent = categoryElement.parentNode;
            const divElements = categoryElementParent.querySelectorAll('div');
            let selectCheck = false;
            divElements.forEach(div => {
                if (div.innerText.length > 0) {
                    selectCheck = true;
                }
            });
            let categorytaskDialogExist = document.getElementById("categoryTaskDialog");
            let categoryTaskDialog = document.createElement("dialog");
            categoryTaskDialog.id = "categoryTaskDialog";
            categoryTaskDialog.setAttribute("closedby", "any");

            if (fileter != null && categorytaskDialogExist == null) {
                fileter.appendChild(categoryTaskDialog);

                let taskViewButtonElement = document.createElement("button");
                let taskViewButtonTextElement = document.createElement("span");
                taskViewButtonTextElement.textContent = "状況確認";
                taskViewButtonTextElement.classList.add('_assistive-text');
                taskViewButtonElement.id = "taskViewButton";
                taskViewButtonElement.type = "button";
                taskViewButtonElement.classList.add('icon-button');
                taskViewButtonElement.classList.add('icon-button--default');
                taskViewButtonElement.classList.add('title-group__edit-actions-item');
                taskViewButtonElement.classList.add('simptip-position-top');
                taskViewButtonElement.classList.add('simptip-movable');
                taskViewButtonElement.classList.add('simptip-smooth');
                taskViewButtonElement.classList.add('-with-text');

                taskViewButtonElement.appendChild(taskViewButtonTextElement);

                taskViewButtonElement.addEventListener("click", function () {
                    taskViewFunction();
                });
                fileter.appendChild(taskViewButtonElement);
                taskViewButtonElement.addEventListener('mouseenter', (event) => {
                    const button = document.getElementById('taskViewButton');
                    if (button.disabled) {
                        categoryElement.classList.add('selectCategoryAlert');
                    }
                });

                taskViewButtonElement.addEventListener('mouseleave', () => {
                    categoryElement.classList.remove('selectCategoryAlert')
                });


            }
            let taskViewButton = document.getElementById("taskViewButton");
            if (selectCheck && taskViewButton != null) {
                taskViewButton.disabled = false;
            } else {
                taskViewButton.disabled = true;
            }

        });
    }
    // 一定時間ごとに関数を呼び出すタイマーを設定
    setInterval(boardFunction, 5000); // 5000ミリ秒ごとに関数が実行される
}

function getList() {
    const elements = document.querySelectorAll('.css-hrpltn-col');
    return elements;
}

function getTaskCount(listItem) {
    const cards = listItem.querySelectorAll('.card');
    const filterd = Array.from(cards).filter(card => !card.classList.contains('cardFilter'));
    return filterd.length;
}

function getTitle(listItem) {
    const head = listItem.querySelectorAll('.SlotHead');
    let outputText = '';
    if (head && head.length > 0) {
        const childNode = head[0].childNodes;
        childNode.forEach(node => {
            if (!node.classList.contains('expand')) {
                let text = node.innerText;
                text = text.replace(/予定:([\d.]+)\/実績:([\d.]+)/g, '');
                if (text.length > 0) {
                    outputText = outputText + text;
                }
            }
        });
    }
    return outputText;
}

function getEstimatedCount(listItem) {
    return calculateEstimateOrActual(listItem, typeEstimate);
}

function getActualCount(listItem) {
    return calculateEstimateOrActual(listItem, typeActual);
}

function calculateEstimateOrActual(listItem, type) {
    const cards = listItem.querySelectorAll('.card');
    const filterd = Array.from(cards).filter(card => !card.classList.contains('cardFilter'));
    let value = 0;
    filterd.forEach(
        item => {
            const title = item.querySelectorAll('.card-summary');
            if (title.length == 1) {
                let v = 0;
                if (type == typeEstimate) {
                    v = estimatedExtractNumberInParentheses(title[0].innerText);
                } else if (type == typeActual) {
                    v = actualExtractNumberInParentheses(title[0].innerText);
                }
                if (v > 0) {
                    value = value + v;
                }
            }
        });
    return value;
}


function getIconColor(listItem) {
    const icon = listItem.querySelectorAll('.StatusIcon');
    if (icon?.[0]) {
        return getComputedStyle(icon[0]).backgroundColor;
    }
    return null;
}
