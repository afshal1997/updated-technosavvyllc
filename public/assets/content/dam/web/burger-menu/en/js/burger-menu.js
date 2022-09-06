$(function() {

	"use strict";

	/* ------------- Path Name checking for header --------------- */
	var pathName = window.location.pathname.toLowerCase();
	var pageUrl = 'others';
	if (pathName === '/content/infosys-web/en.html' || pathName === '/' || pathName === '/jp' || pathName === '/jp/' || pathName === '/cn'
			|| pathName === '/cn/' || pathName === '/mx' || pathName === '/mx/' || pathName === '/de' || pathName === '/de/' || pathName === '/content/infosys-web/en/australia.html'|| pathName === '/australia.html') {
		pageUrl = 'home';
	}
	/* ------------- Scroll Fixed second Header Industries --------------- */
	var num = $(this).scrollTop() !== 0;
	$(window).bind('scroll', function() {
		if (pageUrl !== 'home') {
			if ($(window).scrollTop() > num) {
				$('.scrollbg-show').addClass('show-strip');
				$('.menu-bg').addClass('reverseMenu');
				$('.burger > .icon-bar1').addClass('icon-bar11');
				$('.burger > .icon-bar2').addClass('icon-bar21');
				$('.burger > .icon-bar3').addClass('icon-bar31');
				$('.hidden-list').addClass('visible-list');
				$('.menu-bg, .burger').css('margin-top', '12px');
				$('.search__color').find('.search-icon').css('top', '20px');
				$('.search__color').find('.btn1').css('color', '#000');
			} else {
				num = $(this).scrollTop() !== 0;
				$('.scrollbg-show').removeClass('show-strip');
				$('.menu-bg').removeClass('reverseMenu');
				$('.burger > .icon-bar1').removeClass('icon-bar11');
				$('.burger > .icon-bar2').removeClass('icon-bar21');
				$('.burger > .icon-bar3').removeClass('icon-bar31');
				$('.hidden-list').removeClass('visible-list');
				$('.menu-bg, .burger').css('margin-top', '35px');
				$('.search__color').find('.search-icon').css('top', '47px');
				$('.search__color').find('.btn1').css('color', '#fff');
			}
		}
	});

	/* ------------- SCROLL UP FUNCTION HOME Pages --------------- */
	$(document).on("click", ".burger", function() {
		$('.search-wrap.search-icon').css('z-index', '0');
		if (!$(this).hasClass('open')) {
			$('html, body').addClass('hidden-scroll');
			$('.listmenu').css('z-index', '2');
			$('.progressbar,.hero-list1').css('display', 'none');
			$('.listmenu .hero-list').css('display', 'none');
			$('.search-icon').attr('style', 'z-index: 0 !important');
			$('.user-icon').css({ 'opacity': '0', 'z-index': '0' });
			openMenu();
		} else {
			$('html, body').removeClass('hidden-scroll');
			$('.fix-menu').removeClass('opacity-zero');
			$('.circle').removeClass('bg-trans');
			$('.listmenu').css('z-index', '9999');
			$('.progressbar,.hero-list1').css('display', 'block');
			$('.listmenu .hero-list').css('display', 'block');
			$('.search-icon').attr('style', 'z-index: 9999 !important');
			$('.user-icon').css({ 'opacity': '1', 'z-index': '9999' });
			if($('.navbar-default.navbar-fixed-top.show-strip').length > 0) {
				$('.search-icon').css('top', '20px');
			} else {
				$('.search-icon').css('top', '47px');
			}
			closeMenu();
		}
	});
	/* ------------- Equal Height Success stories Part ---------------*/	
	$(document).on("mouseover", ".burger", function () {
		$('.industries-menu').addClass('fadeOutRightBig').removeClass('fadeInLeftBig').css('display', 'none');
		$('.services-menu').addClass('fadeOutRightBig').removeClass('fadeInLeftBig').css('display', 'none');
		$('.platforms-menu').addClass('fadeOutRightBig').removeClass('fadeInLeftBig').css('display', 'none');
		$('.aboutus-menu').addClass('fadeOutRightBig').removeClass('fadeInLeftBig').css('display', 'none');
	});

	$(document).on("mouseover", ".hover-menu-hide", function () {
		$('.industries-menu').addClass('fadeOutRightBig').removeClass('fadeInLeftBig').css('display', 'none');
		$('.services-menu').addClass('fadeOutRightBig').removeClass('fadeInLeftBig').css('display', 'none');
		$('.platforms-menu').addClass('fadeOutRightBig').removeClass('fadeInLeftBig').css('display', 'none');
		$('.aboutus-menu').addClass('fadeOutRightBig').removeClass('fadeInLeftBig').css('display', 'none');
		$('.fix-menu').addClass('opacity-zero');
		$('.circle').addClass('bg-trans');
	});

	$(document).on("mouseleave", ".hover-menu-hide", function() {
		$('.fix-menu').removeClass('opacity-zero');
		$('.circle').removeClass('bg-trans');
	});

	if ($(window).width() < 1025) {
		// Close button for long menu
		$(document).on('click', '.visible1024-cross', function () {
			$('.industries-menu').addClass('fadeOutRightBig').removeClass('fadeInLeftBig').css('display', 'none');
			$('.services-menu').addClass('fadeOutRightBig').removeClass('fadeInLeftBig').css('display', 'none');
			$('.platforms-menu').addClass('fadeOutRightBig').removeClass('fadeInLeftBig').css('display', 'none');
			$('.aboutus-menu').addClass('fadeOutRightBig').removeClass('fadeInLeftBig').css('display', 'none');
		});
		// Industries
		$(document).on('click', '.industries', function () {
			$('.industries-menu').addClass('fadeInLeftBig').removeClass('fadeOutRightBig').css('display', 'block');
			$('.services-menu').addClass('fadeOutRightBig').removeClass('fadeInLeftBig').css('display', 'none');
			$('.platforms-menu').addClass('fadeOutRightBig').removeClass('fadeInLeftBig').css('display', 'none');
			$('.aboutus-menu').addClass('fadeOutRightBig').removeClass('fadeInLeftBig').css('display', 'none');
		});
		// Services
		$(document).on('click', '.services', function () {
			$('.industries-menu').addClass('fadeOutRightBig').removeClass('fadeInLeftBig').css('display', 'none');
			$('.services-menu').addClass('fadeInLeftBig').removeClass('fadeOutRightBig').css('display', 'block');
			$('.platforms-menu').addClass('fadeOutRightBig').removeClass('fadeInLeftBig').css('display', 'none');
			$('.aboutus-menu').addClass('fadeOutRightBig').removeClass('fadeInLeftBig').css('display', 'none');
		});
		// Platforms
		$(document).on('click', '.platforms', function () {
			$('.industries-menu').addClass('fadeOutRightBig').removeClass('fadeInLeftBig').css('display', 'none');
			$('.services-menu').addClass('fadeOutRightBig').removeClass('fadeInLeftBig').css('display', 'none');
			$('.platforms-menu').addClass('fadeInLeftBig').removeClass('fadeOutRightBig').css('display', 'block');
			$('.aboutus-menu').addClass('fadeOutRightBig').removeClass('fadeInLeftBig').css('display', 'none');
		});
		// About Us
		$(document).on('click', '.about-txt', function () {
			$('.industries-menu').addClass('fadeOutRightBig').removeClass('fadeInLeftBig').css('display', 'none');
			$('.services-menu').addClass('fadeOutRightBig').removeClass('fadeInLeftBig').css('display', 'none');
			$('.platforms-menu').addClass('fadeOutRightBig').removeClass('fadeInLeftBig').css('display', 'none');
			$('.aboutus-menu').addClass('fadeInLeftBig').removeClass('fadeOutRightBig').css('display', 'block');
		});
	} else {
		// Industries
		$(document).on("mouseover", ".industries", function () {
			$('.industries-menu').addClass('fadeInLeftBig').removeClass('fadeOutRightBig').css('display', 'block');
			$('.services-menu').addClass('fadeOutRightBig').removeClass('fadeInLeftBig').css('display', 'none');
			$('.platforms-menu').addClass('fadeOutRightBig').removeClass('fadeInLeftBig').css('display', 'none');
			$('.aboutus-menu').addClass('fadeOutRightBig').removeClass('fadeInLeftBig').css('display', 'none');
		});
		// Services
		$(document).on("mouseover", ".services", function () {
			$('.industries-menu').addClass('fadeOutRightBig').removeClass('fadeInLeftBig').css('display', 'none');
			$('.services-menu').addClass('fadeInLeftBig').removeClass('fadeOutRightBig').css('display', 'block');
			$('.platforms-menu').addClass('fadeOutRightBig').removeClass('fadeInLeftBig').css('display', 'none');
			$('.aboutus-menu').addClass('fadeOutRightBig').removeClass('fadeInLeftBig').css('display', 'none');
		});
		// Platforms
		$(document).on("mouseover", '.platforms', function () {
			$('.industries-menu').addClass('fadeOutRightBig').removeClass('fadeInLeftBig').css('display', 'none');
			$('.services-menu').addClass('fadeOutRightBig').removeClass('fadeInLeftBig').css('display', 'none');
			$('.platforms-menu').addClass('fadeInLeftBig').removeClass('fadeOutRightBig').css('display', 'block');
			$('.aboutus-menu').addClass('fadeOutRightBig').removeClass('fadeInLeftBig').css('display', 'none');
		});
		// About Us
		$(document).on("mouseover", '.about-txt', function () {
			$('.industries-menu').addClass('fadeOutRightBig').removeClass('fadeInLeftBig').css('display', 'none');
			$('.services-menu').addClass('fadeOutRightBig').removeClass('fadeInLeftBig').css('display', 'none');
			$('.platforms-menu').addClass('fadeOutRightBig').removeClass('fadeInLeftBig').css('display', 'none');
			$('.aboutus-menu').addClass('fadeInLeftBig').removeClass('fadeOutRightBig').css('display', 'block');
		});
	}

	function openMenu() {
		$('.circle').addClass('expand');
		$('.burger').addClass('open');
		$('.icon-bar1, .icon-bar2, .icon-bar3').addClass('collapse');
		$('.menu').fadeIn();

		setTimeout(function() {
			$('.icon-bar2').hide();
			$('.icon-bar1').addClass('rotate30');
			$('.icon-bar3').addClass('rotate150');
		}, 70);
		setTimeout(function() {
			$('.icon-bar1').addClass('rotate45');
			$('.icon-bar3').addClass('rotate135');
		}, 120);
	}

	function closeMenu() {
		$('.burger').removeClass('open');
		$('.icon-bar1').removeClass('rotate45').addClass('rotate30');
		$('.icon-bar3').removeClass('rotate135').addClass('rotate150');
		$('.circle').removeClass('expand');
		$('.menu').fadeOut();

		setTimeout(function() {
			$('.icon-bar1').removeClass('rotate30');
			$('.icon-bar3').removeClass('rotate150');
		}, 50);
		setTimeout(function() {
			$('.icon-bar2').show();
			$('.icon-bar1, .icon-bar2, .icon-bar3').removeClass('collapse');
		}, 70);
	}

	$("#LinkUpdateProfile").click(function(event) {
		event.preventDefault();
		window.location.href = $("#UpdateProfileUrl").attr("href");
	});

	$("#LinkSignOut").click(function(event) {
		event.preventDefault();
		window.location.href = $("#SignOutPrefixUrl").attr("href") + $("#SignOutPostfixUrl").attr("href");
	});

});
