function taskViewFuction() {

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
    taskCircle.classList.add('circleView');
    viewBox = "0 0 64 64"
    const cx = '50%';
    const cy = '50%';
    const r = 100 / (2 * Math.PI);
    taskCircle.setAttributeNS(null, 'viewBox', '0 0 64 64');
    if (document.getElementById('taskDialogTitle') == null) {
        let taskTitleDiv = document.createElement("h2");
        taskTitleDiv.innerText = "状況確認(課題数)"
        taskTitleDiv.id = 'taskDialogTitle';
        dialog.appendChild(taskTitleDiv);
    }

    let taskViewDiv = document.createElement("div");
    taskViewDiv.classList.add('taskViewDiv');
    taskViewDiv.id = 'taskViewCircle';
    const list = getList();
    let total = getTotalTaskCount(list);
    if (total > 0) {
        let text = '';
        let closeCardCount = 0;
        let totalPercent = 100;
        //完了したタスクの数を整理
        let notClosePercent = 0;
        for (let i = 0; i < list.length; i++) {
            let count = getTaskCount(list[i]);
            let title = getTitle(list[i]);
            if (title === '処理済み' || title === '完了') {
                closeCardCount += count;
            } else if (count > 0) {
                let percent = Math.floor(count * 100 / total);
                if (percent < 1) {
                    percent = 1;
                }
                notClosePercent += percent;
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
        if (notClosePercent > 0) {
            let ajust = 0;
            if (closeCardCount == 0 && notClosePercent != 100) {
                ajust = 100 - notClosePercent;
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
                    taskViewFuction();
                });
                checkbox.appendChild(checkboxinput);
                let checkboxSpan = document.createElement('span');
                checkboxSpan.classList.add('checkmark');
                checkbox.appendChild(checkboxSpan);
                dialog.appendChild(checkbox);
            }
            if (document.getElementById('taskCloseCheck').checked) {
                total = total - closeCardCount;
                totalPercent = 0;
            }
            for (let i = 0; i < list.length; i++) {
                let color = getIconColor(list[i]);
                let count = getTaskCount(list[i]);
                let title = gettitle(list[i]);
                if (title != '処理済み' && title != '完了' && count > 0) {
                    let percent = Math.floor(count * 100 / total) + ajust;
                    if (percent < 1) {
                        percent = 1;
                    }
                    let circle = document.createElementNS(svg, 'circle');
                    circle.style.setProperty('stroke', color);
                    circle.style.setProperty('animation', 'percent' + totalPercent + ' 2s ease-in-out forwards');
                    circle.classList.add('circleClass');
                    circle.setAttribute('cx', cx);
                    circle.setAttribute('cy', cy);
                    circle.setAttribute('r', r);
                    taskCircle.appendChild(circle);
                    if (percent > 0) {
                        text = text + '<span class="taskDiscription" style="color:' + color + ';">' + title + '・・・' + percent + "%</span><br/>"
                    }
                    totalPercent += percent;
                    if (totalPercent > 100) {
                        totalPercent = 100;
                    }
                    ajust = 0;

                }
                console.log(gettitle(list[i]));
            }
            const animate = document.createElementNS(svg, "animate");
            animate.setAttribute("attributeName", "r");
            animate.setAttribute("from", "50");
            animate.setAttribute("to", "100");
            animate.setAttribute("dur", "2s");
            animate.setAttribute("fill", "freeze");
            animate.setAttribute("repeatCount", "1");
            taskCircle.appendChild(animate);
            taskViewDiv.appendChild(taskCircle);
            taskDiv.appendChild(taskViewDiv)
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
    } else {
        let taskDataDiv = document.createElement("div");
        taskDataDiv.innerText = "未完了の課題はありません"
        taskDiv.appendChild(taskDataDiv);
        dialog.appendChild(taskDiv);
    }
    dialog.showModal();
}

function getList() {
    const elements = document.querySelectorAll('.css-hrpltn-col');
    return elements;
}

function getIconColor(listItem) {
    const icon = listItem.querySelectorAll('.StatusIcon');
    if (icon) {
        return getComputedStyle(icon[0]).backgroundColor;
    }
    return null;
}

function getTotalTaskCount(list) {
    let total = 0;
    list.forEach(item => {
        total = total + getTaskCount(item);
    });

    return total;
}

function getTaskCount(listItem) {
    const cards = listItem.querySelectorAll('.card');
    const filterd = Array.from(cards).filter(card => !card.classList.contains('cardFilter'));
    return filterd.length;
}

function getTitle(listItem) {
    const head = listItem.querySelectorAll('.SlotHead');
    let outputText = '';
    if (head != null && head != undefined) {
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