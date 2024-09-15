function taskViewFuction() {
    const svg = "http://www.w3.org/2000/svg";
    let dialog = document.getElementById("categoryTaskDialog");
    dialog.innerHTML = '';
    let taskDiv = document.createElement("div");
    taskDiv.style.setProperty('display', 'flex')
    let taskViewDiv = document.createElement("div");
    taskViewDiv.classList.add('taskViewDiv');
    let taskCircle = document.createElementNS(svg, "svg");
    taskCircle.classList.add('circleView');
    viewBox = "0 0 64 64"
    const cx = '50%';
    const cy = '50%';
    const r = '15.9154';
    taskCircle.setAttributeNS(null, 'viewBox', '0 0 64 64');
    const list = getList();
    let total = getTotalTaskCount(list);
    let taskTitleDiv = document.createElement("h2");
    taskTitleDiv.innerText = "状況確認"
    categoryTaskDialog.appendChild(taskTitleDiv);
    if (total > 0) {
        let text = '';
        let closeCardCount = 0;
        let totalPercent = 100;
        let totalCardCount = total;
        //完了したタスクの数を整理
        for (let i = 0; i < list.length; i++) {
            let color = getIconColor(list[i]);
            let count = getTaskCount(list[i]);
            let title = gettitle(list[i]);
            if (title === '処理済み' || title === '完了') {
                closeCardCount += count;
            }
        }
        if (closeCardCount > 0) {
            totalPercent = Math.floor(closeCardCount * 100 / total);
        }
        for (let i = 0; i < list.length; i++) {
            let color = getIconColor(list[i]);
            let count = getTaskCount(list[i]);
            let title = gettitle(list[i]);
            if (title != '処理済み' && title != '完了' && count > 0) {
                let percent = Math.floor(count * 100 / total);
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
                    text = text + '<span class="taskDiscription" style="color:' + color + ';">' + title + '・・・' + Math.floor(count * 100 / total) + "%</span><br/>"
                }
                totalPercent += percent;

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

        categoryTaskDialog.appendChild(taskDiv);
        taskCircle.display = 'block'
        animate.beginElement();
    } else {

        let taskDataDiv = document.createElement("div");
        taskDataDiv.innerText = "課題がありません"
        taskDiv.appendChild(taskDataDiv);
        categoryTaskDialog.appendChild(taskDiv);
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

function gettitle(listItem) {
    const head = listItem.querySelectorAll('.SlotHead');
    let outputText = '';
    if (head != null && head != undefined) {
        const childNode = head[0].childNodes;
        childNode.forEach(node => {
            if (!node.classList.contains('expand')) {
                let text = node.innerText;
                text = text.replace(/予定:\d+\/実績:\d+/g, '');
                if (text.length > 0) {
                    outputText = outputText + text;
                }
            }
        });
    }
    return outputText;
}