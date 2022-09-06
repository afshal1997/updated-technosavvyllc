//home js

$(document).ready(function () {

	var pathName = window.location.pathname.toLowerCase();

	var pageUrl = 'others';

	if (pathName === '/australia.html' || pathName === '/cn.html' ) {

		pageUrl = 'home';

	}



	if ($("#ai_powered_core").length !== 0 && pageUrl !== 'home') {

		var waypoint1 = new Waypoint({

			element: document.getElementById('ai_powered_core'),

			handler: function () {

				$("header .container > .navbar-header,.container > .header-menu").toggleClass('hidden-xs hidden-sm hidden-md hidden-lg');

				$("header .container").toggleClass('mt45');

			}

		});

	}



/* do more expand/collapse effect */

	$(document).on('click', '.expandHead', function () {

		var expandID = $(this).data('id');

		$(expandID).fadeIn();

		$(expandID).addClass('expandWrpr').removeClass('contractWrpr');

		$('.closeWrpr').addClass('closeWrprAnim');

	});

	$(document).on('click', '.closeWrpr', function () {

		$('.expandableDiv').removeClass('expandWrpr').addClass('contractWrpr');

		$('.expandableDiv').fadeOut();

		$('.closeWrpr').removeClass('closeWrprAnim');

	});



/* index careers - employeespeak slider */

var employeespeak_slider = $("#employeespeak_slider").find('.item').length;

	$("#employeespeak_slider").owlCarousel({

		dots: employeespeak_slider > 1 ? true : false,

		nav: employeespeak_slider > 1 ? true : false,

		touchDrag: employeespeak_slider > 1 ? true : false,

		mouseDrag: employeespeak_slider > 1 ? true : false,

		loop: employeespeak_slider > 1 ? true : false,

		autoplay: false,

		autoplayTimeout: 3000,

		autoplayHoverPause: true,

		responsive: {

			0: {

				items: 1

			},

			600: {

				items: 1

			},

			768: {

				items: 1

			},

			1000: {

				items: 1

			}

		}

	});





    /* left navigation hover effects */

	$(document).on('mouseenter', '.sticky-left-nav li', function () {

		if (!$(this).hasClass('mb50')) {

			$(this).addClass('nav-active');

		}

	});

	$(document).on('mouseleave', '.sticky-left-nav li', function () {

		if (!$(this).hasClass('mb50')) {

			$(this).removeClass('nav-active');

		}

	});






	// Tn JS

	jQuery('.sticky-left-nav ul li a').click(function(){

	    var scroll_id = jQuery(this).attr('href');

	        jQuery('.sticky-left-nav ul li').removeClass('nav-active mb50');

	        jQuery(this).closest('li').addClass('nav-active mb50');

	    if( scroll_id == '#our_portfolio'){

	        jQuery(this).closest('ul').addClass('dark-color-tn');

	    }

	    else{

	        jQuery('.sticky-left-nav ul').removeClass('dark-color-tn');

	    }

	    jQuery('html, body').animate({

	        scrollTop: jQuery(scroll_id).offset().top

	    }, 500);

	});

	// Onscroll

	$(window).scroll(function () {

	    var windowPos = $(window).scrollTop();

	    if (windowPos >= 0) {



	    $('.freeflowhtml').each(function (i) {

	            if ($(this).position().top <= windowPos  ) {

	            var cur_id = jQuery(this).find('.scroll-section').attr('id');    

	            	// Menus 
	            	if(cur_id == 'our_portfolio'){

	                    jQuery('.sticky-left-nav li.nav-active').closest('ul').addClass('dark-color-tn');
	                    jQuery('.burger').addClass('active-burger');
	                }

	                else{

	                    jQuery('.sticky-left-nav ul').removeClass('dark-color-tn');
	                    jQuery('.burger').removeClass('active-burger');
	                }


	            $('.sticky-left-nav li.nav-active').removeClass('nav-active mb50');

	            $('.sticky-left-nav li').eq(i - 1).addClass('nav-active mb50');



	        }

	    });



	    // menu from Footer Start



	    // Menu from footer End

	    } else {

	        $('.stick-left-nav-ul li.nav-active-menu').removeClass('nav-active-menu');

	    }

	});







});



jQuery(window).scroll(function (event) {
    var scroll = jQuery(window).scrollTop();
    jQuery('.sticky-left-nav').toggleClass('ok',
     //add 'ok' class when div position match or exceeds else remove the 'ok' class.
      scroll >= jQuery('#contact_us').offset().top + 300
    );
});
//trigger the scroll
jQuery(window).scroll();//ensure if you're in current position when page is refreshed

// Footer Scroll
// jQuery(document).ready(function($){
// 	$(window).scroll(function () {

//     var windowPos = $(window).scrollTop();

// 	    if (windowPos >= 0) {



// 	            if ($(this).position().top <= windowPos + 1000 ) {

// 	            var cur_id = jQuery(this).find('.footer').attr('id');    

// 	            	// Menus 
// 	            	if(cur_id == 'footer_bot'){

// 	                    jQuery('.sticky-left-nav').css('background', 'red');
// 	                }

// 	                else{

// 	                 	jQuery('.sticky-left-nav').css('background', 'yellow');
// 	                }

// 	        }




// 	    }

// 	});
// });