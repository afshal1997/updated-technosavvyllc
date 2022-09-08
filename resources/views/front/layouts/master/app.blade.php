<!doctype html>
<html lang="en">
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

    <title>{{ env('APP_NAME') }} | @yield('title')</title>
    
    @include('front.layouts.master.css')
</head>
<body class="page basepage basicpage {{ url('/') == url()->current() ? 'index fp-viewing-0' : '' }}">

    @include('front.layouts.master.header')
    @yield('content')
    @include('front.layouts.master.footer')

    @include('front.layouts.master.js')
</body>

</html>