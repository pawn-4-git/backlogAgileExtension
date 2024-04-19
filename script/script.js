const url   = location.href;

const safetyLevel = "lightblue";
const warningLevel = "khaki";
const dangerLevel = "lightcoral";
const overLimitDate = "5px solid red";
const nearLimitDate = "5px solid yellow";

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
function isNumeric(str) {
  return !isNaN(parseFloat(str)) && isFinite(str);
}

if(url.indexOf('backlog.jp/board/')!=-1){
  function boardFunction() {
      let listElements = document.getElementsByClassName("css-hrpltn-col");

      let listElementsArray = Array.from(listElements);

      listElementsArray.forEach(function(element) {
        let titleElements = element.getElementsByClassName("css-e9ni64-box");

        let titleElementsArray = Array.from(titleElements);

        let cardElements = element.getElementsByClassName("card-summary");

        let cardElementsArray = Array.from(cardElements);
        
        let estimatedSum=0;
        let actualSum=0;

        cardElementsArray.forEach(function(cardElements) {
            cardtitle=cardElements.innerHTML;
            let estimatedValue=estimatedExtractNumberInParentheses(cardtitle);
            if(estimatedValue!=-1){
              estimatedSum += estimatedValue;
            }
            let actualValue=actualExtractNumberInParentheses(cardtitle);
            if(actualValue!=-1){
              actualSum += actualValue;
            }
            if(estimatedValue!=-1){
              if(actualValue!=-1){
                if(estimatedValue<actualValue){
                  cardElements.parentNode.style.backgroundColor = dangerLevel;
                }else if(estimatedValue*0.7<actualValue){
                  cardElements.parentNode.style.backgroundColor = warningLevel;
                }else{
                  cardElements.parentNode.style.backgroundColor = safetyLevel;
                }
              }else{
                cardElements.parentNode.style.backgroundColor = safetyLevel;
              }
            }
            let limitDate=cardElements.parentNode.querySelectorAll('input[aria-label]');
            if(limitDate.length>0){
              let limitDateValue = limitDate[0].value;
              if(limitDateValue.match(/^\d{4}\/\d{2}\/\d{2}$/)){
                let limitDateValueDate = new Date(limitDateValue);
                limitDateValueDate.setHours(23);
                limitDateValueDate.setMinutes(59);
                let nowDate = new Date();
                let diffDate = limitDateValueDate - nowDate;
                if(diffDate<0){
                  cardElements.parentNode.style.border = overLimitDate;
                }else{
                  let nearLimitDateValue = new Date(limitDateValue);
                  nearLimitDateValue.setHours(23);
                  nearLimitDateValue.setMinutes(59);
                  nearLimitDateValue.setDate(nearLimitDateValue.getDate()-1);
                  diffDate = nearLimitDateValue - nowDate;
                  if(diffDate<0){
                    cardElements.parentNode.style.border = nearLimitDate;
                  }
                }
              }
            }
        });

      
        titleElementsArray.forEach(function(titleElements) {
          if(titleElements.tagName == "SPAN" || titleElements.tagName =="span"){
            let timeElementsScheduledEstimated = titleElements.getElementsByClassName("estimated_time");
            //timeElementsScheduledがなければ要素を追加する
            if(timeElementsScheduledEstimated.length == 0){
              let timeElements = document.createElement("span");
              timeElements.className = "estimated_time";
              timeElements.textContent = "予定:"+estimatedSum;  
              titleElements.appendChild(timeElements);
            }else{
              timeElementsScheduledEstimated[0].textContent = "予定:"+estimatedSum;
            }

            let timeElementsScheduledPunctuation = titleElements.getElementsByClassName("punctuation");
            //punctuationScheduledがなければ要素を追加する
            if(timeElementsScheduledPunctuation.length == 0){
              let timeElements = document.createElement("span");
              timeElements.className = "punctuation";
              timeElements.textContent = "/";  
              titleElements.appendChild(timeElements);
            }

            let timeElementsScheduledActual = titleElements.getElementsByClassName("actual_time");
            //timeElementsScheduledがなければ要素を追加する
            if(timeElementsScheduledActual.length == 0){
              let timeElements = document.createElement("span");
              timeElements.className = "actual_time";
              timeElements.textContent = "実績:"+actualSum;  
              titleElements.appendChild(timeElements);
            }else{
              timeElementsScheduledActual[0].textContent = "実績:"+actualSum;
            }
          }
        });
     });
      
  } 

  // 一定時間ごとに関数を呼び出すタイマーを設定
  setInterval(boardFunction, 5000); // 5000ミリ秒ごとに関数が実行される
}

console.log(url);
