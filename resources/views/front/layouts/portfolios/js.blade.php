<script type="text/javascript" src="{{ asset('assets/portfolio/') }}/js/jquery.min.js"></script>
<script type="text/javascript" src="{{ asset('assets/portfolio/') }}/js/jquery.migrate.js"></script>
<script type="text/javascript" src="{{ asset('assets/portfolio/') }}/js/jquery.magnific-popup.min.js"></script>
<script type="text/javascript" src="{{ asset('assets/portfolio/') }}/js/bootstrap.js"></script>
<script type="text/javascript" src="{{ asset('assets/portfolio/') }}/js/jquery.imagesloaded.min.js"></script>
<script type="text/javascript" src="{{ asset('assets/portfolio/') }}/js/jquery.isotope.min.js"></script>
<script type="text/javascript" src="{{ asset('assets/portfolio/') }}/js/jquery.hoverdir.js"></script>
<script type="text/javascript" src="{{ asset('assets/portfolio/') }}/js/script.js"></script>
<script src="https://cdn.jsdelivr.net/gh/fancyapps/fancybox@3.5.7/dist/jquery.fancybox.min.js"></script>
<script>
	jQuery(window).load(function() {
		jQuery('.tab-content-ntn').hide();
		jQuery('.tab-content-ntn.active').show();
	});
	jQuery('.tab-links-ntn>li>a').click(function() {
		var active_a = jQuery(this).attr('data-id');
		jQuery('.tab-links-ntn>li>a').removeClass('active');
		jQuery(this).addClass('active');
		jQuery('.tab-content-ntn').removeClass('active');
		jQuery('.tab-content-ntn#' + active_a).addClass('active');
		jQuery('.tab-content-ntn').fadeOut();
		jQuery('.tab-content-ntn#' + active_a).fadeIn();
	});

	jQuery('.tab-links-ntn a.tab-link-ntn.active').trigger('click');
</script>
<!-- Preloader Start -->
<script>
	jQuery(window).on('load', function() {
		jQuery('#preloader').fadeOut();
	});
</script>
<!-- Preloader End -->
</body>

</html>