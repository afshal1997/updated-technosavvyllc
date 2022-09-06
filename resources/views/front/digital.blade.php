@extends('front.layouts.digital.app')
@section('title') Home @endsection
@section('content')

<section class="associate-logo">
    <div class="container">
        <div class="row d-flex">
            <div class="col-lg-4 col-md-4 associate-with-title">
                <h2>associated with </h2>
            </div>
            <div class="col-lg-8 col-md-8 associate-with-slides">
                <div class="associate-with-img">
                    <img src="./assets/images/home/bing.png" alt="assets/images/home/bing" />
                </div>
                <div class="associate-with-img">
                    <img src="./assets/images/home/goodfirm.png" alt="assets/images/home/goodfirm" />
                </div>
                <div class="associate-with-img">
                    <img src="./assets/images/home/google-partner.png" alt="images/home/google-partner" />
                </div>
                <div class="associate-with-img">
                    <img src="./assets/images/home/clutch.png" alt="assets/images/home/clutch" />
                </div>
            </div>
        </div>
    </div>
</section>

<section class="services-tn">
    <div class="container">
        <div class="row">
            <div class="col-lg-12 gen-title">
                <h4>What we offer?</h4>
                <h2>Our Services</h2>
            </div>
        </div>
        <div class="row d-flex">
            <div class="col-lg-4 col-md-4 col-sm-6 col-12 service-card">
                <div class="card mb-3">
                    <div class="card-img-tn">
                        <img class="card-img-top" src="landing/img/branding.png" alt="Design Service">
                    </div>
                    <div class="card-body">
                        <h5 class="card-title">Design Service</h5>
                        <p class="card-text">We ensure that our designs speak your business objective through visual sight!</p>
                    </div>
                </div>
            </div>
            <div class="col-lg-4 col-md-4 col-sm-6 col-12 service-card">
                <div class="card mb-3">
                    <div class="card-img-tn">
                        <img class="card-img-top" src="landing/img/web.png" alt="Web Development">
                    </div>
                    <div class="card-body">
                        <h5 class="card-title">Web Development</h5>
                        <p class="card-text">Web development is our centrally highlighted service and we are good at it!</p>
                    </div>
                </div>
            </div>
            <div class="col-lg-4 col-md-4 col-sm-6 col-12 service-card">
                <div class="card mb-3">
                    <div class="card-img-tn">
                        <img class="card-img-top" src="landing/img/app.png" alt="App Development">
                    </div>
                    <div class="card-body">
                        <h5 class="card-title">App Development</h5>
                        <p class="card-text">Bringing your business on easy--to-use applications is the right and wise choice!</p>
                    </div>
                </div>
            </div>
            <div class="col-lg-4 col-md-4 col-sm-6 col-12 service-card">
                <div class="card mb-3">
                    <div class="card-img-tn">
                        <img class="card-img-top" src="landing/img/animate.png" alt="Video Animation">
                    </div>
                    <div class="card-body">
                        <h5 class="card-title">Video Animation</h5>
                        <p class="card-text">Combining creativity and aesthetics with ingenious ideas brings out the real awesomeness!</p>
                    </div>
                </div>
            </div>
            <div class="col-lg-4 col-md-4 col-sm-6 col-12 service-card">
                <div class="card mb-3">
                    <div class="card-img-tn">
                        <img class="card-img-top" src="landing/img/dm.png" alt="Digital Marketing">
                    </div>
                    <div class="card-body">
                        <h5 class="card-title">Digital Marketing</h5>
                        <p class="card-text">Having the right mind for impactful digital marketing is what your brand needs!</p>
                    </div>
                </div>
            </div>
            <div class="col-lg-4 col-md-4 col-sm-6 col-12 service-card">
                <div class="card mb-3">
                    <div class="card-img-tn">
                        <img class="card-img-top" src="landing/img/sm.png" alt="Enterprise Services">
                    </div>
                    <div class="card-body">
                        <h5 class="card-title">Enterprise Services</h5>
                        <p class="card-text">We aim to integrate multiple facets of your business by gleaning and interchanging data.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

<section class="outsource-tn" style="background-image:url(landing/img/outsource-g.png)">
    <div class="container">
        <div class="row">
            <div class="col-lg-12 gen-title text-white">
                <h4>Project Brief</h4>
                <h2>Outsource Now</h2>
            </div>
            <div class="step-form-tn">
                <form id="msform">
                    <ul id="progressbar">
                        <li class="active" data-id="project-details">Project Details</li>
                        <li data-id="contact-details">Contact Details</li>
                    </ul>
                    <div class="repeated-box-main">
                        <div id="project-details" class="repeated-box">
                            <div class="form-group col-lg-6 col-md-6 col-sm-12 col-12">
                                <input class="form-control" type="text" id="pname" name="pname" placeholder="Project Name *" />
                            </div>
                            <div class="form-group col-lg-6 col-md-6 col-sm-12 col-12">
                                <select class="form-control" id="ptype" id="ptype">
                                    <option value="0">Project Type...</option>
                                    <option value="Design Service">Design Service</option>
                                    <option value="Web Development">Web Development</option>
                                    <option value="App Development">App Development</option>
                                    <option value="Video Animation">Video Animation</option>
                                    <option value="Digital Marketing">Digital Marketing</option>
                                    <option value="Enterprise Services">Enterprise Services</option>
                                </select>
                            </div>
                            <div class="form-group col-lg-6 col-md-6 col-sm-12 col-12">
                                <input class="form-control" type="text" name="pdate" id="pdate" placeholder="Delivery Date & Time *" />
                            </div>
                            <div class="form-group col-lg-6 col-md-6 col-sm-12 col-12">
                                <input class="form-control" type="number" name="pbudget" id="pbudget" placeholder="Ext. Budget *" />
                            </div>
                            <div class="form-group col-lg-12 col-md-12 col-sm-12 col-12 file-tn">
                                <input class="form-control" type="file" name="pfile" id="pfile" placeholder="Choose File * (.jpg .png .pdf .word .zip etc...)" />
                                <label for="pfile"><img src="landing/img/up-file.png" alt="up-file" /></label>
                            </div>
                            <div class="form-group col-lg-12 col-md-12 col-sm-12 col-12">
                                <textarea class="form-control" name="pbrief" id="pbrief" placeholder="Project Brief ..."></textarea>
                            </div>
                            <div class="form-group col-lg-12 col-md-12 col-sm-12 col-12">
                                <input type="button" name="next" class="next action-button btn btn-primary" value="Next" />
                            </div>
                        </div>
                        <div id="contact-details" class="repeated-box">
                            <div class="form-group col-lg-6 col-md-6 col-sm-12 col-12">
                                <input class="form-control" type="text" name="outsource-name" id="outsource-name" placeholder="Name *" />
                            </div>
                            <div class="form-group col-lg-6 col-md-6 col-sm-12 col-12">
                                <input class="form-control" type="text" name="outsource-email" id="outsource-email" placeholder="Email *" />
                            </div>
                            <div class="form-group col-lg-12 col-md-12 col-sm-12 col-12">
                                <input class="form-control" type="text" name="outsource-phone" id="outsource-phone" placeholder="Phone *" />
                            </div>
                            <div class="form-group col-lg-12 col-md-12 col-sm-12 col-12">
                                <input class="form-control" type="text" name="outsource-company" id="outsource-company" placeholder="Company *" />
                            </div>
                            <div class="form-group col-lg-12 col-md-12 col-sm-12 col-12">
                                <textarea class="form-control" name="pmsg" id="pmsg" placeholder="Message ..."></textarea>
                            </div>
                            <div class="form-group col-lg-12 col-md-12 col-sm-12 col-12">
                                <input type="button" name="previous" class="previous action-button-previous btn btn-secondary" value="Previous" />
                                <input type="submit" name="submit" class="submit action-button btn btn-primary" value="Submit" />
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</section>

<section class="portfolio-tn">
    <div class="container">
        <div class="row">
            <div class="col-lg-12 gen-title">
                <h4>What we offer?</h4>
                <h2>Our Portfolio</h2>
            </div>
        </div>
        <div class="row card-portfolio">
            <div class="col-lg-4 col-md-4 col-sm-6 col-12 service-card">
                <div class="card">
                    <div class="img-port-tn">
                        <img class="card-img-top" src="./assets/images/home/port1.jpg" alt="Web Development">
                    </div>
                    <div class="card-body">
                        <div class="sm-img-card"><img src="landing/img/web.png" alt="web" /></div>
                        <h5 class="card-title">Web Development</h5>
                        <p class="card-text">We have helped prestigious brands by developing meticulous websites for their business!</p>
                    </div>
                </div>
            </div>
            <div class="col-lg-4 col-md-4 col-sm-6 col-12 service-card">
                <div class="card">
                    <div class="img-port-tn">
                        <img class="card-img-top" src="./assets/images/home/port2.jpg" alt="Digital Marketing">
                    </div>
                    <div class="card-body">
                        <div class="sm-img-card"><img src="landing/img/app.png" alt="app" /></div>
                        <h5 class="card-title">Digital Marketing</h5>
                        <p class="card-text">With latest marketing trends and tactics, we've helped reputed brands reach its potential customers!</p>
                    </div>
                </div>
            </div>
            <div class="col-lg-4 col-md-4 col-sm-6 col-12 service-card">
                <div class="card">
                    <div class="img-port-tn">
                        <img class="card-img-top" src="./assets/images/home/port3.jpg" alt="App Development">
                    </div>
                    <div class="card-body">
                        <div class="sm-img-card"><img src="landing/img/dm.png" alt="dm" /></div>
                        <h5 class="card-title">App Development</h5>
                        <p class="card-text">Our work in the app development industry has been proudly acclaimed!</p>
                    </div>
                </div>
            </div>
            <div class="col-lg-4 col-md-4 col-sm-6 col-12 service-card">
                <div class="card">
                    <div class="img-port-tn">
                        <img class="card-img-top" src="./assets/images/home/port4.jpg" alt="Brand And Creative">
                    </div>
                    <div class="card-body">
                        <div class="sm-img-card"><img src="landing/img/web.png" alt="web" /></div>
                        <h5 class="card-title">Brand And Creative</h5>
                        <p class="card-text">Our breakthrough creative strategy has empowered brands to capture the target market!</p>
                    </div>
                </div>
            </div>
            <div class="col-lg-4 col-md-4 col-sm-6 col-12 service-card">
                <div class="card">
                    <div class="img-port-tn">
                        <img class="card-img-top" src="./assets/images/home/port5.jpg" alt="Animations">
                    </div>
                    <div class="card-body">
                        <div class="sm-img-card"><img src="landing/img/app.png" alt="app" /></div>
                        <h5 class="card-title">Animations</h5>
                        <p class="card-text">Our creativity speaks for our client’s success. We showcase it through animation!</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

@endsection