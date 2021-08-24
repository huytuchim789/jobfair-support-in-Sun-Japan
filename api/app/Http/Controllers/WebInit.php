<?php

namespace App\Http\Controllers;

use App\Enums\Role;
use Illuminate\Http\Request;

class WebInit extends Controller
{
    /**
     * Handle the incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function __invoke(Request $request)
    {
        return [
            'auth' => $this->getAuth($request),
        ];
    }

    protected function getAuth(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return null;
        }

        $role = $user->role;
        $roleStr = '';
        switch ($role) {
            case 1:
                $roleStr = Role::SUPER_ADMIN;

                break;
            case 2:
                $roleStr = Role::ADMIN;

                break;
            case 3:
                $roleStr = Role::MEMBER;

                break;
            default:
                break;
        }

        return [
            'user' => [
                'id'          => $user->id,
                'name'        => $user->name,
                'email'       => $user->email,
                'avatar'      => $user->avatar,
                'role'        => $roleStr,
                'chatwork_id' => $user->chatwork_id,
                'created_at'  => $user->created_at,
                'updated_at'  => $user->updated_at,
            ],
        ];
    }
}
