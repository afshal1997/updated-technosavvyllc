$(function () {

    if ($('option[disabled="disabled"]').length > 0) {
        $('option[disabled="disabled"]').remove();
    }

    /*Script for third nav left box on some pages - START*/
    $('.third-nav .sub-menu-list > a').click(function (e) {
        e.preventDefault();
        $(this).siblings('.sub-menu').toggle();
    })

    /* Script for adding company promotion - START */
    if ($('.col-md-7.aside-widget').length > 0) {
        var companyPromotionHTML = {}
        var jsonCPObject = JSON.stringify(companyPromotionHTML);
        $.ajax({
            type: "GET",
            contentType: "application/json; charset=utf-8",
            url: "/_vti_bin/InfosysCMS/InfosysCMSService.svc/GetCompanyPromotion?companyname=default",
            data: jsonCPObject,
            processData: true,
            success: function (responseData) {
                if (responseData.length > 0) {
                    $('.col-md-7.aside-widget:first').html(responseData);
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                LoggingInConsole(xhr.status);
                LoggingInConsole(thrownError);
            }
        });
    }
    /* Script for adding company promotion - END */


    $("#btnShareliable").click(function (e) {
        e.preventDefault();
        var text = $('#txtShareliable').val();
        var index = $('#DrpShareliable :selected').val();
        var name = $('#DrpShareliable :selected').text();
        if (index == "0" || text == '') {
            return false;
        }
        $("#ShareliableLoading").css("display", "block");
        $('#ShareliableResult').html("");

        var Data = {};
        var jsonObject = JSON.stringify(Data);
        $.ajax({
            type: "GET",
            contentType: "application/json; charset=utf-8",
            url: "/_vti_bin/InfosysCMS/InfosysCMSService.svc/GetValues?text=" + text + "&name=" + index + "&option=ss",
            data: jsonObject,
            dataType: "json",
            processData: true,
            success: function (responseData) {
                $('#ShareliableResult').html(responseData);
                $("#ShareliableLoading").css("display", "none");
            },
            error: function (xhr, ajaxOptions, thrownError) {
                LoggingInConsole(xhr.status);
                LoggingInConsole(thrownError);
            },
        });
    });

    $("#btnDividend").click(function (e) {
        e.preventDefault();
        var text = $('#txtDividend').val();
        var index = $('#DrpDividend :selected').val();
        var name = $('#DrpDividend :selected').text();
        if (index == "0" || text == '') {
            return false;
        }
        $("#DividendLoading").css("display", "block");
        $('#DividendResult').html("");

        var Data = {};
        var jsonObject = JSON.stringify(Data);
        $.ajax({
            type: "GET",
            contentType: "application/json; charset=utf-8",
            url: "/_vti_bin/InfosysCMS/InfosysCMSService.svc/GetValues?text=" + text + "&name=" + index + "&option=d",
            data: jsonObject,
            dataType: "json",
            processData: true,
            success: function (responseData) {
                $('#DividendResult').html(responseData);
                $("#DividendLoading").css("display", "none");
            },
            error: function (xhr, ajaxOptions, thrownError) {
                LoggingInConsole(xhr.status);
                LoggingInConsole(thrownError);
            },
        });
    });

    $("#btnShare").click(function (e) {
        e.preventDefault();
        var text = $('#txtShare').val();
        var index = $('#DrpShare :selected').val();
        var name = $('#DrpShare :selected').text();
        if (index == "0" || text == '') {
            return false;
        }
        $("#ShareLoading").css("display", "block");
        $('#ShareResult').html("");

        var Data = {};
        var jsonObject = JSON.stringify(Data);
        $.ajax({
            type: "GET",
            contentType: "application/json; charset=utf-8",
            url: "/_vti_bin/InfosysCMS/InfosysCMSService.svc/GetValues?text=" + text + "&name=" + index + "&option=s",
            data: jsonObject,
            dataType: "json",
            processData: true,
            success: function (responseData) {
                $('#ShareResult').html(responseData);
                $("#ShareLoading").css("display", "none");
            },
            error: function (xhr, ajaxOptions, thrownError) {
                LoggingInConsole(xhr.status);
                LoggingInConsole(thrownError);
            },
        });
    });

    $("#btnDividendLiable").click(function (e) {
        e.preventDefault();
        var text = $('#txtDividendLiable').val();
        var index = $('#DrpDividendLiable :selected').val();
        var name = $('#DrpDividendLiable :selected').text();
        if (index == "0" || text == '') {
            return false;
        }
        $("#DividendliableLoading").css("display", "block");
        $('#DividendliableResult').html("");

        var Data = {};
        var jsonObject = JSON.stringify(Data);
        $.ajax({
            type: "GET",
            contentType: "application/json; charset=utf-8",
            url: "/_vti_bin/InfosysCMS/InfosysCMSService.svc/GetValues?text=" + text + "&name=" + index + "&option=dl",
            data: jsonObject,
            dataType: "json",
            processData: true,
            success: function (responseData) {
                $('#DividendliableResult').html(responseData);
                $("#DividendliableLoading").css("display", "none");
            },
            error: function (xhr, ajaxOptions, thrownError) {
                LoggingInConsole(xhr.status);
                LoggingInConsole(thrownError);
            },
        });
    });

    /* For showing the submenu in authoring site START*/
    $('#s4-workspace').bind('scroll', function () {
        if ($(this).scrollTop() > 100) {
            $('.infy-r-scrollToTop').fadeIn();
            $('#header-2, .infy-r-page_header_mobile').addClass('fixTop');
            $('#header-2 a').removeClass('active');
        } else {
            $('.infy-r-scrollToTop').fadeOut();
            $('#header-2, .infy-r-page_header_mobile').removeClass('fixTop');
            $('.infy-r-header_title').removeClass('highlight');
        }
    });

    /*temporary fix for the submenu with popup to hide in anonymous only START*/
    //For desktop
    //$(window).on('scroll', function () {
    //    if ($('#header-2').children().find('ul').length < 1) {
    //        $('#header-2').remove();
    //    }
    //});
    //For Mobile
    //$(window).on('scroll', function () {
    //    if ($('.infy-r-page_header_mobile').children().find('.dd_cont').length < 1) {
    //        $('.infy-r-page_header_mobile').remove();
    //    }
    //});
    /*temporary fix for the submenu with popup to hide in anonymous only END*/

    //Click event to scroll to top
    $('.infy-r-scrollToTop').on('click touchstart', function () {
        $('#s4-workspace').animate({ scrollTop: 0 }, 200);
        $('.infy-r-menuCont').slideUp();
        //return false;
    });

    /* For showing the submenu in authoring site END*/

    var _gPrevBgImage = '';

    //var currSiteUrl = $('#currentSiteUrl').val();
    var currSiteUrl = '';
    if ($('#currentSiteUrl_Desk').length > 0) {
        currSiteUrl = $('#currentSiteUrl_Desk').val();
    } else if ($('#currentSiteUrl_Mob').length > 0) {
        currSiteUrl = $('#currentSiteUrl_Mob').val();
    }
    var currPageUrl = '';
    if ($('#currentPageUrl_Desk').length > 0) {
        currPageUrl = $('#currentPageUrl_Desk').val();
    } else if ($('#currentPageUrl_Mob').length > 0) {
        currPageUrl = $('#currentPageUrl_Mob').val();
    }



    if ($('.nav-global-wrap').length) {
        var signInDesktopHTML = {};
        var jsonCookieObject = JSON.stringify(signInDesktopHTML);
        $.ajax({
            type: "GET",
            cache: false,
            contentType: "application/json; charset=utf-8",
            url: "/_vti_bin/InfosysCMS/InfosysCMSService.svc/GetSignInControlHTML?location=desktop&relativeUrl=" + currPageUrl,
            data: jsonCookieObject,
            dataType: "json",
            processData: true,
            success: function (responseData) {
                $('.nav-global-wrap').append(responseData);
            },
            error: function (xhr, ajaxOptions, thrownError) {
                LoggingInConsole(xhr.status);
                LoggingInConsole(thrownError);
            }
        });
    }


    //if ($('.pull-right').length) {
    //    var signInDesktopHTML = {};
    //    var jsonCookieObject = JSON.stringify(signInDesktopHTML);
    //    $.ajax({
    //        type: "GET",
    //        cache: false,
    //        contentType: "application/json; charset=utf-8",
    //        url: "/_vti_bin/InfosysCMS/InfosysCMSService.svc/GetLongScrollSignInControlHTML?relativeUrl=" + currPageUrl,
    //        data: jsonCookieObject,
    //        dataType: "json",
    //        processData: true,
    //        success: function (responseData) {
    //            $('#userIconDesktop').append(responseData);
    //            $('#userIconMobile').append(responseData);
    //        },
    //        error: function (xhr, ajaxOptions, thrownError) {
    //            LoggingInConsole(xhr.status);
    //            LoggingInConsole(thrownError);
    //        }
    //    });
    //}

    if ($('.nav-primary-mobile').length) {
        var signInMobileHTML = {};
        var jsonCookieObject = JSON.stringify(signInMobileHTML);
        $.ajax({
            type: "GET",
            cache: false,
            contentType: "application/json; charset=utf-8",
            url: "/_vti_bin/InfosysCMS/InfosysCMSService.svc/GetSignInControlHTML?location=mobile&relativeUrl=" + currPageUrl,
            data: jsonCookieObject,
            dataType: "json",
            processData: true,
            success: function (responseData) {
                $('.search-outer-wrapper').before(responseData);
            },
            error: function (xhr, ajaxOptions, thrownError) {
                LoggingInConsole(xhr.status);
                LoggingInConsole(thrownError);
            }
        });
    }
/*Alternate cookie disclaimer added in master page-hence commenting code*/
    /* CODE FOR SHOWING COOKIE DISCLAIMER - START */
    /*if (checkCookie('SHOW_COOKIE_DISCLAIMER') == false) {
        var currCookieRelUrl = '';
        currCookieRelUrl = _spPageContextInfo.webServerRelativeUrl;
        if (!currCookieRelUrl.endsWith("/")) {
            currCookieRelUrl = currCookieRelUrl + "/";
        }

        var relCookieUrl = "/";
        if (currCookieRelUrl.includes('/jp/')) {
            relCookieUrl = "/jp/"
        }
        else if (currCookieRelUrl.includes('/fr/')) {
            relCookieUrl = "/fr/"
        }
        else if (currCookieRelUrl.includes('/cn/')) {
            relCookieUrl = "/cn/"
        }
        else if (currCookieRelUrl.includes('/de/')) {
            relCookieUrl = "/de/"
        }
        else if (currCookieRelUrl.includes('/mx/')) {
            relCookieUrl = "/mx/"
        }

        var cookieHTML = {};
        var jsonCookieObject = JSON.stringify(cookieHTML);
        $.ajax({
            type: "GET",
            contentType: "application/json; charset=utf-8",
            url: "/_vti_bin/InfosysCMS/InfosysCMSService.svc/GetCookieHTML?webUrl=" + relCookieUrl,
            data: jsonCookieObject,
            dataType: "json",
            processData: true,
            success: function (responseData) {
		if($('.infy-r-overlay').length)
		{
                	$('.infy-r-overlay').after(responseData);
		}
		else if($('footer').length)
		{
			$('footer').after('<div class="cookie-outer"><div class="container"><div class="row"><div class="col-md-12 col-sm-12 col-xs-12"> <span>By continuing to use this website, you agree to our <a href="/privacy-statement/Pages/cookie-policy.aspx">cookie policy</a>. </span> <a href="javascript:void(0);" class="close-nav"> <i class="fa fa-times" aria-idden="true"></i></a> </div></div></div></div>');
		} 
                $.cookie("SHOW_COOKIE_DISCLAIMER", "false", { expires: 10, path: '/' });
            },
            error: function (xhr, ajaxOptions, thrownError) {
                LoggingInConsole(xhr.status);
                LoggingInConsole(thrownError);
            }
        });
    }*/
    /* CODE FOR SHOWING COOKIE DISCLAIMER - END */
    $('.text-wrap input[type=text]').keypress(function (e) {
        if (e.which == 13) {
            $('.search-container input[type=submit]').click();
        }
    });
    $('.search-form-main a.btn').click(function (e) {
        e.preventDefault();
        $(this).siblings('input[type="submit"]').click();
    });
    $('.refLinkEditPanelDiv').hide();
    $('.showHideDiv').click(function () {
        var $this = $(this);
        if (!$this.hasClass('on')) {
            $this.addClass('on').text('Hide');
            $this.parent().siblings('.refLinkEditPanelDiv').show('slow');
        }
        else {
            $this.removeClass('on').text('Show');
            $this.parent().siblings('.refLinkEditPanelDiv').hide('slow');
        }
    });
    $('#IdBgImage').attr('class', $('.bgImageClass').html());
    _gPrevBgImage = $('#IdBgImage').attr('class');
    $('.dropdown-wrap').click(function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();
    });
    $('.menu-contr').addClass('change-country-contr');

    $(window).unload(function () {
        LoggingInConsole('unloading event is called!');
    });

    var searchBtnDesktop = $('.btnSearchOmntrDesktop');
    $(".icon_search_white").click(function (event) {
        event.preventDefault();
        var txtSearchDesktop = document.getElementById('txtSearchDesktop');
        if (txtSearchDesktop != null && txtSearchDesktop != '' && txtSearchDesktop.value != null && txtSearchDesktop.value != '') {
            searchBtnDesktop.click();
        }
    });
    searchBtnDesktop.click(function (event) {
        event.stopImmediatePropagation();
    });

    $('.input_search').keypress(function (e) {
        if (e.which === 13) {
            searchBtnDesktop.click();
        }
    });



    $('.third-nav a').click(function (event) {
        event.stopImmediatePropagation();
    });
    $(".nav-primary-mobile li a[id^='mm-']").click(function (e) {
        e.preventDefault();
        if (!$(this).hasClass('on')) {
            var currentMainMenuItem = $(this).attr('id');
            currentMainMenuItem = currentMainMenuItem.substring(0, currentMainMenuItem.indexOf('_'));
            $(this).children('ul.loading').remove();
            $(this).append("<ul class='loading'><li>loading...</li></ul>");
            var abc = {};
            var jsonObject = JSON.stringify(abc);
            $.ajax({
                type: "GET",
                cache: false,
                contentType: "application/json; charset=utf-8",
                url: "/_vti_bin/InfosysCMS/InfosysCMSService.svc/GetMainMenuItems?divId=" + currentMainMenuItem + "&webUrl=" + currSiteUrl,
                data: jsonObject,
                dataType: "json",
                processData: true,
                success: function (responseData) {
                    LoadMobileMainMenuCallBack(responseData);
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    LoggingInConsole(xhr.status);
                    LoggingInConsole(thrownError);
                }
            });
        }
        else {
            $(this).toggleClass("on");
            $(this).parent().find("ul.sub-nav").toggle();
        }
    });
    function LoadMobileMainMenuCallBack(responseData) {
        LoggingInConsole('callback for mobile menu rendering');
        currentLi = $(".nav-primary-mobile li a[id='" + responseData.IDForATag + "_Mob']");
        var UlHtml = "<ul class='sub-nav'>";
        $.each(responseData.SubNavItems, function (index, element) {
            if (element.BgImgClass != 'NOREADMORE') {
                UlHtml = UlHtml + "<li><a href='" + element.Readmore + "'> <i class='icon-circle'> </i>" + element.Name + "</a></li>";
            }
            else {
                UlHtml = UlHtml + "<li><a href='#' class='nolink'><i class='icon-plus'></i> <i class='icon-minus'></i>" + element.Name + "</a>" + element.MobDescription + "        </li>"
            }
        });
        UlHtml = UlHtml + "</ul>";
        $(currentLi).children('ul.loading').remove();
        $(currentLi).children('ul.sub-nav').remove();
        $(currentLi).append(UlHtml);
        currentLi.toggleClass("on");
        currentLi.parent().find("ul.sub-nav").toggle()
        $(currentLi).find('ul.deep-nav').hide();
        $('.sub-nav li a.nolink').click(function (e) {
            e.preventDefault();
            e.stopPropagation();
            $(this).parent().toggleClass('on');
            $(this).toggleClass('on');
            $(this).parent().find("ul.deep-nav").toggle();
        });
        $('.sub-nav li a').click(function (e) {
            e.stopPropagation();
        });
        $('.deep-nav a').click(function (e) {
            e.stopPropagation();
        });
    }
    function LoggingInConsole(message) {
        if (typeof console != "undefined") {
            console.log(message);
        }
    }
    function SubMenuDropDownHandler(event) {
        if ($('.NOMENUSCRIPT').length > 0) {
            return;
        }
        event.preventDefault();
        if (!$(this).parent().hasClass('current')) {
            $this = $(this);
            $(this).parent().siblings().removeClass('current');
            $(this).parent().addClass('current');
            $('.menu-contr').slideDown(600);
            $('.menu-overlay').show();
            $('.menu-overlay .row').html('&nbsp;&nbsp;loading...');
            $('#IdBgImage').attr('class', 'menu-background');
            $('.spotlight').hide();
            $('.leadstory').hide();
            $('.video-home-spotlight,.bg-slide-wrapper').attr('style', 'display:none!important');
            $('.footer-widget-wrapper-outer').hide();
            $('.content-wrapper').hide();
            $('.search-container').hide();
            $('footer').hide();
            var currentMainMenuItem = $(this).attr('ID');
            currentMainMenuItem = currentMainMenuItem.substring(0, currentMainMenuItem.indexOf('_'));
            var abc = {};
            var jsonObject = JSON.stringify(abc);
            $.ajax({
                type: "GET",
                cache: false,
                contentType: "application/json; charset=utf-8",
                url: "/_vti_bin/InfosysCMS/InfosysCMSService.svc/GetMainMenuItems?divId=" + currentMainMenuItem + "&webUrl=" + currSiteUrl,
                data: jsonObject,
                dataType: "json",
                processData: true,
                success: function (responseData) {
                    LoggingInConsole('success ajax call for tab click.');
                    MainMenuDropDownRendering($this, responseData);
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    LoggingInConsole(xhr.status);
                    LoggingInConsole(thrownError);
                }
            });
        }
        else {
            $(this).parent().siblings().removeClass('current');
            $(this).parent().removeClass('current');
            $('#IdBgImage').attr('class', _gPrevBgImage);
            $('.menu-contr').slideUp(100)
            $('.spotlight').show();
            $('.leadstory').show();
            $('.video-home-spotlight,.bg-slide-wrapper').removeAttr('style', 'display:none!important');
            $('.footer-widget-wrapper-outer').show();
            $('.content-wrapper').show();
            $('.search-container').show();
            $('footer').show();
        }
    }
    $('.nav-primary li a').on('click', SubMenuDropDownHandler);
    $('.mobile .nav-main-tablet li a').on('click', function (event) {
        event.preventDefault();
    });
    function MainMenuDropDownRendering(currentControl, data) {
        $this = currentControl;
        var $DataDiv = $('.menu-overlay .row');
        $DataDiv.empty();
        var temp = '';
        $.each(data.SubNavItems, function (index, element) {
            temp = temp + element.DeskDescription;
        });
        $DataDiv.html(temp);
    }
    $('a#language-country').on('click', function (event) {
        event.preventDefault();
        var $this = $(this);
        var inputData = $this.attr("name").replace("#", ";");
        $('.nav-primary li').removeClass('current');
        if (!$(this).hasClass('locDropOpen')) {
            $('.menu-contr').slideDown(600);
            $('.menu-overlay').show();
            $('.menu-overlay .row').html('&nbsp;&nbsp; loading...');
            $('#IdBgImage').attr('class', 'menu-background');
            $('.spotlight').hide();
            $('.leadstory').hide();
            $('.video-home-spotlight,.bg-slide-wrapper').attr('style', 'display:none!important');
            $('.footer-widget-wrapper-outer').hide();
            $('.content-wrapper').hide();
            $('.search-container').hide();
            $('footer').hide();
            var abc = {};
            var jsonObject = JSON.stringify(abc);
            $.ajax({
                type: "GET",
                cache: false,
                contentType: "application/json; charset=utf-8",
                url: "/_vti_bin/InfosysCMS/InfosysCMSService.svc/GetGlobalNavMenu?subsidiaryFilter=" + inputData,
                data: jsonObject,
                dataType: "json",
                processData: true,
                success: function (responseData) {
                    LangCountryHandler(responseData, $this);
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    LoggingInConsole(xhr.status);
                    LoggingInConsole(thrownError);
                }
            });
        }
        else {
            $(this).parent().siblings().removeClass('current');
            $(this).parent().removeClass('current');
            $('#IdBgImage').attr('class', _gPrevBgImage);
            $('.menu-contr').slideUp(100)
            $('.spotlight').show();
            $('.leadstory').show();
            $('.video-home-spotlight,.bg-slide-wrapper').removeAttr('style', 'display:none!important');
            $('.footer-widget-wrapper-outer').show();
            $('.content-wrapper').show();
            $('.search-container').show();
            $('footer').show();
        }
    });
    function LangCountryHandler(data, $this) {
        var $DataDiv = $('.menu-overlay .row');
        $DataDiv.empty();
        if ($('#language-country').attr('name').indexOf('#') != -1) {
            var temp = '';
            temp = temp + "<div class='col-md-6'><div class='row'><div class='col-md-12'><ul class='change-country'>";
            $.each(data, function (index, element) {
                temp = temp + "<li><a href='" + element.RegionLink + "'>" + element.Region + "</a>";
            });
            temp = temp + "</ul></div></div></div>";
        }
        else {
            var temp = '';
            var count = data.length;
            $.each(data, function (index, element) {
                if (index == count - 1) {
                    temp = temp + "<div class='col-md-3'>";
                    temp = temp + "<h3>" + element.Region + "</h3>" + "<div class='row'><div class='col-md-12'><ul class='change-country'>";
                    $.each(element.Countries, function (i, c) {
                        temp = temp + "<li>" + c.Title + c.HtmlForUrl + "</li>";
                    })
                    temp = temp + "</ul></div></div></div>";
                }
                else {
                    if (element.Countries.length > 8) {
                        temp = temp + "<div class='col-md-5'>";
                        temp = temp + "<h3>" + element.Region + "</h3>" + "<div class='row'>";
                        var groups = new Array();
                        var temp2 = '';
                        $.each(element.Countries, function (i, c) {
                            temp2 = temp2 + "<li>" + c.Title + c.HtmlForUrl + "</li>";
                            if (i == 8 || i == (element.Countries.length - 1)) {
                                groups.push(temp2);
                                temp2 = '';
                            }
                        });
                        var format = "<div class='col-md-6'><ul class='change-country'>###</ul></div>";
                        $.each(groups, function (i, v) {
                            temp = temp + format.replace('###', v);
                        })
                        temp += "</div></div>";
                    }
                    else {
                        temp = temp + "<div class='col-md-2'>";
                        temp = temp + "<h3>" + element.Region + "</h3>" + "<div class='row'><div class='col-md-12'><ul class='change-country'>";
                        $.each(element.Countries, function (i, c) {
                            temp = temp + "<li>" + c.Title + c.HtmlForUrl + "</li>";
                        })
                        temp = temp + "</ul></div></div></div>";
                    }
                }
            });
        }
        $DataDiv.html(temp);
    }
    $('a.close-nav,body').click(function (event) {
        if ($('.menu-contr').is(':visible')) {
            var mainMenuLinks = $('.nav-primary li a');
            mainMenuLinks.parent().removeClass('current');
            $('.menu-contr').hide();
            $('#IdBgImage').attr('class', _gPrevBgImage);
            $('.spotlight').show();
            $('.leadstory').show();
            $('.video-home-spotlight,.bg-slide-wrapper').removeAttr('style', 'display:none!important');
            $('.footer-widget-wrapper-outer').show();
            $('.content-wrapper').show();
            $('.search-container').show();
            $('footer').show();
        }
    });
    $('.menu-overlay,.nav-primary-outer,a#language-country').click(function (e) {
        e.stopPropagation();
    });
    $('.sm-sub-menus-gotop').mouseenter(function () {
        $(".sm-sub-menus-data-holder").animate({ scrollTop: 0 }, 2000);
    }).mouseleave(function () {
        $(".sm-sub-menus-data-holder").stop();
    });
    $('.sm-sub-menus-gobot').mouseenter(function () {
        $(".sm-sub-menus-data-holder").animate({ scrollTop: $(".sm-sub-menus-data")[0].scrollHeight }, 10000);
    }).mouseleave(function () {
        ;
        $(".sm-sub-menus-data-holder").stop();
    });
})

function checkCookie(cookieName) {
    var cookies = document.cookie;
    var cookieArray = cookies.split(";");
    for (var i = 0; i < cookieArray.length; i++) {
        var name = cookieArray[i].split('=')[0];
        if (cookieName == name.trim()) {
            return true;
        }
    }
    return false;
}

function get_checkboxes() {
    var node_list = document.getElementsByTagName('input');
    var checkboxes = [];
    for (var i = 0; i < node_list.length; i++) {
        var node = node_list[i];
        if (node.getAttribute('type') == 'checkbox') {
            checkboxes.push(node);
        }
    }
    return checkboxes;
}
function ShowDate() {
    var showDate = 'no';
    return showDate;
}
function sortByDate() {
    sortingtext();
    var str = ",\"o\":[{\"d\":1,\"p\":\"Write\"}]";
    var arrValue = [];
    var newCompleteURL = location.href;
    if (newCompleteURL.indexOf("(InfyPath") > -1 || newCompleteURL.indexOf("(INFOSYSDOCUMENTTYPE") > -1 || newCompleteURL.indexOf("(FileExtension") > -1) {
        arrValue = "Advanced";
    }
    if (newCompleteURL.indexOf("#q=") > -1) {
        var q = newCompleteURL.split("#q=")[1];
    }
    if (q.indexOf("#s=") > -1) {
        q = q.split("#s=")[0];
    }
    if (q.indexOf("#k=") > -1) {
        q = q.split("#k=")[0];
    }
    var keyword = q;
    keyword = keyword.replace(/"/g, "\\\"");
    keyword = keyword.replace(/%22/g, "\\\"");
    var fileCheck = location.href;
    var fileTypeIndexInJS = fileCheck.indexOf("#ft=");
    var checkBoxIndexInJS = fileCheck.indexOf("#cb=");
    var queryInJS = fileCheck.indexOf("#q=");
    if (fileTypeIndexInJS > -1 || checkBoxIndexInJS > -1) {

        var filetypevalueJS = fileCheck.substring(fileTypeIndexInJS, checkBoxIndexInJS);
        filetypevalueJS = filetypevalueJS.split("#ft=")[1];
        var checkValueJS = fileCheck.substring(checkBoxIndexInJS, queryInJS);
        checkValueJS = checkValueJS.split("#cb=")[1];
    }
    var splitURL = document.URL.split("#")[0];
    if (arrValue != "") {
        var completeURL = location.href;
        var prefixURL = completeURL.split("#")[0];
        var pathIndex = completeURL.indexOf("(InfyPath");
        var documentTypeIndex = completeURL.indexOf("(INFOSYSDOCUMENTTYPE");
        var pathEndIndex = completeURL.indexOf(")");
        var fileExtensionIndex = completeURL.indexOf("(FileExtension");
        var PathURL = "";
        var postFixURL = "";
        if (pathIndex > -1) {
            PathURL = completeURL.substring(pathIndex, pathEndIndex);
            PathURL = unescape(PathURL);
            PathURL = decodeURIComponent(PathURL);
            if (PathURL.indexOf("\\\"") > -1) {
            }
            else {
                var regex = new RegExp('\"', 'g');
                PathURL = PathURL.replace(regex, '\\\"');
            }
            prefixURL = prefixURL + "#Default={\"k\":\"" + keyword + " AND " + PathURL + ")";
        }
        if (documentTypeIndex > -1) {
            PathURL = completeURL.substring(documentTypeIndex, pathEndIndex);
            PathURL = unescape(PathURL);
            PathURL = decodeURIComponent(PathURL);
            if (PathURL.indexOf("\\\"") > -1) {
            }
            else {
                var regex = new RegExp('\"', 'g');
                PathURL = PathURL.replace(regex, '\\\"');
            }
            prefixURL = prefixURL + "#Default={\"k\":\"" + keyword + " AND " + PathURL + ")";
        }
        if (fileExtensionIndex > -1) {
            var lastIndexOfPath = completeURL.lastIndexOf(")");
            fileURL = completeURL.substring(fileExtensionIndex, lastIndexOfPath);
            fileURL = unescape(fileURL);
            fileURL = decodeURIComponent(fileURL);
            if (PathURL != "") {
                prefixURL = prefixURL + " AND " + fileURL + ")";
            }
            else {
                prefixURL = prefixURL + "#Default={\"k\":\"" + keyword + " AND " + fileURL + ")";
            }
        }
        prefixURL = prefixURL + "\"" + str + "}";
        window.location.href = prefixURL + "#ft=" + filetypevalueJS + "#cb=" + checkValueJS + "#q=" + q;
    }
    else {
        splitURL = splitURL + "#Default={\"k\":\"" + keyword + "\"" + str + "}";
        window.location.href = splitURL + "#ft=" + filetypevalueJS + "#cb=" + checkValueJS + "#q=" + q;
    }
}
function sortByRelevance(id) {
    sortingtext();
    var str = "";
    var arrValue = [];
    var newCompleteURL = location.href;
    if (newCompleteURL.indexOf("(InfyPath") > -1 || newCompleteURL.indexOf("(INFOSYSDOCUMENTTYPE") > -1 || newCompleteURL.indexOf("(FileExtension") > -1) {
        arrValue = "Advanced";
    }
    if (newCompleteURL.indexOf("#q=") > -1) {
        var q = newCompleteURL.split("#q=")[1];
    }
    if (q.indexOf("#s=") > -1) {
        q = q.split("#s=")[0];
    }
    if (q.indexOf("#k=") > -1) {
        q = q.split("#k=")[0];
    }
    var keyword = q;
    keyword = keyword.replace(/"/g, "\\\"");
    keyword = keyword.replace(/%22/g, "\\\"");
    var fileCheck = location.href;
    var fileTypeIndexInJS = fileCheck.indexOf("#ft=");
    var checkBoxIndexInJS = fileCheck.indexOf("#cb=");
    var queryInJS = fileCheck.indexOf("#q=");
    if (fileTypeIndexInJS > -1 || checkBoxIndexInJS > -1) {
        var filetypevalueJS = fileCheck.substring(fileTypeIndexInJS, checkBoxIndexInJS);
        filetypevalueJS = filetypevalueJS.split("#ft=")[1];
        var checkValueJS = fileCheck.substring(checkBoxIndexInJS, queryInJS);
        checkValueJS = checkValueJS.split("#cb=")[1];
    }
    var splitURL = document.URL.split("#")[0];
    if (arrValue != "") {
        var completeURL = location.href;
        var prefixURL = completeURL.split("#")[0];
        var pathIndex = completeURL.indexOf("(InfyPath");
        var documentTypeIndex = completeURL.indexOf("(INFOSYSDOCUMENTTYPE");
        var pathEndIndex = completeURL.indexOf(")");
        var fileExtensionIndex = completeURL.indexOf("(FileExtension");
        var PathURL = "";
        var postFixURL = "";
        if (pathIndex > -1) {
            PathURL = completeURL.substring(pathIndex, pathEndIndex);
            PathURL = unescape(PathURL);
            PathURL = decodeURIComponent(PathURL);
            if (PathURL.indexOf("\\\"") > -1) {
            }
            else {
                var regex = new RegExp('\"', 'g');
                PathURL = PathURL.replace(regex, '\\\"');
            }
            prefixURL = prefixURL + "#Default={\"k\":\"" + keyword + " AND " + PathURL + ")";
        }
        if (documentTypeIndex > -1) {
            PathURL = completeURL.substring(documentTypeIndex, pathEndIndex);
            PathURL = unescape(PathURL);
            PathURL = decodeURIComponent(PathURL);
            if (PathURL.indexOf("\\\"") > -1) {
            }
            else {
                var regex = new RegExp('\"', 'g');
                PathURL = PathURL.replace(regex, '\\\"');
            }
            prefixURL = prefixURL + "#Default={\"k\":\"" + keyword + " AND " + PathURL + ")";
        }
        if (fileExtensionIndex > -1) {
            var lastIndexOfPath = completeURL.lastIndexOf(")");
            fileURL = completeURL.substring(fileExtensionIndex, lastIndexOfPath);
            fileURL = unescape(fileURL);
            fileURL = decodeURIComponent(fileURL);
            if (PathURL != "") {
                prefixURL = prefixURL + " AND " + fileURL + ")";
            }
            else {
                prefixURL = prefixURL + "#Default={\"k\":\"" + keyword + " AND " + fileURL + ")";
            }
        }
        prefixURL = prefixURL + "\"" + str + "}";
        window.location.href = prefixURL + "#ft=" + filetypevalueJS + "#cb=" + checkValueJS + "#q=" + q;
    }
    else {
        splitURL = splitURL + "#Default={\"k\":\"" + keyword + "\"" + str + "}";
        window.location.href = splitURL + "#ft=" + filetypevalueJS + "#cb=" + checkValueJS + "#q=" + q;
    }
}
function sortingtext() {
    var sortingUrl = document.URL;
    if (sortingUrl.indexOf("Write") > -1) {
        document.getElementById('sortByRelevance').innerHTML = 'Sort By Relevance |';
        document.getElementById('sortByDate').innerHTML = 'Sorted By Date';
    }
    else {
        document.getElementById('sortByRelevance').innerHTML = 'Sorted By Relevance |';
        document.getElementById('sortByDate').innerHTML = 'Sort By Date';
    }
}


/* Addded for seacrh START*/

$(document).on('click', '.infy-r-search_icon', function () {
    var txtValue = $(this).closest('.search_cont').children('#scc_search_hbx_txt').val();
    SearchBtnClick(txtValue);
});

$(document).on('keypress', '#scc_search_hbx_txt', function (e) {
    if (e.which == '13') {
        var txtValue = $(this).val();
        SearchBtnClick(txtValue);
        e.preventDefault();
    }
});
/* Added for search END*/

/* Added search for infosys foundation START*/

$('.gssmiccustom').hide();
$('.speaker_icon').hide();
$(document).on('click', '.scc_search_home_btn', function () {
    var txtValueIF = $('#scc_search_hbx_txt').val();
    SearchBtnClick(txtValueIF);
});

$(document).on('keypress', '#scc_search_hbx_txt', function (e) {
    
    if (e.which == '13') {
        var txtValueIF = $('#scc_search_hbx_txt').val();       
        SearchBtnClick(txtValueIF);
        e.preventDefault();
    }
});

/*Added search for infosys foundation END*/

function SearchBtnClick(txtSearchString) {    
    if (txtSearchString != null && txtSearchString != '') {
        var res = $("#scc_inGssHomeSbOnly").attr("resultUrl");
        var base_url = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
        var resulturl = base_url + '/' + res;
        window.location.href = resulturl + "?k=" + txtSearchString;
    }
    else {
        return false;
    }
}

//Adobe DTM Datalayer
function AdobeSearchKey(searchKey, resultsCount) {
    var DTM_search_keyword = searchKey;
    var DTM_pageurl = window.location.pathname;
    DTM_pageurl = DTM_pageurl.toLowerCase();
    var DTM_pageURLs = DTM_pageurl.split("pages/");
    var DTM_Sections = DTM_pageURLs[0].split("/");
    var DTM_channel = "";
    var DTM_subSection2 = "";
    var DTM_subSection3 = "";
    if (DTM_Sections.length > 2) {
        DTM_channel = DTM_Sections[1];
        DTM_subSection2 = DTM_Sections[2];
        if (DTM_Sections.length > 3) {
            var DTM_subSection3 = DTM_Sections[3];

            for (i = 4; i < DTM_Sections.length - 1; i++) {
                DTM_subSection3 = DTM_subSection3 + " " + DTM_Sections[i];
            }
        }
    } else {
        DTM_channel = "Home Page";
    }
    if (resultsCount != 0) {
        digitalData = {
            search: {
                'internalSearchKeywords': DTM_search_keyword,
                'numberOfResults': resultsCount
            },
            page: {
            'pageName': document.title,
            'channel': DTM_channel,
            'subSection2': DTM_subSection2,
            'subSection3': DTM_subSection3
        }
        };
    }
    else {
        digitalData = {
            search: {
                'internalSearchKeywords': DTM_search_keyword,
                'numberOfResults': resultsCount,
                'noResultFound': 'Yes'
            },
            page: {
                'pageName': document.title,
                'channel': DTM_channel,
                'subSection2': DTM_subSection2,
                'subSection3': DTM_subSection3
            }
        };
    }
}








//Adobe DTM Datalayer END





function SearchUserControlClick(SearchSiteResultPageUrl) {

    var txtSearchDesktop = document.getElementById('txtSearchDesktop');

    if (txtSearchDesktop != null && txtSearchDesktop != '' && txtSearchDesktop.value != null && txtSearchDesktop.value != '') {

        var searchKeywordForDesktop = txtSearchDesktop.value;
        window.location = SearchSiteResultPageUrl + "#k=" + searchKeywordForDesktop + "#ft=#cb=#q=" + searchKeywordForDesktop;
        event.returnValue = false;

    }
    else {

        return false;
    }
}
function AdvancedSearchClick(searchlanguagePathUrl) {
    var retainSelected = '';
    if (document.getElementById('txtSearch').value != null && document.getElementById('txtSearch').value != '') {
        var searchKeywordAdvancedSearch = document.getElementById('txtSearch').value;
        var ddlFileFormat = document.getElementById('ddlFileFormat');
        var dropDownSelectedValueForJS = '';
        if (ddlFileFormat == null || ddlFileFormat == '' || ddlFileFormat == 'undefined') {

        }
        else {
            dropDownSelectedValueForJS = ddlFileFormat.options[ddlFileFormat.selectedIndex].value;
        }
        var checkboxesCollection = [];
        checkboxesCollection = get_checkboxes();
        var URLNavigateAdvanced = '';
        var flag = 0;
        if (checkboxesCollection.length > 0 || dropDownSelectedValueForJS.length > 0) {
            URLNavigateAdvanced = ' AND (';
            for (var iLoopIndex = 0; iLoopIndex < checkboxesCollection.length; iLoopIndex++) {

                if (checkboxesCollection[iLoopIndex].checked == 1) {
                    flag = 1;
                    if (checkboxesCollection[iLoopIndex].id != null || checkboxesCollection[iLoopIndex].id != '') {
                        var tempID = checkboxesCollection[iLoopIndex].id;
                        var indexOfColon = tempID.indexOf(':');
                        var indexOfOr = tempID.indexOf('|');
                        if (indexOfColon > -1) {
                            if (indexOfOr > -1) {
                                tempID = tempID.substring(0, indexOfColon + 1) + "\"" + tempID.substring(indexOfColon + 1, indexOfOr) + "\"" + "|" + tempID.substring(indexOfOr + 1, tempID.length);
                            }
                            //else {
                            //    tempID = tempID.substring(0, indexOfColon + 1) + "\"" + tempID.substring(indexOfColon + 1, tempID.length - 1) + "\"" + "|";
                            //}
                        }
                        var temp = tempID.split("|");
                        if (temp.length > 0) {
                            if (temp[0].length > 0) {
                                if (URLNavigateAdvanced.indexOf("(InfyPath:") > -1 || URLNavigateAdvanced.indexOf("(INFOSYSDOCUMENTTYPE=") > -1) {
                                    URLNavigateAdvanced = URLNavigateAdvanced + " OR " + temp[0];
                                    retainSelected = retainSelected + iLoopIndex + "~";
                                }
                                else {
                                    URLNavigateAdvanced = URLNavigateAdvanced + temp[0];
                                    retainSelected = retainSelected + iLoopIndex + "~";
                                }
                            }
                            if (temp[1].length > 0) {
                                var a = temp[1].split("=")[1];
                                a = temp[1].split("=")[0] + '="' + a + '"';
                                if (URLNavigateAdvanced.indexOf("(InfyPath:") > -1 || URLNavigateAdvanced.indexOf("(INFOSYSDOCUMENTTYPE=") > -1) {
                                    URLNavigateAdvanced = URLNavigateAdvanced + " OR " + a;
                                    retainSelected = retainSelected + iLoopIndex + "~";
                                }
                                else {
                                    URLNavigateAdvanced = URLNavigateAdvanced + a;
                                    retainSelected = retainSelected + iLoopIndex + "~";
                                }
                            }
                        }
                    }
                }
            }
            URLNavigateAdvanced = URLNavigateAdvanced + ')';
            if (flag != 1) {
                URLNavigateAdvanced = '';
            }
            if (dropDownSelectedValueForJS == "doc") {
                RedirectURL = searchlanguagePathUrl + "#k=" + searchKeywordAdvancedSearch + URLNavigateAdvanced + ' AND (FileExtension=docx OR FileExtension=doc)' + "#ft=doc" + "#cb=" + retainSelected + "#q=" + searchKeywordAdvancedSearch;
                window.location.href = RedirectURL;
                return false;
            }
            else if (dropDownSelectedValueForJS == "pdf") {
                RedirectURL = searchlanguagePathUrl + "#k=" + searchKeywordAdvancedSearch + URLNavigateAdvanced + ' AND (FileExtension=pdf)' + "#ft=pdf" + "#cb=" + retainSelected + "#q=" + searchKeywordAdvancedSearch;
                window.location.href = RedirectURL;
                return false;
            }
            else if (dropDownSelectedValueForJS == "xls") {
                RedirectURL = searchlanguagePathUrl + "#k=" + searchKeywordAdvancedSearch + URLNavigateAdvanced + ' AND (FileExtension=xlsx OR FileExtension=xls)' + "#ft=xls" + "#cb=" + retainSelected + "#q=" + searchKeywordAdvancedSearch;
                window.location.href = RedirectURL;
                return false;
            }
            else if (dropDownSelectedValueForJS == "ppt") {
                RedirectURL = searchlanguagePathUrl + "#k=" + searchKeywordAdvancedSearch + URLNavigateAdvanced + ' AND (FileExtension=ppt OR FileExtension=pptx)' + "#ft=ppt" + "#cb=" + retainSelected + "#q=" + searchKeywordAdvancedSearch;
                window.location.href = RedirectURL;
                return false;
            }
            else {
                RedirectURL = searchlanguagePathUrl + "#k=" + searchKeywordAdvancedSearch + URLNavigateAdvanced + "#ft=" + "#cb=" + retainSelected + "#q=" + searchKeywordAdvancedSearch;
                window.location.href = RedirectURL;
                if (URLNavigateAdvanced == '') {
                    var advancedWarpperForJS = document.getElementById('advancedWrapper');
                    advancedWarpperForJS.style.display = 'none';
                }
                return false;
            }
        }
        else {
            var RedirectURL = searchlanguagePathUrl + "#k=" + searchKeywordAdvancedSearch + "#ft=" + "#cb=" + retainSelected + "#q=" + searchKeywordAdvancedSearch;
            window.location.href = RedirectURL;
            return false;
        }
    }
    else {
        return false;
    }
}

function ToggleAuthRegion(a, divClass) {
    $("." + divClass).slideToggle('slow', function () {
        if ($(this).is(':visible')) {
            a.innerHTML = "Hide Fields";
            a.className = "sparsh-collapse";
        } else {
            a.innerHTML = "Show Fields";
            a.className = "sparsh-expand";
        }
    });
}