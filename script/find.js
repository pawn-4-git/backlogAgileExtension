const url = location.href;

const typeEstimate = 1;
const typeActual = 2;


if (url.indexOf('backlog.jp/find/') != -1 || url.indexOf('backlog.com/find/') != -1) {
    function findFunction() {
        let taskViewButton = document.getElementById("taskViewButton");
        let resultsSetControllerActions = document.getElementsByClassName("result-set__controller-actions");
        if (taskViewButton == null && resultsSetControllerActions != null) {
            let categoryTaskDialog = document.createElement("dialog");
            categoryTaskDialog.id = "categoryTaskDialog";
            categoryTaskDialog.setAttribute("closedby", "any");
            let resultsSetControllerAction = resultsSetControllerActions[0];
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
                taskViewFuction();
            });
            resultsSetControllerAction.appendChild(taskViewButtonElement);
            resultsSetControllerAction.appendChild(categoryTaskDialog);

        }

    }
    setInterval(findFunction, 5000); // 5000ミリ秒ごとに関数が実行される
}

function getStatusList() {
    return document.getElementsByClassName("status");
}

function getList() {
    let statusList = getStatusList();
    let statusNameList = [];
    for (let i = 0; i < statusList.length; i++) {
        //すでにリストにあるステータスは除く
        if (statusNameList.includes(statusList[i].innerText)) {
            continue;
        }
        statusNameList.push(statusList[i].innerText);
    }
    return statusNameList;
}

function getTitle(listItem) {
    return listItem;
}

function getEstimatedCount(listItem) {
    return getEstimateOrActual(listItem, typeEstimate);
}

function getEstimateOrActual(listItem, type) {
    let statusList = getStatusList();
    let value = 0;
    for (let i = 0; i < statusList.length; i++) {
        if (statusList[i].innerText == listItem) {
            const rowItem = statusList[i].closest('tr[aria-label*="Issue"]');
            if (rowItem) {
                let title = rowItem.getElementsByClassName("SummaryCellContent");
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
            } else {
                console.warn('該当する親のtr要素が見つかりませんでした:', statusList[i]);
            }
        }
    }
    return value;
}

function getActualCount(listItem) {
    return getEstimateOrActual(listItem, typeActual);
}

function getTaskCount(listItem) {
    let statusList = getStatusList();
    let value = 0;
    for (let i = 0; i < statusList.length; i++) {
        if (statusList[i].innerText == listItem) {
            value++
        }
    }
    return value;
}

function getIconColor(listItem) {
    let statusList = getStatusList();
    for (let i = 0; i < statusList.length; i++) {
        if (statusList[i].innerText == listItem) {
            return getComputedStyle(statusList[i]).backgroundColor;
        }
    }
    return null;
}
