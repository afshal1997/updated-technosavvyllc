<!doctype html>

@php

$base_url = $_SERVER['HTTP_HOST'];
$self = $_SERVER['PHP_SELF'];
$arr = explode("/", $self);
$with_ext = $arr['1'];
$arr2 = explode(".", $with_ext);
$port_page = $arr2['0'] ;

@endphp

<html lang="en" class="no-js">

<head>

    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">

    <title> @yield('title')</title>

    @include('front.layouts.portfolios.css')
</head>


<body class="portfolio-body portfolio-main">
    @include('front.layouts.portfolios.header')
    @yield('content')

    @include('front.layouts.portfolios.js')
</body>

</html>