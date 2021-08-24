<?php

namespace App\Http\Controllers;

use App\Http\Requests\JobfairRequest;
use App\Models\Jobfair;
use App\Models\Schedule;
use App\Models\Task;
use Illuminate\Http\Request;

class JobfairController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    private function createMilestonesAndTasks($templateSchedule, $newSchedule, $jobfair)
    {
        foreach ($templateSchedule->templateTasks as $templateTask) {
            $numDates = $templateTask->milestone->is_week ? $templateTask->milestone->period * 7 : $templateTask->milestone->period;
            $startTime = date('Y-m-d', strtotime($jobfair->start_date.' + '.$numDates.'days'));
            $duration = 0;
            if ($templateTask->unit === 'students') {
                $duration = (float) $templateTask->effort * $jobfair->number_of_students;
            } else if ($templateTask->unit === 'none') {
                $duration = (float) $templateTask->effort;
            } else {
                $duration = (float) $templateTask->effort * $jobfair->number_of_companies;
            }

            $duration = $templateTask->is_day ? $duration : ceil($duration / 24);
            $input = $templateTask->toArray();
            $input['start_time'] = $startTime;
            $input['end_time'] = date('Y-m-d', strtotime($startTime.' + '.$duration.'days'));
            $input['schedule_id'] = $newSchedule->id;
            $input['status'] = '未着手';
            $input['template_task_id'] = $templateTask->id;
            $newTask = Task::create($input);
            $newTask->categories()->attach($templateTask->categories);
        }
    }

    public function index()
    {
        $jobfairs = Jobfair::join('users', 'jobfairs.jobfair_admin_id', '=', 'users.id')
            ->select('jobfairs.*', 'users.name as admin')
            ->orderBy('jobfairs.updated_at', 'DESC')
            ->get();

        return response()->json($jobfairs);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(JobfairRequest $request)
    {
        $jobfair = Jobfair::create($request->validated());
        $templateSchedule = Schedule::find($request->schedule_id);
        $newSchedule = Schedule::create($templateSchedule->toArray());
        $newSchedule->update(['jobfair_id' => $jobfair->id]);
        $newSchedule->milestones()->attach($templateSchedule->milestones);
        $this->createMilestonesAndTasks($templateSchedule, $newSchedule, $jobfair);

        return $jobfair;
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        return Jobfair::with('user:id,name')->find($id);
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
        $jobfair = Jobfair::find($id);
        $jobfair->update($request->all());
        $schedule = Schedule::where('jobfair_id', '=', $id)->first();
        $templateSchedule = Schedule::find($request->schedule_id);
        $schedule->update(['name' => $templateSchedule->name]);
        $schedule->milestones()->sync($templateSchedule->milestones);
        $schedule->tasks()->delete();
        $this->createMilestonesAndTasks($templateSchedule, $schedule, $jobfair);

        return response()->json('success');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        Jobfair::destroy($id);

        return response()->json(['message' => 'Deleted Successfully'], 200);
    }

    public function getMilestones($id)
    {
        $scheduleId = Jobfair::find($id)->schedule;
        $milestones = Jobfair::with([
            'schedule:id,jobfair_id',
            'schedule.milestones:id,name,period',
            'schedule.milestones.tasks' => function ($q) use ($scheduleId) {
                $q->select('name', 'status', 'milestone_id')->where('schedule_id', '=', $scheduleId->id);
            },
        ])->find($id, ['id']);

        return response()->json($milestones);
    }

    public function getTasks($id)
    {
        $tasks = Jobfair::with([
            'schedule.tasks' => function ($query) {
                $query->with('milestone:id,name', 'users:id,name', 'categories:id,category_name')

                    ->select(['tasks.id', 'tasks.name', 'tasks.start_time', 'tasks.end_time', 'tasks.milestone_id', 'tasks.status', 'tasks.schedule_id'])
                    ->orderBy('tasks.end_time', 'DESC');
            },
        ])->find($id, ['id']);

        return response()->json($tasks);
    }

    public function updatedTasks($id, Request $request)
    {
        $tasks = Jobfair::with(['schedule:id,jobfair_id', 'schedule.tasks' => function ($query) {
            $query->select(['tasks.name', 'tasks.updated_at', 'tasks.id', 'tasks.schedule_id', 'users.name as username'])
                ->join('users', 'users.id', '=', 'tasks.user_id')
                ->orderBy('tasks.updated_at', 'DESC')
                ->take(30);
        },
        ])->find($id, ['id']);

        return response()->json($tasks);
    }

    public function searchTask($id, Request $request)
    {
        $tasks = Jobfair::with([
            'schedule.tasks' => function ($q) use ($request) {
                $q->select('id', 'name', 'status', 'start_time', 'end_time', 'updated_at', 'schedule_id')->where('tasks.name', 'LIKE', '%'.$request->name.'%');
            },
        ])->find($id, ['id']);

        return response()->json($tasks);
    }

    public function checkNameExisted(Request $request)
    {
        return Jobfair::where('name', '=', $request->name)->get();
    }
}
