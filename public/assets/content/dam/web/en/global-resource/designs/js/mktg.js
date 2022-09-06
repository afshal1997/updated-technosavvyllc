$(function () {
	if (document.getElementById('galler') != null)
		$(".gallery a[rel^='prettyPhoto']").prettyPhoto();
	var currSiteUrl = $('#currentSiteUrl').val();
	if (document.getElementById('inner-page-slider') != null) {
		$('#inner-page-slider').after('<div id="inner-page-slider-pager">').cycle({
			fx: 'scrollHorz',
			speed: 400,
			pause: 1,
			timeout: 4500,
			next: '#inner-page-slider-next',
			prev: '#inner-page-slider-prev',
			pager: '#inner-page-slider-pager',
			pagerAnchorBuilder: function (idx, slide) {
				return '<a href="#">&nbsp;</a>';
			}
		});
	}


});

//changed the path to '/content/dam/.*' at required places -- :)

function vplayercall(istreamfile, wid, hei, contid, startmode) {
	jwplayer(contid).setup({
		'autostart': startmode,
		'flashplayer': '/content/dam/infosys-web/en/audio/vplayer.swf',
		'playlistfile': '/content/dam/infosys-web/en/video/vplayer/' + istreamfile + '.xml',
		'backcolor': '000000',
		'frontcolor': 'EEEEEE',
		'lightcolor': '66FFFF',
		'width': wid,
		'height': hei,
        'mute': 'true',
//		'logo.file': '/content/dam/infosys-web/en/global-resource/images/' +  logoimagename,       commented
//		'logo.position': 'top-left',															commented   	
		'author': 'Infosys Limited',
		'abouttext': 'Infosys Limited',
		'aboutlink': 'http://www.infosys.com',
//		'skin': '/richmedia/players/vskin/infosys.zip',        									commented
		'controlbar.position': 'over',
		'plugins': {
			'/content/dam/infosys-web/en/audio/viral-2h.swf': {
				onpause: 'false',
				oncomplete: 'false',
				allowmenu: 'false',
				functions: 'embed'
			}
		}
	});
}

function vplayercallFill(istreamfile, preimage, wid, hei, contid, startmode) {

	jwplayer(contid).setup({
		'autostart': startmode,
		'flashplayer': '/richmedia/players/vplayer.swf',
		'playlistfile': '/Videos/vplayer/' + istreamfile + '.xml',
		'backcolor': '000000',
		'frontcolor': 'EEEEEE',
		'lightcolor': '66FFFF',
		'width': '100%',
		'height': hei - 10,
		'logo.file': '/SiteCollectionImages/infosys-logo.png',
		'logo.position': 'top-left',
		'author': 'Infosys Limited',
		'abouttext': 'Infosys Limited',
		'aboutlink': 'http://www.infosys.com',
		'skin': '/richmedia/players/vskin/infosys.zip',
		'stretching': 'fill',
		'controlbar.position': 'over',
		'plugins': {
			'/richmedia/players/viral-2h.swf': {
				onpause: 'false',
				oncomplete: 'false',
				allowmenu: 'false',
				functions: 'embed'
			}
		}
	});
}

function vplayercallhei(istreamfile, preimage, wid, hei, contid, startmode) {
	jwplayer(contid).setup({
		'autostart': startmode,
		'flashplayer': '/richmedia/players/vplayer.swf',
		'playlistfile': '/Videos/vplayer/' + istreamfile + '.xml',
		'backcolor': '000000',
		'frontcolor': 'EEEEEE',
		'lightcolor': '66FFFF',
		'width': '100%',
		'logo.file': '/SiteCollectionImages/infosys-logo.png',
		'logo.position': 'top-left',
		'author': 'Infosys Limited',
		'abouttext': 'Infosys Limited',
		'aboutlink': 'http://www.infosys.com',
		'skin': '/richmedia/players/vskin/infosys.zip',
		'stretching': 'fill',
		'controlbar.position': 'over',
		'plugins': {
			'/richmedia/players/viral-2h.swf': {
				onpause: 'false',
				oncomplete: 'false',
				allowmenu: 'false',
				functions: 'embed'
			}
		}
	});
}

function vplayercAudio(istreamfile, wid, contid, startmode) {
	var screenWidth = $(window).width();
	var playerhei = "55";
	if (screenWidth > 1024) {
		playerhei = "22";
	}
	jwplayer(contid).setup({

		'autostart': startmode,
		'flashplayer': '/content/dam/infosys-web/en/audio/vplayer.swf',
		'playlistfile': '/content/dam/infosys-web/en/audio/vplayer/' + istreamfile + '.xml',
		'backcolor': '000000',
		'frontcolor': 'EEEEEE',
		'lightcolor': '66FFFF',
		'controlbar': 'bottom',
 //       'mute': 'false',
		'width': wid,
		'height': playerhei,
		'author': 'Infosys Limited',
		'abouttext': 'Infosys Limited',
		'aboutlink': 'http://www.infosys.com',
		'plugins': {
			'/content/dam/infosys-web/en/audio/viral-2h.swf': {
				onpause: 'false',
				oncomplete: 'false',
				allowmenu: 'false',
				functions: 'embed'
			}

		}
	});
}