//slide show
var slideIndex = 0;
showSlides();

function showSlides() {
  var i;
  var slides = document.getElementsByClassName("mySlides");
  var dots = document.getElementsByClassName("dot");
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";  
  }
  slideIndex++;
  if (slideIndex > slides.length) {slideIndex = 1}    
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active", "");
  }
  slides[slideIndex-1].style.display = "flex";  
  dots[slideIndex-1].className += " active";
  setTimeout(showSlides, 5000); // Change image every 5 seconds
}
//end of slide show
//buttons on slide
var a;
var content;

$('button.watch').on('click',function(event){
   // if(a){$(`div.${a}`).show()}
    if(a){ //content = $(`div.${a}`).innerHTML;
    console.log(content);
    document.getElementsByClassName(`${a}`)[1].innerHTML = content;
}
     a = event.target.classList[1];
     console.log(a);
    $('.matchEmbed').hide();
    $(`div.${a}`).show();
   let x = document.getElementsByClassName("VideoPlayerStoriesC");
  for (let i = 0; i < x.length; i++) {
    x[i].style.display = "none";}
    let y = document.getElementsByClassName("EmbedCodeWrapper");
  for (let i = 0; i < y.length; i++) {
    y[i].style.display = "none";}
    //content = $(`div.${a}`).innerHTML;
    content = document.getElementsByClassName(`${a}`)[1].innerHTML;
})

// iframe.contentWindow.document.getElementsByTagName("H1")[0];
//document.getElementsByClassName('matchEmbed')[0].children[0].children[0].contentWindow
// index tabs
document.getElementsByClassName('league-matches')[0].style.display = 'flex'; //displays the first leage matches section
function openMatches(evt) {
  var i, x, tablinks;
  var selectedClassName = evt.currentTarget.classList[1];
  x = document.getElementsByClassName("league-matches");
  for (i = 0; i < x.length; i++) {
    x[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("single-league-name");
  for (i = 0; i < x.length; i++) {
    tablinks[i].style.backgroundColor = 'black';
  }
  document.getElementsByClassName(`${selectedClassName}`)[1].style.display = "flex";
  document.getElementsByClassName(`${selectedClassName}`)[0].style.backgroundColor = 'red';
  // evt.currentTarget.backgroundColor = 'red';
}

