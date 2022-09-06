window.$ = jQuery.noConflict();

function OptanonWrapper() {}
$(document).ready(function () {
    AOS.init({
        duration: 1200,
    })
    $(window).scroll(function () {
        var scroll = $(window).scrollTop();
        if (scroll >= 500) {
            $("body").addClass("active_headers");
        }
    });
});

var $nav = $('nav');

// fullpage customization
$('#fullpage').fullpage({
    sectionSelector: '.parallax-tn',
    slidesNavigation: true,
    controlArrows: false,
    navigation: true,
    slidesNavigation: true,
    controlArrows: false,

});

// Nav Trigger
// Left Menu
jQuery('.sticky-left-nav ul li').delegate('a', 'click', function () {

    var num_li = $(this).parent('li').index();
    var num_li_p = num_li + 1;
    jQuery("#fp-nav ul li:nth-child(" + num_li_p + ") a").trigger('click');

});

jQuery('.sticky-left-nav ul li').delegate('a', 'click', function () {

    jQuery('.sticky-left-nav ul li').removeClass('nav-active');
    var num_li = jQuery(this).parent('li').addClass('nav-active');

});

// Right Dots
jQuery('#fp-nav ul li').delegate('a', 'click', function () {

    var num_li1 = $(this).parent('li').index();
    var num_li1_p = num_li1 + 1;
    jQuery(".sticky-left-nav ul li").removeClass('nav-active');
    jQuery(".sticky-left-nav ul li:nth-child(" + num_li1_p + ")").addClass('nav-active');

});

// Onscroll Add
$('.parallax-tn').bind('mousewheel', function (e) {
    if (e.originalEvent.wheelDelta / 120 > 0) {
        setTimeout(function () {
            var num_li2 = $('#fp-nav ul li a.active').parent('li').index();
            var num_li2_p = num_li2 + 1;
            jQuery(".sticky-left-nav ul li").removeClass('nav-active');
            jQuery(".sticky-left-nav ul li:nth-child(" + num_li2_p + ")").addClass('nav-active');
        }, 500);
    } else {
        setTimeout(function () {
            var num_li21 = $('#fp-nav ul li a.active').parent('li').index();
            var num_li21_p = num_li21 + 1;
            jQuery(".sticky-left-nav ul li").removeClass('nav-active');
            jQuery(".sticky-left-nav ul li:nth-child(" + num_li21_p + ")").addClass('nav-active');
        }, 500);
    }
});

document.onkeydown = function (e) {
    switch (e.which) {
        case 37: // left
            // alert('left');
            break;

        case 38: // up
            setTimeout(function () {
                var num_li21 = $('#fp-nav ul li a.active').parent('li').index();
                var num_li21_p = num_li21 + 1;
                jQuery(".sticky-left-nav ul li").removeClass('nav-active');
                jQuery(".sticky-left-nav ul li:nth-child(" + num_li21_p + ")").addClass('nav-active');
            }, 500);
            break;

        case 39: // right
            // alert('Right');
            break;

        case 40: // down
            setTimeout(function () {
                var num_li21 = $('#fp-nav ul li a.active').parent('li').index();
                var num_li21_p = num_li21 + 1;
                jQuery(".sticky-left-nav ul li").removeClass('nav-active');
                jQuery(".sticky-left-nav ul li:nth-child(" + num_li21_p + ")").addClass('nav-active');
            }, 500);
            break;
        case 17: // ctrl
            setTimeout(function () {
                jQuery('body').css('overflow', 'auto');
                jQuery('body').css('height', 'auto');


            }, 500);
            break;

        default:
            return;
    }
    e.preventDefault();
};

// Contact trigger
jQuery('.contct-btn').click(function () {
    jQuery('ul.stick-left-nav-ul li:nth-child(8) a').trigger('click');
});

jQuery('body:not(.index) .navbar-brand>img').attr('src', './assets/images/home/logo.svg');
jQuery('body:not(.index) div.menuItems > ul > li > a.contct-btn').on('click', function () {
    jQuery('html, body').animate({
        scrollTop: jQuery('#contact_us').offset().top
    }, 500);
});
jQuery('.contct-btn').click(function () {
    jQuery('div.burger').trigger('click');
});

jQuery(document).ready(function ($) {
    $('.associate-with-slides').slick({
        arrows: false,
        slidesToShow: 4,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 2000,
        responsive: [{
                breakpoint: 1024,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 3,
                }
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2
                }
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2
                }
            }
        ]
    });
    $('.affiliate-logo-main').slick({
        arrows: false,
        slidesToShow: 3,
        slidesToScroll: 1,
        autoplay: false,
        autoplaySpeed: 2000,
        responsive: [{
                breakpoint: 1024,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 3,
                }
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2
                }
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            }
        ]
    });
});

// Port slider

var $carousel = $('.digital-port-main:not(.digital-port-main1),.digital-port-main1');

var settings = {
    slide: '.digital-port-repeater',
    slidesToShow: 1,
    centerMode: true,
    loop: false,
    responsive: [{
            breakpoint: 1024,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
            }
        },
        {
            breakpoint: 600,
            settings: {
                slidesToShow: 1,
                centerMode: false,
                slidesToScroll: 1
            }
        },
        {
            breakpoint: 480,
            settings: {
                slidesToShow: 1,
                centerMode: false,
                slidesToScroll: 1
            }
        }
        // You can unslick at a given breakpoint now by adding:
        // settings: "unslick"
        // instead of a settings object
    ]
};

function setSlideVisibility() {
    //Find the visible slides i.e. where aria-hidden="false"
    var visibleSlides = $carousel.find('.digital-port-repeater[aria-hidden="false"]');
    //Make sure all of the visible slides have an opacity of 1
    $(visibleSlides).each(function () {
        $(this).css('opacity', 1);
    });

    //Set the opacity of the first and last partial slides.
    $(visibleSlides).first().prev().css('opacity', '0');
}

$carousel.slick(settings);
$carousel.slick('slickGoTo', 1);
setSlideVisibility();

$carousel.on('afterChange', function () {
    setSlideVisibility();
});


// TAbs Tn
setTimeout(function () {
    jQuery('.digital-portfolio-sec .nav-tabs>li:first-child>a').trigger('click');
}, 1000);
jQuery('.digital-portfolio-sec .nav-tabs>li>a').click(function () {
    var active_a = jQuery(this).attr('data-id');
    jQuery('.digital-portfolio-sec .nav-tabs>li>a').removeClass('active');
    jQuery(this).addClass('active');
    jQuery('.tab-pane-tn').removeClass('active-tn');
    jQuery('.tab-pane-tn#' + active_a).addClass('active-tn');
    jQuery('.tab-pane-tn').fadeOut();
    jQuery('.tab-pane-tn#' + active_a).fadeIn();
    jQuery('.digital-portfolio-sec .slick-next').trigger('click');
    setTimeout(function () {
        jQuery('div.tab-pane-tn:not(.active-tn)').css('opacity', '0');
        jQuery('div.tab-pane-tn:not(.active-tn)').css('position', 'absolute;');
        jQuery('div.tab-pane-tn.active-tn').css('opacity', '1');
    }, 500);
});

$(document).ready(function () {
    $('#formvalues').on('submit', function (e) {
        e.preventDefault();
        let full_name = $('#full_name').val();
        let phone = $('#phone').val();
        let company = $('#company').val();
        let email = $('#email').val();
        var error = 0;
        if (full_name == '') {
            $('#full_name_err').text("Full Name is required");
            $('#formvalues .full_name').focus();
            error++;
        }
        if (email == '') {
            $('#email_err').text("Email is required");

            $('#formvalues .email').focus();
            error++;
        }
        if (!validateEmail(email)) {
            error++;
            $('#email_err').text("Email Not Valid");
            $('#formvalues .email').focus();
        }
        if (phone == '') {
            $('#phone_err').text("Phone is required");
            $('#formvalues .phone').focus();
            error++;
        }
        if (company == '') {
            $('#company_err').text("Company Name is required");
            $('#formvalues .company').focus();
            error++;
        }
        if (error == 0) {


            $.ajax({
                url: 'postForms',
                type: 'post',
                dataType: "JSON",
                data: new FormData(this),
                contentType: false,
                processData: false,
                success: function (data) {
                    if (data.status == true) {
                        $('input').val('');
                        $('#exampleModal').modal('hide');
                        window.location.href = 'https://technosavvyllc.com/thankyou';
                    } else {
                        alert(data.message);
                    }

                }
            })
        }
    })

    $('#contactForm').on('submit', function (e) {
        e.preventDefault();
        let full_name = $('#full_name_contact').val();
        let phone = $('#phone_contact').val();
        let email = $('#email_contact').val();
        let subject = $('#subject_contact').val();


        var error = 0;
        if (full_name == '') {

            $('#full_name_contact_err').text("Full Name is required");
            $('#contactForm #full_name_contact').focus()

            error++;
        }
        if (email == '') {
            $('#email_contact_err').text("Email is required");
            $('#contactForm #email_contact').focus()

            error++;
        }
        if (!validateEmail(email)) {
            error++;
            $('#email_err').text("Email Not Vali is required");
            $('#contactForm #email_contact').focus();
        }
        if (phone == '') {
            $('#phone_contact_err').text("Phone is required");
            $('#contactForm #phone_contact').focus()
            error++;
        }
        if (subject == '') {
            $('#subject_contact_err').text("Subject is required");
            $('#contactForm #subject_contact').focus()
            error++;
        }
        if (error == 0) {
            $.ajax({
                url: 'contactUsForm',
                type: 'post',
                dataType: "JSON",
                data: new FormData(this),
                contentType: false,
                processData: false,
                success: function (data) {
                    if (data.status == true) {
                        $('input').val('');
                        window.location.href = 'https://technosavvyllc.comthankyou';
                    } else {
                        alert(data.message);
                    }
                }
            })
        }

    })
})

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}
