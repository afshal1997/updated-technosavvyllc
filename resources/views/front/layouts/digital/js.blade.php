<script src="{{ asset('landing/js') }}/jquery.min.js"></script>
<script src="{{ asset('landing/bootstrap-4.3.1/js') }}/bootstrap.min.js"></script>
<script>
    jQuery('.repeated-box-main input.next').click(function() {
        jQuery(this).closest('.repeated-box').slideUp('');
        jQuery(this).closest('.repeated-box').next().slideDown('');
        jQuery('#progressbar li').removeClass('active');
        jQuery('#progressbar li[data-id="contact-details"]').addClass('active');
    });
    jQuery('.repeated-box-main input.previous').click(function() {
        jQuery(this).closest('.repeated-box').slideUp('');
        jQuery(this).closest('.repeated-box').prev().slideDown('');
        jQuery('#progressbar li').removeClass('active');
        jQuery('#progressbar li[data-id="project-details"]').addClass('active');
    });
</script>

<script type="text/javascript" src="//cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.min.js"></script>
<script>
    $('.associate-with-slides').slick({
        arrows: false,
        infinite: true,
        speed: 300,
        slidesToShow: 4,
        slidesToScroll: 4,
        autoplay: true,
        autoplaySpeed: 2000,
        infinite: true,

        responsive: [{
                breakpoint: 1024,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 3,
                }
            },
            {
                breakpoint: 768,
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
    $('.card-portfolio').slick({
        arrows: false,
        dots: true,
        infinite: false,
        speed: 300,
        slidesToShow: 3,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 2000,
        infinite: true,
        responsive: [{
                breakpoint: 1024,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
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
</script>
<script src="https://code.jquery.com/ui/1.12.1/jquery-ui.js"></script>
<script>
    $(function() {
        $("input#pdate").datepicker();
    });
</script>
<script>
    jQuery(window).on('load', function() {
        jQuery('#preloader').fadeOut();
    });
</script>
</body>

</html>

@yield('js')