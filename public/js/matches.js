// search matches tabs
document.getElementsByClassName('searchForm')[0].style.display = 'flex'; //displays the first leage matches section
function openSearch(evt) {
  var i, x, tablinks;

  var selectedClassName = evt.currentTarget.classList[1];
  var selectedId = evt.currentTarget.id;

  x = document.getElementsByClassName("searchForm");
  for (i = 0; i < x.length; i++) {
    x[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("single-search-name");
  for (i = 0; i < x.length; i++) {
    tablinks[i].style.backgroundColor = '#5d737e';
  }
  document.getElementsByClassName(`${selectedClassName}`)[1].style.display = "flex";
  console.log(document.getElementsByClassName(`${selectedClassName}`)[1]);
  document.getElementById(`${selectedId}`).style.backgroundColor = '#7f7caf';
  // evt.currentTarget.backgroundColor = 'red';
}