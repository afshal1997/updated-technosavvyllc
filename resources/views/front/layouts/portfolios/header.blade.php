<body class="portfolio-body portfolio-main">
	<div id="preloader"><img src="./assets/images/loader/techno-savvy-Loading.gif" /></div>
	<div id="container" class="portfolio-page-tn">
		<header>
			<div class="logo-box">
				<div class="logo-box-in">
					<a class="logo" href="https://technosavvyllc.com/">
						<img alt="/Techno Savvy/" src="./assets/images/home/logo.svg">
					</a>
					<p class="slogan">
						Accomplishing countless US government affiliated and high-profile business projects, we take delight in presenting our magnificent profile to our clients!
					</p>
				</div>
			</div>

			<div class="menu-box">
				<ul class="tab-links-ntn">

					<li>
						<a class="tab-link-ntn 
					        <?php
							if ($port_page == 'portfolios' || $port_page == 'digital-marketing-portfolio') {
								echo 'active';
							}
							?>" href="javascript:void(0)" data-id="tab-ntn-1">
							Digital Marketing
						</a>
					</li>
					<li>
						<a class="tab-link-ntn <?php if ($port_page == 'web-development-portfolio') {
													echo 'active';
												} ?>" href="javascript:void(0)" data-id="tab-ntn-2">Web Development</a>
					</li>
					<li>
						<a class="tab-link-ntn <?php if ($port_page == 'app-development-portfolio') {
													echo 'active';
												} ?>" href="javascript:void(0)" data-id="tab-ntn-3">App Development</a>
					</li>
					<li>
						<a class="tab-link-ntn <?php if ($port_page == 'brand-creative-portfolio') {
													echo 'active';
												} ?>" href="javascript:void(0)" data-id="tab-ntn-4">Brand And Creative</a>
					</li>
				</ul>
			</div>
			<div class="social-box">
				<ul class="social-icons">
					<li><a href="https://www.facebook.com/TechnoSavvyllc"><i class="fa fa-facebook"></i></a></li>
					<li><a href="https://www.instagram.com/technosavvyllc"><i class="fa fa-instagram"></i></a></li>
				</ul>
			</div>
		</header>