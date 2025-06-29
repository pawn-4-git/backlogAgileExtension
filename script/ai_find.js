function getSummaryTextFromScreen() {
    // 画面のテキストを取得する
    const issuesTable = document.getElementById('issues-table');
    if (!issuesTable) {
        return "[]"; // issues-tableが見つからない場合は空のJSON配列を返す
    }

    const headers = [];
    const headerElements = issuesTable.querySelectorAll('thead th');
    headerElements.forEach(th => {
        headers.push(th.innerText.trim());
    });

    const data = [];
    const rows = issuesTable.querySelectorAll('tbody tr');
    rows.forEach(row => {
        const rowData = {};
        const cells = row.querySelectorAll('td');
        cells.forEach((cell, index) => {
            if (headers[index]) {
                rowData[headers[index]] = cell.innerText.trim();
            }
        });
        data.push(rowData);
    });

    return JSON.stringify(data, null, 2);
}

/**
 * プロンプト文字列の先頭に固定の文字を追加します。
 * @param {string} prompt - 元のプロンプト文字列。
 * @returns {string} 固定の文字が追加されたプロンプト文字列。
 */
function addPrefixToPrompt(prompt) {
    const prefix = "以下の情報に基づいて、タスクを要約してください: 出力する文章はHTMLとし改行は<br/>を使用してください。";
    return prefix + prompt;
}
