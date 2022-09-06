<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::view('/', 'front.home')->name('home');
Route::view('about', 'front.about')->name('about');
Route::view('app-development-portfolio', 'front.app-development-portfolio')->name('app-development-portfolio');
Route::view('brand-creative-portfolio', 'front.brand-creative-portfolio')->name('brand-creative-portfolio');
Route::view('creative-services', 'front.creative-services')->name('creative-services');
Route::view('content-writing', 'front.content-writing')->name('content-writing');
Route::view('cyber-security', 'front.cyber-security')->name('cyber-security');
Route::view('developmentsolutions', 'front.developmentsolutions')->name('developmentsolutions');
Route::view('digital-marketing-portfolio', 'front.digital-marketing-portfolio')->name('digital-marketing-portfolio');
Route::view('lead-generation', 'front.lead-generation')->name('lead-generation');
Route::view('video-animation', 'front.video-animation')->name('video-animation');
Route::view('social-media', 'front.social-media-marketing')->name('social-media');
Route::view('seo-services', 'front.seo-services')->name('seo-services');
Route::view('digital-marketing', 'front.digital-marketing')->name('digital-marketing');
Route::view('digital', 'front.digital')->name('digital');
Route::view('enterprise-solutions', 'front.enterprisesolutions')->name('enterprise-solutions');
Route::view('portfolios', 'front.portfolios')->name('portfolios');
Route::view('privacy-policy', 'front.privacy-policy')->name('privacy-policy');
Route::view('refund-policy', 'front.refund-policy')->name('refund-policy');
Route::view('thankyou', 'front.thankyou')->name('thankyou');
Route::view('web-development-portfolio', 'front.web-development-portfolio')->name('web-development-portfolio');
Route::view('thankyou', 'front.thankyou')->name('thankyou');
