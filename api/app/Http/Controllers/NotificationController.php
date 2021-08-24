<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\Task;
use App\Models\User;

class NotificationController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
    }

    /**
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $i = 0;
        $nameUser = [];
        $nameTask = [];

         // return Notification::where('notifiable_id','=',$user_id)->get();
         $noti = Notification::orderBy('created_at', 'ASC')->where('notifiable_id', '=', $id)->get();
        if (count($noti) === 0) {
            return 0;
        }

           // $user = Notification::orderBy('created_at', 'ASC')->select('user_id')->where('notifiable_id','=',$user_id)->get();
        foreach ($noti as $notification) {
         // $nameUser[] = User::select('name')->where('id','=',$notification->user_id)->get();
            //  $nameUser[] =User::select('name')->where('id','=',$notification->user_id)->get();
            $nameUser[$i] = User::select('name')->find($notification->user_id);
            $nameTask[$i] = Task::select('name')->find($notification->subjectable_id);
            $i++;
        }

        // return $user->notifications;
        return response()->json(['userName' => $nameUser, 'noti' => $noti, 'taskName' => $nameTask]);
        //  return $user;
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update($id)
    {
        $date = Notification::find($id);
        $date->read_at = \Carbon\Carbon::now();
        $date->save();
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        // return Notification::where('id', $id)->get();
        // return response()->json(['message' => 'Successed']);
        $noti = Notification::find($id);
        if (!$noti) {
            return response()->json();
        }

        $noti->delete();

        return response()->json(null);
        // return $noti;
    }

    public function showUnread($id)
    {
        // return Notification::where('user_id','=',$user_id)->where('read_at','=',null)->with('user:id,name,avatar')->get();
        // $user = User::find($user_id);

        // return $user->unreadnotifications;
        $i = 0;
        $nameUser = [];
        $nameTask = [];
        $noti = Notification::orderBy('created_at', 'ASC')->where('notifiable_id', '=', $id)->where('read_at', '=', null)->get();
        if (count($noti) === 0) {
            return 0;
        }

        foreach ($noti as $notification) {
            $nameUser[$i] = User::select('name')->find($notification->user_id);
            $nameTask[$i] = Task::select('name')->find($notification->subjectable_id);
        }

        return response()->json(['userName' => $nameUser, 'noti' => $noti, 'taskName' => $nameTask]);
    }

    public function updateAllRead()
    {
        $noti = Notification::orderBy('created_at', 'ASC')->where('read_at', '=', null)->get();
        if (count($noti) === 0) {
            return 0;
        }

        foreach ($noti as $n) {
            $n->read_at = \Carbon\Carbon::now();
            $n->save();
        }
    }
}
