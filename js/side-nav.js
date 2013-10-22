(function (root) {

  var SideNav = {};

  /* Navigation side toggle button(s) */
  var sideNavToggles = document.querySelector('.side-nav-toggle');
  var elToMove = document.querySelectorAll('.page, .header-fixed, .footer-fixed');
  elToMove = Array.prototype.splice.call(elToMove, 0);
  // console.log(elToMove);
  elToMove.forEach(function(el){
    el.style.webkitTransition =   "margin-left .4s";
    var toggleSideNav = function (e) {
      e.preventDefault();
      if(el.style.marginLeft.trim().length > 0){
        el.style.marginLeft = "";
      }else{
        el.style.marginLeft = "150px";
      }
    };

    sideNavToggles.addEventListener('click', toggleSideNav);
  });

  // SideNav.prototype.setJSON = function(JSON) {
  
  // };
  // SideNav.prototype.setCollapsible = function(collapsible) {
  
  // };
  
}(this));
