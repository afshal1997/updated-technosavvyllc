<script type="text/javascript" src="{{ asset('assets/content/') }}/dam/web/en/home/designs/js/jquery.scrollify.min.js"></script>
<script type="text/javascript" src="{{ asset('assets/content/') }}/dam/web/en/home/designs/js/type.js"></script>
<div style='display:none' id='hidZone'></div>

</div>
</div>
</div>

<script type="text/javascript" src="{{ asset('assets/clientlibs/') }}/clientlibs/granite/jquery.js"></script>
<script type="text/javascript" src="{{ asset('assets/clientlibs/') }}/clientlibs/granite/jquery-ui.js"></script>
<script type="text/javascript" src="{{ asset('assets/clientlibs/') }}/clientlibs/granite/utils.js"></script>
<script type="text/javascript" src="{{ asset('assets/clientlibs/') }}/clientlibs/granite/legacy/shared.js"></script>
<script type="text/javascript" src="{{ asset('assets/clientlibs/') }}/web/clientlibs/clientlib-commons.js"></script>
<script type="text/javascript" src="https://unpkg.com/aos@2.3.0/dist/aos.js"></script>


</div>


<div class="modal fade" id="divAjaxLoader" role="dialog" aria-labelledby="divAjaxLoader" aria-hidden="true" style="display: none;">
    <div class="modal-dialog" role="document">
        <div class="modal-body ajax-loader-modal">
            <img id="ajax-loader" src="{{ asset('assets/content/') }}/dam/web/common/loading.gif" />
        </div>
    </div>
</div>

<script>
    jQuery(window).on('load', function () {
        jQuery('#preloader').fadeOut();
    });

    $(window).scroll(function () {
        var scroll = $(window).scrollTop();
        if (scroll >= 100) {
            $(".burger").addClass("invertHeader");
        }

        if (scroll <= 100) {
            $(".burger").removeClass("invertHeader");
        }
    });
    
jQuery('.haveSubmenu > a').click(function () {
    jQuery('.haveSubmenu').toggleClass('active');
});
</script>

@yield('js')