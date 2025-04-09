function isNumeric(str) {
    return !isNaN(parseFloat(str)) && isFinite(str);
}

function estimatedExtractNumberInParentheses(str) {
    const regex = /\(([\d.]+)\)/;
    let match = str.match(regex);
    if (match) {
        let numberInParentheses = parseFloat(match[1]);
        return numberInParentheses;
    }
    return -1;
}
function actualExtractNumberInParentheses(str) {
    const regex = /\[([\d.]+)\]/;
    let match = str.match(regex);

    if (match) {
        let numberInParentheses = parseFloat(match[1]);
        return numberInParentheses;
    }
    return -1;
}