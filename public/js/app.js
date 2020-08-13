
//var matchResult = $('.AdVScr').text();

// $('.matchInfo').each(appendResult())

// function appendResult(){
//     let matchresult =  $(`${this} .AdVScr`).text();
//     this.append('<p>' + matchresult + '</p>')
//   }

for(let i = 0; i<5; i++){
    let matchResult = $(`.matchInfo${i} .matchEmbed ._scorebatEmbeddedPlayerW_ .AdVScr`).textContent;
    console.log(matchResult);
    //$(`.matchInfo${i}`).append('<p>' + matchResult + '</p>');
}

// document.getElementsByClassName('AdVScr').forEach(item => {console.log(item.innerText)});
// document.getElementsByClassName('AdVScr')[0].innerText;
//document.getElementsByTagName('iframe')
