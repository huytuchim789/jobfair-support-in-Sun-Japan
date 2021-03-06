<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class InviteMemberController extends Controller
{
    public function handleRequest(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);
        $user = User::whereEmail($request->email)->first();
        if (!$user) {
            DB::table('users')->insert([
                'email'       => $request->email,
                'name'        => 'User'.random_int(10000, 99999),
                'password'    => Hash::make('12345678'),
                'role'        => 3,
                'chatwork_id' => null,
                'avatar'      => 'image/avatars/default.jpg',
                'created_at'  => now(),
                'updated_at'  => now(),
            ]);
            DB::table('password_resets')->insert([
                'email'      => $request->email,
                'token'      => Str::random(60),
                'created_at' => now(),
            ]);
            $token = DB::table('password_resets')->where('email', $request->email)->first()->token;
            $data = ['email' => $request->email, 'token' => $token];

            $this->sendEmail($data);

            return response()->json(['message' => 'Email sent', 'token' => $token], 200);
        }

        return response()->json(['message' => 'Email already exists in the system'], 400);
    }

    private function sendEmail($data)
    {
        /**
         * Send email with html view
         *
         * @param resource/views/email/reset 'email.welcome': html view of email body
         * @param $data : variables which used in view
         * @return \Illuminate\Http\Response
         */
        Mail::send('email.welcome', $data, function ($message) use ($data) {
            $message->to($data['email']);
            $message->subject('Welcome to Jobfair Support');
        });
    }
}
