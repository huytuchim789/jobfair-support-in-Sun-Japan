<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Jobfair extends Model
{
    use HasFactory;
    protected $fillable = [
        'name',
        'start_date',
        'number_of_students',
        'number_of_companies',
        'jobfair_admin_id',
    ];

    public function schedule()
    {
        return $this->hasOne(Schedule::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'jobfair_admin_id');
    }
}
