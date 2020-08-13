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
  slides[slideIndex-1].style.display = "block";  
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
    //content = $(`div.${a}`).innerHTML;
    content = document.getElementsByClassName(`${a}`)[1].innerHTML;
    console.log(content);
})

// iframe.contentWindow.document.getElementsByTagName("H1")[0];
//document.getElementsByClassName('matchEmbed')[0].children[0].children[0].contentWindow


