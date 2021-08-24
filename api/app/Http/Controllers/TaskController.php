<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class TaskController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index($id)
    {
    }

    public function getTaskByJfId($id)
    {
        return DB::table('jobfairs')
            ->join('schedules', 'jobfairs.id', '=', 'schedules.jobfair_id')
            ->join('tasks', 'schedules.id', '=', 'tasks.schedule_id')
            ->join('assignments', 'assignments.task_id', 'tasks.id')
            ->join('users', 'assignments.user_id', '=', 'users.id')
            ->select('jobfairs.name as jobfairName', 'users.id as userId', 'users.name as userName', 'users.avatar', 'tasks.*', 'tasks.name as taskName')
            ->where('jobfairs.id', '=', $id)
            ->get();
    }

    public function getJobfair($jfId, $userId)
    {
        return DB::table('jobfairs')
            ->where('jobfairs.id', '=', $jfId)
            ->where('jobfairs.jobfair_admin_id', '=', $userId)
            ->get();
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
    }

    public function updateTask(Request $request, $id)
    {
        $task = Task::find($id);
        $status = [
            '未着手',
            '進行中',
            '完了',
            '中断',
            '未完了',
        ];
        $request->validate([
            'name' => [
                Rule::unique('tasks')->whereNot('id', $id)->where('schedule_id', $task->schedule_id),
            ],
            'start_time' => 'date',
            'end_time' => 'date',
            'status' => [
                Rule::in($status),
            ],
            'remind_member' => 'boolean',
            'milestone_id' => 'exists:milestones,id',
            'schedule_id' => 'exists:schedules,id',
            'user_id' => 'exists:users,id',
            'memo' => 'string|nullable',
            'description_of_detail' => 'string|nullable',
            'template_task_id' => 'exists:template_tasks,id',
        ]);
        $task->update($request->all());

        return $task;
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $task = Task::with([
            'milestone:id,name',
            'categories:id,category_name',
            'users:id,name',
            'schedule.jobfair:id,name',
            'templateTask:id,effort,is_day,unit',
        ])->find($id);

        return response()->json($task);
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
    public function update(Request $request, $id)
    {
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $task = Task::find($id);
        $task->categories()->detach();
        $task->beforeTasks()->detach();
        $task->afterTasks()->detach();
        $task->delete();

        return response()->json(['message' => 'Delete Successfully'], 200);
    }

    public function getBeforeTasks($id)
    {
        $beforeTasks = Task::with('beforeTasks:id,name')->find($id, ['id', 'name']);

        return response()->json($beforeTasks);
    }

    public function getAfterTasks($id)
    {
        $afterTasks = Task::with('afterTasks:id,name')->find($id, ['id', 'name']);

        return response()->json($afterTasks);
    }
}
