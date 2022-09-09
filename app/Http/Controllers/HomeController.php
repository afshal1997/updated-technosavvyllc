<?php

namespace App\Http\Controllers;

use App\Mail\Home;
use App\Mail\ModalForm;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class HomeController extends Controller
{
    public function homeForm(Request $request){
        Mail::to("kumarasnani997@gmail.com")->send(new Home($request));
        return response()->json(["status" => true ,"message" => "Successfull"]);
    }
    public function modalForm(Request $request){
        Mail::to("kumarasnani997@gmail.com")->send(new ModalForm($request));
        return response()->json(["status" => true ,"message" => "Successfull"]);
    }
}
