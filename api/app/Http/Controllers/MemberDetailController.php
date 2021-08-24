<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Support\Facades\DB;

class MemberDetailController extends Controller
{
    public function checkCategoryExist($categories, $taskCategory)
    {
        foreach ($categories as $category) {
            if ($category->category_name === $taskCategory->category_name) {
                return true;
            }
        }

        return false;
    }

    public function memberDetail($id)
    {
        $user = User::findOrFail($id);
        $jobfairs = [];
        $categories = [];
        foreach ($user->schedules as $schedule) {
            array_push($jobfairs, $schedule->jobfair);
        }

        $user->jobfairs = $jobfairs;
        foreach ($user->tasks as $task) {
            $taskCategories = $task->categories;
            if (!$taskCategories) {
                continue;
            }

            foreach ($taskCategories as $taskCategory) {
                if (!$this->checkCategoryExist($categories, $taskCategory)) {
                    array_push($categories, $taskCategory);
                }
            }
        }

        $user->categories = $categories;

        return response()->json($user);
    }

    public function deleteMember($id)
    {
        DB::table('list_members')->where('user_id', $id)->delete();
        DB::table('tasks')->where('user_id', $id)->update(['user_id' => null]);
        DB::table('assignments')->where('user_id', $id)->delete();
        DB::table('jobfairs')->where('jobfair_admin_id', $id)->delete();
        User::findOrFail($id)->delete();
    }
}
