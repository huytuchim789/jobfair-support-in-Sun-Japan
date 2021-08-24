<?php

namespace App\Http\Controllers;

use App\Models\Milestone;
use App\Models\Schedule;
use App\Models\TemplateTask;
use Illuminate\Http\Request;

class ScheduleController extends Controller
{
    /**
     * Display list schedule.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        // return Schedule::whereNull('jobfair_id')->get();
        return Schedule::all();
    }

    public function getAll()
    {
        return Schedule::all();
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
        $schedule = new Schedule();
        $schedule->name = $request->schedule['name'];
        $schedule->save();
        $schedule->milestones()->attach($request->addedMilestones);
        $schedule->templateTasks()->attach($request->addedTemplateTasks);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        return Schedule::findOrFail($id);
    }

    public function getAllMilestones()
    {
        return Milestone::all();
    }

    public function getAllTemplateTasks()
    {
        return TemplateTask::all();
    }

    public function getAddedMilestones($id)
    {
        return Schedule::findOrFail($id)->milestones;
    }

    public function getAddedTemplateTasks($id)
    {
        return Schedule::findOrFail($id)->templateTasks;
    }

    public function checkScheduleNameExist(Request $request)
    {
        return count(Schedule::where('name', $request->name)->get()) !== 0 ? 'exist' : 'not exist';
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
        $schedule = Schedule::findOrFail($id);
        $schedule->name = $request->schedule['name'];
        $schedule->save();
        $addedMilestones = $request->addedMilestones;
        $addedTemplateTasks = $request->addedTemplateTasks;
        $schedule->templateTasks()->detach();
        $schedule->templateTasks()->attach($addedTemplateTasks);
        $schedule->templateTasks->each(function ($templateTask) use ($schedule, $addedMilestones) {
            if (!in_array($templateTask->milestone_id, $addedMilestones)) {
                $schedule->templateTasks()->detach($templateTask->id);
            }
        });
        $schedule->milestones()->detach();
        $schedule->milestones()->attach($addedMilestones);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
    }

    public function getMilestones($id)
    {
        return Schedule::with(['milestones:id,name'])->find($id, ['id']);
    }

    public function getTemplateTasks($id)
    {
        return Schedule::with('templateTasks:id,name')->find($id, ['id']);
    }

    public function search(Request $request)
    {
        return Schedule::where('name', 'like', '%'.$request->input('name').'%')->get();
    }

    public function getScheduleb($id)
    {
        $schedule = Schedule::where('jobfair_id', '=', $id)->get();

        return response()->json([
            'data' => $schedule,
        ]);
    }
}
