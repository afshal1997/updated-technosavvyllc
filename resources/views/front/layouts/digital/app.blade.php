<!doctype html>
<html lang="en">

@php

$base_url = $_SERVER['HTTP_HOST'];
$self = $_SERVER['PHP_SELF'];
$arr = explode("/", $self);
$with_ext = $arr['1'];
$arr2 = explode(".", $with_ext);
$page = $arr2['0'];
$port_page = $arr2['0'];

@endphp

<head>
    <meta charset="UTF-8">
    <meta name="keywords" content="Digital Marketing, Web Development, App Development, Brand And Creative, Animations, Social Media">
    <meta name="description" content="Dignify & digitalize the countenance of your inestimable business by perpetuating its digital trail, engraving its achievements, and augmenting your ROI by choosing the comprehensive Government affiliated solution.">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="noindex, nofollow">
    <meta name="author" Content="Techno Savvy Limited" />
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta http-equiv="Content-Language" content="en" />
    <meta http-equiv="Expires" content="0" />
    <meta property="og:url" content="index.html">
    <meta name="template" content="content-page" />

    <title> @yield('title')</title>

    @include('front.layouts.digital.css')
</head>


<body class="page basepage basicpage <?php echo $page ?>">
    @include('front.layouts.digital.header')
    @yield('content')
    @include('front.layouts.digital.footer')

    @include('front.layouts.digital.js')
</body>

</html>