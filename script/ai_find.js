function getSummaryTextFromScreen() {
    // 画面のテキストを取得する
    const screenText = document.body.innerText;
    console.log("要約のために取得した画面テキスト:", screenText);
    return screenText;
}
