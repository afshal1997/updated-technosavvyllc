$(document).ready(function () {
	"use strict";
	/* ------------- TEXT ANIMATION PART ---------------*/
	//new WOW().init();
	var wow_animations = new WOW({
		boxClass: 'wow',
		animateClass: 'animated'
	});
	wow_animations.init();
	
	$(document).on('click', '.show-on-image', function () {
		$(this).hide();
		$('.show-on-video').find('iframe').attr('src', $('.show-on-video').find('iframe').attr('src') + '&autoplay=1');
		$('.show-on-video').show();
	});
	$(document).on('click', '.video-close-icon', function () {
		$('.show-on-video').hide();
		$('.show-on-image').show();
		$('.show-on-video').find('iframe').attr('src', $('.show-on-video').find('iframe').attr('src').replace('&autoplay=1', ''));
	});

	$(document).on('click', '#careers .video-play-icon', function () {
		$('#career_video iframe').attr('src', $('#career_video iframe').attr('src').replace('&autoplay=0', '&autoplay=1'));
	});
	$(document).on('click', '#career_video .close', function () {
		$('#career_video iframe').attr('src', $('#career_video iframe').attr('src').replace('&autoplay=1', '&autoplay=0'));
	});

	/* ------------- OWL CAROUSEL SYNTAX ---------------*/

	//hero banner Slider
	var hero_slider_length = $("#hero_slider_carousel").find('.item').length;
	//alert(hero_slider_length);		
	$("#hero_slider_carousel").owlCarousel({
		dots: hero_slider_length > 1 ? true : false,
		nav: hero_slider_length > 1 ? false : false,
		touchDrag: hero_slider_length > 1 ? true : false,
		mouseDrag: hero_slider_length > 1 ? true : false,
		loop: hero_slider_length > 1 ? true : false,
		autoplay: hero_slider_length > 1 ? 3000 : false,
		autoplayHoverPause: hero_slider_length > 1 ? true : false,
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

	//slider_list_carousel
	var slider_length = $("#slider_list_carousel").find('.item').length;
	//alert(slider_length);		
	$("#slider_list_carousel").owlCarousel({
		margin: 15,
		responsiveClass: true,
		responsive: {
			0: {
				items: 1,
				dots: slider_length > 1 ? true : false,
				nav: slider_length > 1 ? true : false,
				touchDrag: slider_length > 1 ? true : false,
				mouseDrag: slider_length > 1 ? true : false,
				loop: slider_length > 1 ? true : false
			},
			600: {
				items: 2,
				dots: slider_length > 1 ? true : false,
				nav: slider_length > 1 ? true : false,
				touchDrag: slider_length > 1 ? true : false,
				mouseDrag: slider_length > 1 ? true : false,
				loop: slider_length > 1 ? true : false
			},
			768: {
				items: 3,
				dots: slider_length > 3 ? true : false,
				nav: slider_length > 3 ? true : false,
				touchDrag: slider_length > 3 ? true : false,
				mouseDrag: slider_length > 3 ? true : false,
				loop: slider_length > 3 ? true : false
			},
			1025: {
				items: 4,
				dots: slider_length > 4 ? false : false,
				nav: slider_length > 4 ? true : false,
				touchDrag: slider_length > 4 ? true : false,
				mouseDrag: slider_length > 4 ? true : false,
				loop: slider_length > 4 ? true : false
			}
		}
	});

	//custom_slider_length
	var custom_slider_length = $("#custom_slider_carousel").find('.item').length;
	$("#custom_slider_carousel").owlCarousel({
		touchDrag: custom_slider_length > 1 ? true : false,
		mouseDrag: custom_slider_length > 1 ? true : false,
		loop: custom_slider_length > 1 ? true : false,
		autoplay: custom_slider_length > 1 ? 3000 : false,
		autoplayHoverPause: custom_slider_length > 1 ? true : false,
		responsive: {
			0: {
				items: 1,
				dots: custom_slider_length > 1 ? true : false,
				nav: custom_slider_length > 1 ? false : false
			},
			600: {
				items: 1,
				dots: custom_slider_length > 1 ? true : false,
				nav: custom_slider_length > 1 ? false : false
			},
			768: {
				items: 1,
				dots: custom_slider_length > 1 ? false : false,
				nav: custom_slider_length > 1 ? true : false
			},
			1000: {
				items: 1,
				dots: custom_slider_length > 1 ? false : false,
				nav: custom_slider_length > 1 ? true : false
			}
		}
	});
	
	//custom_slider_length
	var custom_slider_carousel_length = $(".custom_slider_carousel").find('.item').length;
	$(".custom_slider_carousel").owlCarousel({
		touchDrag: custom_slider_carousel_length > 1 ? true : false,
		mouseDrag: custom_slider_carousel_length > 1 ? true : false,
		loop: custom_slider_carousel_length > 1 ? true : false,
		autoplay: custom_slider_carousel_length > 1 ? 3000 : false,
		autoplayHoverPause: custom_slider_carousel_length > 1 ? true : false,
		responsive: {
			0: {
				items: 1,
				dots: custom_slider_carousel_length > 1 ? true : false,
				nav: custom_slider_carousel_length > 1 ? false : false
			},
			600: {
				items: 1,
				dots: custom_slider_carousel_length > 1 ? true : false,
				nav: custom_slider_carousel_length > 1 ? false : false
			},
			768: {
				items: 1,
				dots: custom_slider_carousel_length > 1 ? false : false,
				nav: custom_slider_carousel_length > 1 ? true : false
			},
			1000: {
				items: 1,
				dots: custom_slider_carousel_length > 1 ? false : false,
				nav: custom_slider_carousel_length > 1 ? true : false
			}
		}
	});

	//About Us - Paperboat Slider
	var paper_length = $("#paper-boat").find('.item').length;
	//alert(paper_length);
	$("#paper-boat").owlCarousel({
		dots: paper_length > 1 ? false : false,
		nav: paper_length > 1 ? true : false,
		touchDrag: paper_length > 1 ? true : false,
		mouseDrag: paper_length > 1 ? true : false,
		loop: paper_length > 1 ? true : false,
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

	//ATP Second Slider
	var atp_slider_length = $("#atp_slider_carousel").find('.item').length;
	//alert(atp_slider_carousel);		
	$("#atp_slider_carousel").owlCarousel({
		dots: atp_slider_length > 1 ? false : false,
		nav: atp_slider_length > 1 ? true : false,
		touchDrag: atp_slider_length > 1 ? true : false,
		mouseDrag: atp_slider_length > 1 ? true : false,
		loop: atp_slider_length > 1 ? true : false,
		autoplay: atp_slider_length > 1 ? 3000 : false,
		autoplayHoverPause: atp_slider_length > 1 ? true : false,
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


	/* ------------- Video POPUP  ---------------*/
	autoPlayYouTubeModal();

	//FUNCTION TO GET AND AUTO PLAY YOUTUBE VIDEO FROM DATATAG
	function autoPlayYouTubeModal() {
		var trigger = $("body").find('[data-target="#videoModal"]');
		trigger.click(function () {
			var theModal = $(this).data("target"),
				videoSRC = $(this).attr("data-theVideo"),
				videoSRC_title = $(this).attr("data-title"),
				videoSRCauto = videoSRC + "?rel=0&amp;showinfo=0&amp;autoplay=1";
			$(theModal + ' iframe').attr('src', videoSRCauto);
			$('.popup-description').html(videoSRC_title);
			$(theModal + ' iframe').attr('src', videoSRCauto);
			$(theModal + ' button.close').click(function () {
				$(theModal + ' iframe').attr('src', videoSRC);
				videoSRC_title = $(this).attr("data-title","");
			});
			$('.modal').click(function () {
				$(theModal + ' iframe').attr('src', videoSRC);
			});
		});
	}	

	/* ------------- SCROLL TO TARGET SECTION ---------------*/
	if ($("#rfs").length <= 0) {
		//alert($("#rfs").length);
		///$("#like-what-you-see").hide();
		//$("ol.rmv-breadcrum").children().css("margin-right","4px");
		//$("ul.social-share").children().css("right","18%");
		$("[href='#rfs']").attr('href', '/contact/Pages/request-for-services.aspx');
		$("#like-what-you-see a").removeClass('scrollto-target');

	} else {
		if ($("#rfs iframe.iframe-height-about").length > 0 || $("#rfs iframe.iframe-height-investors").length > 0) {
			$("[href='#rfs']").attr('href', '/contact/Pages/request-for-services.aspx');
			$("#like-what-you-see a").removeClass('scrollto-target');
		}
	}


	$(".scrollto-target").click(function (e) {
		e.preventDefault();
		$('html, body').animate({
			scrollTop: $($(this).attr('href')).offset().top - 20
		}, 700);
	});
	/* ------------- SCROLL TO TARGET SECTION Pentagon ---------------*/
	$(".scrollto-target-pentagon").click(function (e) {
		e.preventDefault();
		$('html, body').animate({
			scrollTop: $($(this).attr('href')).offset().top - 70
		}, 700);
	});
	/* ------------- Offering Left border animation ---------------*/
	/*$(document).on("hover", ".offering-hover", function () {
		$(".offering-hover").each(function () {
			$(this).children(".offerings-row").toggleClass('offerings-hover');
		});
		$(this).children(".offerings-row").removeClass('offerings-hover');
	});*/
	$(document).on("mouseenter", ".offering-hover", function () {
		$(".offering-hover").each(function () {
			$(this).children(".offerings-row").toggleClass('offerings-hover');
		});
		$(this).children(".offerings-row").removeClass('offerings-hover');
	});
	$(document).on("mouseleave", ".offering-hover", function () {
		$(".offering-hover").each(function () {
			$(this).children(".offerings-row").toggleClass('offerings-hover');
		});
		$(this).children(".offerings-row").removeClass('offerings-hover');
	});

	/* ------------- Cookie Sticky bar close  ---------------*/
	//$('.cookie-outer .close-nav').click(function(){
	$(document).on("click", ".close-nav", function () {
		//alert('0');			
		$('.cookie-outer').hide();
	});
	/* ------------- Path Name checking for header ---------------*/
	var pathName = window.location.pathname.toLowerCase();
	var pageUrl = 'others';
	if (pathName === '/' || pathName === '/pages/index.aspx' || pathName === '/jp' || pathName === '/jp/' || pathName === '/jp/pages/index.aspx' || pathName === '/br' || pathName === '/br/' || pathName === '/br/pages/index.aspx' || pathName === '/cn' || pathName === '/cn/' || pathName === '/cn/pages/index.aspx' || pathName === '/mx' || pathName === '/mx/' || pathName === '/mx/pages/index.aspx' || pathName === '/de' || pathName === '/de/' || pathName === '/de/pages/index.aspx' || pathName === '/australia' || pathName === '/australia/' || pathName === '/australia/pages/index.aspx') {
		pageUrl = 'home';
	}

	// Newsroom events Listing page "active"
	var Querydata = window.location.search.substring(1);
	if (pathName === '/newsroom/events/pages/index.aspx' || pathName === '/newsroom/events/' || pathName === '/newsroom/events') {
		if (Querydata !== '') {
			$("#pevent").addClass("active");
			$("#uevent").removeClass("active");
		}
	}
	// Investors events Listing page "active"
	if (pathName === '/investors/news-events/events/pages/index.aspx' || pathName === '/investors/news-events/events/' || pathName === '/investors/news-events/events') {
		$(".title-box-yellow").hide();
		$("<style>").prop("type", "text/css").html(" .title-box-yellow {display:none !important;}").appendTo("head");

	}
	//PR Listing Download hide
	if (pathName === '/newsroom/press-releases/pages/index.aspx' || pathName === '/newsroom/press-releases/' || pathName === '/newsroom/press-releases') {
		$(".sticky-icons li.hidden-sm").hide();
	}

	/* ------------- Scroll Fixed second Header Industries ---------------*/
	var num = $(this).scrollTop() !== 0; /*$('header').offset().top;*/
	$(window).bind('scroll', function () {
		if (pageUrl !== 'home') {
			if ($(window).scrollTop() > num) {
				$('.hero-list').addClass('hero-list1');
				$('.listmenu').css('z-index', '9999');
				$('.scrollbg-show').addClass('show-strip');
				//$('#logo').attr('fill', '#007cc3');
				$('#logo, .insteplogocolor').attr('fill', '#007cc3');
				$('.menu-bg').addClass('reverseMenu');
				$('.hidden-list').addClass('visible-list');
				$('.menu-bg, .burger').css('margin-top', '12px');
				$('.hamburger-menu > .search__color').find('.search-icon').css('top', '20px');
				$('.hamburger-menu > .search__color').find('.btn1').css('color', '#000');
			} else {
				num = $(this).scrollTop() !== 0;
				$('.hero-list').removeClass('hero-list1');
				$('.listmenu').css('z-index', '9');
				$('.scrollbg-show').removeClass('show-strip');
				$('#logo, .insteplogocolor').attr('fill', '#fff');
				$('.menu-bg').removeClass('reverseMenu');
				$('.hidden-list').removeClass('visible-list');
				$('.menu-bg, .burger').css('margin-top', '35px');
				$('.hamburger-menu > .search__color').find('.search-icon').css('top', '47px');
				$('.hamburger-menu > .search__color').find('.btn1').css('color', '#fff');
			}
		}
	});

	/* ------------- Scrolling Tab Industry Solution ---------------*/
	if ($(".nav-tabs").length) {
		$('.nav-tabs').scrollingTabs({
				enableSwiping: true,
				scrollToTabEdge: true,
				disableScrollArrowsOnFullyScrolled: true
			})
			.on('ready.scrtabs', function () {
				$('.tab-content').show();
			});
	}
	/* ------------- SCROLL UP FUNCTION HOME Pages ---------------*/
	$(window).scroll(function () {
		if ($(this).scrollTop() !== 0) {
			$('.scroll-up').fadeIn(700);
			$('.header-menu').fadeOut(700);
		} else {
			$('.scroll-up').fadeOut(700);
			$('.header-menu').fadeIn(700);
		}

		// Scroll ProgressBar indicator
		if (pageUrl !== 'home') {
			var _document_height = $(document).height(),
				_window_height = $(window).height(),
				_scroll_top = $(window).scrollTop(),
				_w = 0;
			_w = _scroll_top * 100 / (_document_height - _window_height);
			$('.progressbar').find('> div').width(_w + '%');
		}
	});

	$('.scroll-up').click(function () {
		$('body,html').animate({
			scrollTop: 0
		}, 700);
	});

	/* ------------- Hamburg Menu ---------------*/
	/*if ('ontouchstart' in window) {
		var click = 'touchstart';
	} else {
		var click = 'click';
	}*/

	$(document).on('click', '.menu ul li a', function () {
		//e.preventDefault();
		//closeMenu();
	});

	/* ------------- Social Share ---------------*/
	$(document).on("click", ".trigger-share", function () {
		$('ul.social-share > li').toggleClass('slideout social-share-icon');
	});
	$(document).on("click", ".trigger-share-pr", function () {
		$(this).closest(".social-tag").find(".social-share-pr > li").toggleClass('slideout social-share-icon');
	});
	
	$(document).on("mouseover", ".hover-menu-hide", function () {
		$('.industries-menu').addClass('fadeOutRightBig').removeClass('fadeInLeftBig').css('display', 'none');
		$('.services-menu').addClass('fadeOutRightBig').removeClass('fadeInLeftBig').css('display', 'none');
		$('.platforms-menu').addClass('fadeOutRightBig').removeClass('fadeInLeftBig').css('display', 'none');
		$('.aboutus-menu').addClass('fadeOutRightBig').removeClass('fadeInLeftBig').css('display', 'none');
		$('.fix-menu').addClass('opacity-zero');
		$('.circle').addClass('bg-trans');
	});
	$(document).on("mouseleave", ".hover-menu-hide", function () {
		$('.fix-menu').removeClass('opacity-zero');
		$('.circle').removeClass('bg-trans');
	});

	/* ------------- Mega Dropdown animation ---------------*/
	$(document).on("mouseenter", ".dropdown", function () {
		$('.dropdown-menu', this).not('.in .dropdown-menu').stop(true, true).fadeIn("800");
		$(this).toggleClass('open');
		$('ul.hidden-list').css('opacity', '0');
	});
	$(document).on("mouseleave", ".dropdown", function () {
		$('.dropdown-menu', this).not('.in .dropdown-menu').stop(true, true).hide();
		$(this).toggleClass('open');
		$('ul.hidden-list').css('opacity', '1');
	});
	//on Click BreadCrumb link
	/*$(document).on('click', '.hero-list > ol > li.mega-dropdown', function (e) {
		e.stopPropagation();
	});*/

	/* -------------  SCROLL TO TARGET MENU ---------------*/
	/*$(document).on('click', '.navs a', function () {
		var scrollAnchor = $(this).attr('data-scroll'),
			scrollPoint = $('section[data-anchor="' + scrollAnchor + '"]').offset().top + 10;
		alert(scrollPoint);
		$('body,html').animate({
			scrollTop: scrollPoint
		}, 700);

		return false;

	});*/

	/* ------------- Tag Part ---------------*/
	$(document).on('click', '.tag-icon', function () {
		$(this).closest(".relative").find(".tag-postion").fadeIn();
	});
	$(document).on('click', '.tag-close', function () {
		$(this).closest(".relative").find(".tag-postion").fadeOut();
	});


	/* ------------- ACTIVE MENU ---------------*/
	/*$(window).scroll(function () {
		var windscroll = $(window).scrollTop();
		if (windscroll >= 100) {
			// $('nav').addClass('fixed');
			$('.wrapper section').each(function (i) {
				if ($(this).position().top <= windscroll + 10) {
					$('.navs li.active').removeClass('active');
					$('.navs li').eq(i).addClass('active');
				}
			});

		} else {

			//$('nav').removeClass('fixed');
			$('.navs li.active').removeClass('active');
			$('.navs li:first').addClass('active');
		}

	}).scroll();*/


	/* ------------- Country Selection Part ---------------*/
	$(document).on("click", ".select-country, .option-country > ul > li", function () {
		$(".option-country").toggleClass("open-country");
		if ($(".option-country").hasClass("open-country")) {
			$(".down-arrow").addClass("up-arrow").removeClass("down-arrow");
		} else {
			$(".up-arrow").addClass("down-arrow").removeClass("up-arrow");
		}
	});

	$(document).on('click', 'body', function (e) {
		if (!$(e.target).is('.select-country > a')) {
			$('.option-country.open-country').removeClass('open-country');
			$(".up-arrow").addClass("down-arrow").removeClass("up-arrow");
		}
	});

	/*************** Index start ***************/
	//home&end key press event
	//if (pageUrl === 'home') {
	/*document.addEventListener('keydown', function (event) {
		if (event.keyCode === 36) {
			$.scrollify.move('#1');
		}
		if (event.keyCode === 35) {
			if ($.scrollify.current().attr('id') !== 'do_more') {
				$.scrollify.instantMove('#5');
			}
		}
	}, true);*/

	/* get screen width */
	/*var screenWidth = $(window).width();
	var loopStart = 0;

	$(window).on('load', function () {

		if (screenWidth > 1024) {
			enableScrollify();
		} else {
			var herovide = document.getElementById('herovideo');
			herovide.autoplay = false;
			herovide.load();
		}

	});*/

	/* based on screen width enable/disable scrollify & tickering */
	/*if (screenWidth > 1024) {
		enableScrollify();
		loopStart = 4;

		enableTickering();
	} else {
		$('.beMoreSubText').css('visibility', 'visible');
		$('.addWowAnimation').addClass('wow fadeInUp');
	}*/

	/*$(window).resize(function () {
		screenWidth = $(window).width();
		if (screenWidth > 1024) {
			enableScrollify();
			loopStart = 4;

			//enable or disable tickering
			enableTickering();
		} else {
			$.scrollify.disable();
			$('body').removeAttr('style');
			loopStart = 0;

			//enable or disable tickering
			$('.beMoreSubText').css('visibility', 'visible');
			$('.blinkTxt').css('display', 'none');
			$('.typed-cursor').css('display', 'none');
		}
	});*/

	/* This part handles the highlighting functionality of left nav. */
	/*var aChildren = $("nav.sticky-left-nav li").children(); // find the a children of the list items
	var aArray = []; // create the empty aArray 
	for (var i = 0; i < aChildren.length; i++) {
		var aChild = aChildren[i];
		var ahref = $(aChild).attr('href');
		aArray.push(ahref);
	}*/
	$(window).scroll(function () {
		var windowPos = $(window).scrollTop(); // get the offset of the window from the top of page
		//var windowHeight = $(window).height(); // get the height of the window
		//var windowBottom = windowPos + windowHeight; //calculate the bottom of the window
		//var docHeight = $(document).height();
		//change j value based on no. of full scroll sections
		//for (var j = 0; j < aArray.length; j++) {
		//var theID = aArray[j];
		//var divPos = $(theID).offset().top; // get the offset of the div from the top of page
		//var divHeight = $(theID).height(); // get the height of the div in question			
		//var divBottom = divPos + divHeight; // calculate the bottom of the div
		//if (windowPos >= divPos && windowPos < (divPos + divHeight)) {
		/*if (((windowPos <= divPos) && (windowBottom >= divBottom)) || ((windowPos > divPos) && (windowBottom >= divBottom) && (windowPos < divBottom)) || ((windowPos <= divPos) && (windowBottom < divBottom) && (windowBottom > divPos)) || ((windowPos > divPos) && (windowBottom < divBottom))) {*/
		//Active menu
		if (windowPos >= 100) {

			$('section.scroll-section').each(function (i) {
				if ($(this).position().top <= windowPos - 0) {
					$('.sticky-left-nav li.nav-active').removeClass('nav-active mb50');
					$('.sticky-left-nav li').eq(i).addClass('nav-active mb50');
				}
			});
			//$('.sticky-left-nav').find('li').removeClass('nav-active mb50');
			//$("a[href='" + theID + "']").closest('li').addClass("nav-active mb50");
			//if (loopStart === 0) {
			//if ((j > 3) && (!$('nav.sticky-left-nav').find('li').hasClass('darkText'))) {
			//screenWidth = $(window).width();
			//if (screenWidth > 1024) {
			/*if (j > 3) { //alert('');
				$('nav.sticky-left-nav').find('li').addClass('darkText');
				$('body').removeAttr('style');
			} else if (j < 4) {
				$('nav.sticky-left-nav').find('li').removeClass('darkText');
				$('body').css('overflow', 'hidden');

			}*/
			//}
			//}
		} else {
			$('.stick-left-nav-ul li.nav-active-menu').removeClass('nav-active-menu');
		}
		//}

		/* change navigation text color when position reaches bottom */
		/*if (windowPos + windowHeight === docHeight) {
			$('nav.sticky-left-nav').find('li').addClass('darkText');
			$('.sticky-left-nav').find('li').removeClass('nav-active mb50');
			$('.sticky-left-nav').find('li:last-child()').addClass('nav-active mb50');
		}*/
		/* change navigation text color when position reaches top */
		/*if (windowPos === 0) {
			$('nav.sticky-left-nav').find('li').removeClass('darkText');
			$('.sticky-left-nav').find('li').removeClass('nav-active mb50');
			$('.sticky-left-nav').find('li:first-child()').addClass('nav-active mb50');
		}*/

		/* check footer offset for left sticky nav */
		//checkFooterOffset();

		/*if ($(this).scrollTop() !== 0) {
			$('.header-menu').fadeOut(700);
			$('.search__color').fadeOut(700);
		} else {
			$('.header-menu').fadeIn(700);
			$('.search__color').fadeIn(700);
		}*/
	});
	//}


	// onload Menu Active
	if ($(window).scrollTop() > 100) {
		var txx = $(window).scrollTop() + 1;
		window.scrollTo(0, txx);
	}
	/*if (pageUrl === 'home') {
		screenWidth = $(window).width();
		if (screenWidth > 1024) {
			// onload darkText, scroll, hidden add and remove
			if ($(window).scrollTop() < $('#do_more').offset().top) {
				$('body').css('overflow', 'hidden');
				$("#hero_slider_carousel").trigger('refresh.owl.carousel');
				$('.sticky-left-nav').find('li').removeClass('darkText');
			} else {
				$('body').removeAttr('style');
				$('.sticky-left-nav').find('li').addClass('darkText');
			}
		}
	}*/

	/* This part causes smooth scrolling on nav click */
	$("nav.sticky-left-nav a").click(function (evn) {
		evn.preventDefault();
		/*if ($(this).closest('li').hasClass('no-scrollify') && (!$(this).closest('li').siblings('.nav-active').hasClass('no-scrollify'))) {
			//$.scrollify.instantMove('#5');
			$('html, body').animate({
				scrollTop: $($(this).attr('href')).offset().top - 0
			}, 300);
		} */
		//$('.nav-active').not($(this)).removeClass('nav-active mb50');
		$(this).parent().addClass("nav-active");
		$('html, body').animate({
			scrollTop: $($(this).attr('href')).offset().top + 10
		}, 500);


		/*else {
			$('html, body').animate({
				scrollTop: $($(this).attr('href')).offset().top
			}, 300);
		}*/
		/*if ($($(this).attr('href')).hasClass('scroll-section')) { 
			$('.scroll-section').removeClass('fromUp');
			$($(this).attr('href')).addClass('fromUp');
		}*/
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

	/* scroll down click event */
	/*$(document).on('click', '.a-scroll-down', function (evn) {
		evn.preventDefault();
		$.scrollify.next();
	});*/

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

	//Contact Us Expand
	$(document).on('click', '.expand', function () {
		var expand = $(this).data('id');
		$(expand).fadeIn();
	});
	$(document).on('click', '.closeWrpr1', function () {
		$(this).parent().fadeOut();
	});

	/*Index End*/

	/* ------------- atp-grid counter Case Study Page ---------------*/
	if ($(".atp-grid-num").length) {
		new Waypoint({
			element: document.getElementsByClassName('atp-grid-num'),
			handler: function () {
				if (!$('.add-counter').hasClass('counter')) {
					$('.add-counter').addClass('counter');
					setTimeout(function () {
						initiateCounter();
					}, 2000);
				}
			},
			offset: 'bottom-in-view'
		});
	}
	/* ------------- initiate counter Home Page ---------------*/
	if ($(".initiate-counter").length) {
		new Waypoint({
			element: document.getElementsByClassName('initiate-counter'),
			handler: function () {
				if (!$('.add-counter').hasClass('counter')) {
					$('.add-counter').addClass('counter');
					setTimeout(function () {
						initiateCounter();
					}, 2000);
				}
			},
			offset: 'bottom-in-view'
		});
	}

	/* initiateCounter function definition */
	function initiateCounter() {
		/* counter up initiation */
		$('.counter').each(function () {
			var target = this;
			var endVal = parseFloat($(this).attr('data-endVal'));
			var theAnimation = new CountUp(target, 0, endVal, 0, 2);
			if (endVal % 1 !== 0) {
				theAnimation = new CountUp(target, 0, endVal, 2, 2);
			}
			theAnimation.start();
		});
	}



	/* ------------- Location Part ---------------*/
	$(document).on("change", "#select-region", function () {
		//event.preventDefault();
		var scrollTop = 68;
		if (this.value !== "") {
			var offsetValue = document.getElementById(this.value).offsetTop;
			$('html, body').animate({
				scrollTop: offsetValue - scrollTop
			}, 500);
		}
	});

	/* ------------- Success Stories Mobile drop-down Part ---------------*/
	$(document).on("click", ".select-case", function () {
		$(".option-case").toggleClass("open-case");
	});

	$(document).on('click', 'body', function (e) {
		if (!$(e.target).is('.select-case > a')) {
			$('.option-case.open-case').removeClass('open-case');
		}
	});

	/* ------------- Equal Height Success stories Part ---------------*/
	setTagPositionHeight();

	$(window).resize(function () {
		setTagPositionHeight();
	});

	function setTagPositionHeight() {
		$('.equal-bg, .item-list').each(function () {
			$(this).find('.tag-postion').css('top', $(this).find('.get-image-height').height());
		});
	}


	$(document).on("click", ".clk-fliter-overlay", function () {
		//e.preventDefault();
		$("#overlay_fliter_topic").fadeIn(600);
		$('body').css('overflow-y', 'hidden');
	});
	$(document).on("click", ".close-icon", function () {
		//e.preventDefault();
		$("#overlay_fliter_topic").fadeOut(600);
		$('body').css('overflow-y', 'scroll');
	});


	/* -------------  Success stories Case studies Grid / List change  Part ---------------*/
	$(document).on("click", "#grid", function (e) {
		e.preventDefault();
		$('#items-group .item-list').removeClass('list-group-item col-md-12 col-sm-12 col-xs-12').addClass('grid-group-item col-md-4 col-sm-4 col-xs-12');
		$('.thumbnail').addClass('col-md-12 col-sm-12 col-xs-12 p0').removeClass('col-md-3 col-sm-3 col-xs-12 col-md-push-9 col-sm-push-9 col-xs-12');
		$('.caption-txt').addClass('col-md-12 col-sm-12 col-xs-12 relative-off').removeClass('col-md-9 col-md-pull-3 col-sm-9 col-sm-pull-3 col-xs-12');
		//$('.p0-remove').removeClass('p0');		
		//$('.bg-white').addClass('col-eq-ht');
		//$('.title-box-yellow').addClass('minus-top');

		//$('.caption-txt').addClass('relative-off');		 
		//$('.lng-txt > .mb-xs-20').addClass('pt10');		
		$('.title-box-yellow').addClass('minus-top-grd').removeClass('minus-top-lst');
		$('.lng-txt').find('.title-box-yellow').removeClass('minus-top-grd');
		$('#items-group').find('.lng-txt').addClass('pt10');
		//$('.tag-bg1').addClass('tag-bg').removeClass('relative1 tag-bg1');
		//$('.tag-bg').css('position','absolute');
		//$('.item-list').find('.pt0').removeClass('pt0').addClass('pt15');
		//$('.list-popup').css('top','inh');
		//$('.bg-icon').removeClass('bg-icon-lst');

		setTagPositionHeight();

		$('#grid').addClass('active');
		$('#list').removeClass('active');
		//$('.item-list').find('.pt15').removeClass('minus-top-grd');.addClass('pt0').removeClass('pt15');		
	});

	$(document).on("click", "#list", function (e) {
		e.preventDefault();
		$('#items-group .item-list').addClass('list-group-item col-md-12 col-sm-12 col-xs-12').removeClass('grid-group-item col-md-4 col-sm-4 col-xs-12');
		$('.thumbnail').addClass('col-md-3 col-sm-3 col-xs-12 col-md-push-9 col-sm-push-9 col-xs-push-0').removeClass('col-md-12 col-sm-12 col-xs-12 p0');
		$('.caption-txt').addClass('col-md-9 col-sm-9 col-md-pull-3 col-sm-pull-3 col-xs-12 col-xs-pull-0').removeClass('col-md-12 col-sm-12 col-xs-12 relative-off');
		$('.bg-white .mb-xs-20').addClass('p0');
		$('.title-box-yellow').addClass('minus-top-lst').removeClass('minus-top-grd');
		//$('.tag-bg').css('position','relative');
		//$('.item-list').find('.pt15').removeClass('pt15').addClass('pt0');		
		$('#items-group').find('.lng-txt').removeClass('pt10');
		//$('.bg-icon').addClass('bg-icon-lst');
		//$('.item-list').find('.pt0').removeClass('pt0').addClass('pt15');
		//$('.pt0').addClass('pt15').removeClass('pt0');

		//$('.bg-white').removeClass('col-eq-ht');
		//$('.title-box-yellow').removeClass('minus-top');
		//$('.loc').addClass('col-md-12').removeClass('col-md-6');
		//$('.lng-txt > .mb-xs-20').removeClass('pt10');
		$('.pos-abs').css('top', '0px', 'position', 'absolute');

		$('#grid').removeClass('active');
		$('#list').addClass('active');
	});



	/* ------------- Search List Refine Your Search Read / Less ---------------*/

	var moretext = "<i class='fa fa-plus' aria-hidden='true'></i> Show more";
	var lesstext = "<i class='fa fa-minus' aria-hidden='true'></i> Show less";
	$(document).on('click', '.txt-toggle', function () {
		if ($(this).hasClass("less")) {

			$(this).removeClass("less");
			$(this).html(moretext);
			$(this).closest(".lst-search").find(".show-more").fadeOut();
			$('html, body').animate({
				scrollTop: $(".reach_top").offset().top - 120
			}, 600);
		} else {
			$(this).addClass("less");
			$(this).html(lesstext);
			$(this).closest(".lst-search").find(".show-more").fadeIn();
		}
	});
	// Greater than 5 'li' read more will show 			
	$("ul.list-item").each(function () {
		if ($(this).children().length > 5) {
			$(this).append('<a href="javascript:void();" class="txt-toggle"><i class="fa fa-plus" aria-hidden="true"></i> Show more</a>');
		} else {

		}

	});
	$("ul.refine-list").each(function () {
		if ($(this).children().length > 5) {
			$(this).append('<div class="clearfix"></div><a href="javascript:void(0);" title="More" class="tag-item clk-fliter-overlay"><i class="fa fa-plus" aria-hidden="true"></i> More</a>');
		} else {

		}
	});

	$(document).on('click', '.clk-fliter-overlay', function () {

		var show_cnt = $('.refine-topics-list').html();
		$('.show_refine_topics').append(show_cnt);
		$('.clk-fliter-overlay').fadeOut();
		$('.none').fadeIn();
		$('.refine-topics-list').empty();
	});
	$(document).on('click', '.close-icon', function () {

		var show_cnt1 = $('.show_refine_topics').html();
		$('.refine-topics-list').append(show_cnt1);
		$('.none').fadeOut();
		$('.clk-fliter-overlay').fadeIn();
		$('.show_refine_topics').find('ul.refine-list').remove();
	});

	$(document).on('click', 'ul.refine-list > li > input', function () {

		$(this).attr('checked', function (index, check) {
			return check === 'checked' ? null : 'checked';
		});
	});

	$(document).on('click', 'ul.refine-list > .none > li > input', function () {

		$(this).attr('checked', function (index, checked) {
			return checked === 'checked' ? null : 'checked';
		});
	});

	$(document).on('click', 'ul.sort-by > li > a', function () {
		$('.active').not($(this)).removeClass('active');
		$(this).toggleClass('active');
	});

	/* ------------- Press release landingpage read more ---------------*/


	var readmore = "READ MORE";
	var readless = "READ LESS";
	$(document).on('click', '.seemore', function () {
		if ($(this).hasClass("less")) {

			$(this).removeClass("less");
			$(this).html(readmore);
			$('html, body').animate({
				scrollTop: $("#accordion-expand").offset().top - 100
			}, 600);
		} else {
			$(this).addClass("less");
			$(this).html(readless);
		}
	});

	/* ------------- Contact Us Landing #Location Part ---------------*/

	$(document).on('click', '.go_to', function () {

		$('html, body').animate({
			scrollTop: $(".tab-content").offset().top - 100
		}, 600);
	});

	/* enable scrollify based on screenwidth */
	//function enableScrollify() {

	/* hiding scroll bar of body*/
	/*	if ($(window).scrollTop() <= $('#do_more').offset().top) {
		$('body').css('overflow', 'hidden');
	} else {
		$('body').removeAttr('style');
	}*/

	/*$('.swapAnimateFirst').addClass('UpanimationFirst');
	$('.swapAnimateSecond').addClass('UpanimationSecond');
	$('.swapAnimateThird').addClass('UpanimationThird');
	$('.swapAnimateFourth').addClass('UpanimationFourth');*/

	/* scrollify effect */
	/*$.scrollify({
				section: ".scroll-section",
				sectionName: false,
				interstitialSection: ".scroll-height",
				easing: "easeOutExpo",
				scrollSpeed: 900,
				offset: 0,
				scrollbars: true,
				standardScrollElements: ".scroll-standard",
				setHeights: false,
				overflowScroll: true,
				updateHash: false,
				touchScroll: true,
				before: function (index) {*/
	//if (index > 3) {
	//$('.sticky-left-nav').find('li').addClass('darkText');
	//$('body').removeAttr('style');
	//$('.scroll-section').removeClass('fromUp');


	//} else {
	//$('.sticky-left-nav').find('li').removeClass('darkText');
	//$('body').css('overflow', 'hidden');
	/*if (!$.scrollify.current().hasClass('fromUp')) { 
		$('.scroll-section').removeClass('fromUp');
		$.scrollify.current().addClass('fromUp');
	}*/


	//}
	/*				var player;
					if (index === 0) {
						if (player !== undefined) {
							player.playVideo();
						}
					} else {
						if (player !== undefined) {
							player.pauseVideo();
						}
					}*/

	//var activeSection = $.scrollify.current().attr('id');
	//alert(activeSection);
	//$('.sticky-left-nav').find('li').removeClass('nav-active mb50');
	//$('.sticky-left-nav').find("a[href='#" + activeSection + "']").closest('li').addClass('nav-active mb50');
	//
	//				$('.animateFirst').removeClass('fadeInUp');
	//				$('.animateSecond').removeClass('fadeInUp');
	//  $('.animateThird').removeClass('fadeInUp');
	//				$('.animateFourth').removeClass('fadeInUp');
	//	$.scrollify.current().find('.animateFirst').addClass('fadeInUp');
	//	$.scrollify.current().find('.animateSecond').addClass('fadeInUp');
	//	$.scrollify.current().find('.animateThird').addClass('fadeInUp');
	//	$.scrollify.current().find('.animateFourth').addClass('fadeInUp');
	//},
	//after: function () {
	//var activeSection = $.scrollify.current().attr('id');
	//if (!$('.sticky-left-nav').find("a[href='#" + activeSection + "']").closest('li').hasClass('nav-active mb50')) {
	//	$('.sticky-left-nav').find('li').removeClass('nav-active mb50');
	//	$('.sticky-left-nav').find("a[href='#" + activeSection + "']").closest('li').addClass('nav-active mb50');
	//}
	//},
	//	afterResize: function () {
	//		$.scrollify.update();
	//	},
	//	afterRender: function () {}
	//});
	//}

	/* enable tickering based on screenwidth*/
	/*function enableTickering() {
		if ($(".blinkTxt").length) {
			$(".blinkTxt").typed({
				strings: ['^200 Digital Navigation Framework'],
				typeSpeed: 30,
				startDelay: 1500,
				backSpeed: 20,
				contentType: 'html',
				cursorChar: "|",
				loop: false,
				preStringTyped: function (curString) {
					var lengthOfArray = this.strings.length - 1;
					if (curString === lengthOfArray) {
						setTimeout(function () {
							$('.typed-cursor').fadeOut();
						}, 500);
					}
				}
			});
		}
	}*/

	/* check footer's offset value and change left-navigation's position */
	function checkFooterOffset() {
		if ($('.sticky-left-nav').offset().top + $('.sticky-left-nav').height() >= $('footer').offset().top - 10)
		/*$('.sticky-left-nav').css({				
		    'position': 'absolute',
		    'bottom': '0',
		    'top': 'unset'
		});*/
		{
			$('.sticky-left-nav').addClass('bottom-menu').removeClass('top-menu');
		}

		if ($(document).scrollTop() + window.innerHeight < $('footer').offset().top) {
			$('.sticky-left-nav').addClass('top-menu').removeClass('bottom-menu');
		}
		/*$('.sticky-left-nav').css({'position': 'fixed','bottom': 'unset','top': '20%'});*/
	}


	/* ------------- WAYPOINT PART ---------------*/
	//change menu icon background and logo color
	if ($("#do_more").length) {
		var waypoint = new Waypoint({
			element: document.getElementById('do_more'),
			handler: function () {
				$('.menu-bg').toggleClass('reverseMenu');
				$('.btn--search').toggleClass('search-toggle-bg');
				$('.stick-left-nav-ul > li').toggleClass('darkText');
				$('#logo').attr('fill', function (index, attr) {
					return attr === '#007cc3' ? '#fff' : '#007cc3';
				});
				$('.burger > .icon-bar1').toggleClass('icon-bar11');
				$('.burger > .icon-bar2').toggleClass('icon-bar21');
				$('.burger > .icon-bar3').toggleClass('icon-bar31');
			}
		});
	}

	if ($(".home_promo_banner").length) {
		var waypoint1 = new Waypoint({
			element: document.getElementsByClassName('home_promo_banner'),
			handler: function () {
				$("header .container > .navbar-header,.container > .header-menu").toggleClass('hidden-xs hidden-sm hidden-md hidden-lg');
				$("header .container").toggleClass('mt45');
			}
		});
	}

	/* ------------- Tab Accordion Product landing ---------------*/
	if ($("#verticalTab").length) {
		$('#verticalTab').easyResponsiveTabs({
			type: 'vertical',
			width: 'auto',
			fit: true
		});
	}
	/* ------------- Success stories grif box animation ---------------*/

	$(window).scroll(function () {
		if ($("#success_stories").length) {
			if ($(window).scrollTop() > $("#success_stories").offset().top) {
				$("#success_stories .equal-heights > .relative").addClass("wow fadeInLeft animated");
				$("#success_stories .equal-heights > .relative:nth-child(1)").attr("data-wow-delay", "0.3s");
				$("#success_stories .equal-heights > .relative:nth-child(2)").attr("data-wow-delay", "0.6s");
				$("#success_stories .equal-heights > .relative:nth-child(3)").attr("data-wow-delay", "0.9s");
				$("#success_stories .equal-heights > .relative:nth-child(4)").attr("data-wow-delay", "1.2s");
			}
		}
	});

	/* ------------- L3 and InnerLeaf Page layout banner gradient ---------------*/

	var gradient_pageurl = window.location.pathname;
	gradient_pageurl = gradient_pageurl.toLowerCase();
	var gradient_sections = gradient_pageurl.split("/");



	if (gradient_sections[1] === "about")
		if ($(".industries-gradient").length)
			$("#sml_ht_home_banner").removeClass('industries-gradient').addClass('l3-gradient');
	if (gradient_sections[1] === "newsroom")
		if ($(".industries-gradient").length)
			$("#sml_ht_home_banner").removeClass('industries-gradient').addClass('newsroom-gradient');
	if (gradient_sections[1] === "investors")
		if ($(".industries-gradient").length)
			$("#sml_ht_home_banner").removeClass('industries-gradient').addClass('investors-gradient');
	if (gradient_sections[1] === "products-and-platforms")
		if ($(".industries-gradient").length)
			$("#sml_ht_home_banner").removeClass('industries-gradient').addClass('product-gradient');
	if (gradient_sections[1] === "contact")
		if ($(".industries-gradient").length)
			$("#sml_ht_home_banner").removeClass('industries-gradient').addClass('contactus-gradient');
	if (gradient_sections[1] === "jp" && gradient_sections[2] === "japan")
		if ($(".industries-gradient").length)
			$("#sml_ht_home_banner").removeClass('industries-gradient').addClass('l3-gradient');


		/* ------------- Petagon Popup Modal ---------------*/
	$('#petagon_modal').on('show.bs.modal', function (event) {
		var window_width = $(window).width();
		if (window_width > 767) {
			$('html, body').animate({
				scrollTop: $($('#overview')).offset().top
			}, 700);
		}

		var button = $(event.relatedTarget); // Button that triggered the modal
		var recipient = button.data('petagon'); // Extract info from data-* attributes
		petagon_modal_jumpTo(recipient);
		$("#petagon_modal").removeClass("open-anim close-anim").addClass("open-anim");

	});

	$('#petagon_modal').on('shown.bs.modal', function (event) {
		$("body .modal-backdrop").css("opacity", "0");
	});

	$('#petagon_modal').on('hidden.bs.modal', function (event) {
		$("#petagon_modal").css("display", "block");
		$("#petagon_modal").removeClass("open-anim close-anim").addClass("close-anim");
	});

	function petagon_modal_jumpTo(recipient) {
		$('#petagon_modal_carousel').trigger('to.owl.carousel', recipient);
	}

	/* ------------- Pentagone Slider ---------------*/
	var petagon_modal_length = $("#petagon_modal_carousel").find('.item').length;
	$("#petagon_modal_carousel").owlCarousel({

		touchDrag: petagon_modal_length > 1 ? true : false,
		mouseDrag: petagon_modal_length > 1 ? true : false,
		loop: petagon_modal_length > 1 ? false : false,
		//autoplay: petagon_modal_length > 1 ? 3000 : false,
		autoplay: false,
		autoplayHoverPause: petagon_modal_length > 1 ? true : true,
		responsive: {
			0: {
				items: 1,
				dots: petagon_modal_length > 1 ? false : false,
				dotsData: petagon_modal_length > 1 ? false : false,
				nav: petagon_modal_length > 1 ? true : false
			},
			600: {
				items: 1,
				dots: petagon_modal_length > 1 ? false : false,
				dotsData: petagon_modal_length > 1 ? false : false,
				nav: petagon_modal_length > 1 ? true : false
			},
			768: {
				items: 1,
				dots: petagon_modal_length > 1 ? false : false,
				dotsData: petagon_modal_length > 1 ? false : false,
				nav: petagon_modal_length > 1 ? true : false
			},
			1000: {
				items: 1,
				dots: petagon_modal_length > 1 ? true : false,
				dotsData: petagon_modal_length > 1 ? true : false,
				nav: petagon_modal_length > 1 ? false : false
			}
		}
	});
	/* ------------- Pentagone animation ---------------*/

	if ($("#pentagon").length) {
		var pentagon = anime.timeline({});
		pentagon.add({
			targets: '#digital-journey-pentagone',
			complete: function (anim) {
				$("#digital-journey-pentagone").removeClass("wow zoomIn animated");
				$("#digital-journey-pentagone").addClass("wow zoomIn animated");
				document.querySelector('#digital-journey-pentagone').setAttribute("fill", "#061838");
			}
		}).add({
			targets: '#outer-line-pentagone path, #pentagon path',
			strokeDashoffset: [anime.setDashoffset, 0],
			easing: 'easeInOutSine',
			duration: 1500,
			autoplay: false,
			delay: 1000,
			direction: 'normal',
			complete: function (anim) {

				$("text").fadeIn();

				$("#pentagone-firstidbg").removeClass("wow fadeInDown animated").addClass("wow fadeInDown animated");
				$("#pentagone-secondidbg").removeClass("wow fadeInLeft animated").addClass("wow animated fadeInLeft");
				$("#pentagone-thirdidbg, #pentagone-fourthidbg").removeClass("wow fadeInUp animated");
				$("#pentagone-fifthidbg").removeClass("wow fadeInRight animated");


				document.querySelector('#pentagone-firstidbg').setAttribute("fill", "#1E88E5");
				document.querySelector('#pentagone-secondidbg').setAttribute("fill", "#90CAF9");
				document.querySelector('#pentagone-thirdidbg').setAttribute("fill", "#64B5F6");
				document.querySelector('#pentagone-fourthidbg').setAttribute("fill", "#42A5F5");
				document.querySelector('#pentagone-fifthidbg').setAttribute("fill", "#2196F3");

				$("#pentagone-thirdidbg, #pentagone-fourthidbg").addClass("wow fadeInUp animated");
				$("#pentagone-fifthidbg").addClass("wow fadeInRight animated");

				$('#outer-line-pentagone').fadeOut(2000);
				$("#pentagone-firstid, #pentagone-secondid, #pentagone-thirdid, #pentagone-fourthid, #pentagone-fifthid").fadeOut(2500);
			}

		});
	}
	/* ------------- Pentagone restart ---------------*/
	if ($("#overview").length) {
		var waypoint3 = new Waypoint({
			element: document.getElementById('overview'),
			handler: function () {
				$("text").fadeOut();

				$('#outer-line-pentagone').fadeIn();
				$("#pentagone-firstid, #pentagone-secondid, #pentagone-thirdid, #pentagone-fourthid, #pentagone-fifthid").fadeIn();

				$("#digital-journey-pentagone, #pentagone-firstidbg, #pentagone-secondidbg, #pentagone-thirdidbg, #pentagone-fourthidbg, #pentagone-fifthidbg").attr('fill', 'none');
				$("#digital-journey-pentagone, #pentagone-firstidbg, #pentagone-secondidbg, #pentagone-thirdidbg, #pentagone-fourthidbg, #pentagone-fifthidbg").removeClass("wow zoomIn fadeInLeft animated fadeInDown fadeInUp fadeInRight");
				pentagon.restart();
			},
			offset: 50
		});
	}



	//AddThis Fix for ListingWeb part
	if ($("[class*='addthis_button_']").length) {
		$("[class*='addthis_button_']").each(function () {
			var checkaddthisurl = $(this).attr("addthis:url");
			if (checkaddthisurl.indexOf('infosys.com') < 0) {
				$(this).attr("addthis:url", "https://www.infosys.com" + checkaddthisurl);
			}
		});
	}

	$(document).on("click", ".slick-list .slick-slide", function () {
		$('html, body').animate({
			scrollTop: $("#our-story").offset().top
		}, 700);
	});


	//END
});

//RFS Scroll Top for Thankyou Message
window.rfsscrollonthankyou = function () {
	$('html, body').animate({
		scrollTop: $($('#rfs')).offset().top
	}, 700);

};
var screenWidth_all = $(window).width();
if (screenWidth_all > 1024) {
	//alert(screenWidth_all);
} else {
	function modify_breadcrumb_mob() {
		$("li.mega-dropdown > a").attr("href", "javascript:void();");
	}
	$(document).on('click', '.dropdown', function () {
		//e.stopPropagation();
		//alert("asdsadsa");
	});
}