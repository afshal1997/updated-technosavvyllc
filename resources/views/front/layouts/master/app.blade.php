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
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="Content-Language" content="en" />
    <meta http-equiv="Expires" content="0" />
    <meta name="description" content="" />
    <meta name="keywords" content="Business Consulting Solutions, IT Services, digital transformation consulting" />
    <meta name="author" Content="Techno Savvy LLC" />
    <meta name="template" content="content-page" />

    <title> @yield('title')</title>
    
    @include('front.layouts.master.css')
</head>
@if(request()->route()->getName() == 'home')
<body class="page basepage basicpage <?php echo $page ?>">

@else
<body class="page basepage basicpage">
@endif

    @include('front.layouts.master.header')
    @yield('content')
    @include('front.layouts.master.footer')

    @include('front.layouts.master.js')
</body>

</html>