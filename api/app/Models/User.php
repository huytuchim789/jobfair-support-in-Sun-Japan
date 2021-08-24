<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    public $timestamps = false;
    protected $fillable = [
        'name',
        'email',
        'password',
        'chatwork_id',
        'avatar',
    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    public function schedules()
    {
        return $this->belongsToMany(Schedule::class, 'list_members');
    }

    public function tasks()
    {
        return $this->belongsToMany(Task::class, 'assignments');
    }

    public function categories()
    {
        return $this->morphToMany(Category::class, 'categoriable');
    }
}
