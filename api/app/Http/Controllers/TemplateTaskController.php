<?php

namespace App\Http\Controllers;

use App\Http\Requests\TemplateTaskRequest;
use App\Models\Category;
use App\Models\TemplateTask;
use Illuminate\Http\Request;

class TemplateTaskController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $templateTasks = TemplateTask::with(['categories:id,category_name', 'milestone:id,name'])
            ->orderBy('template_tasks.created_at', 'DESC')
            ->get(['template_tasks.id', 'template_tasks.name', 'template_tasks.milestone_id', 'template_tasks.created_at']);

        return response()->json($templateTasks);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(TemplateTaskRequest $request)
    {
        $newTemplateTask = TemplateTask::create([
            'name' => $request->name,
            'description_of_detail' => $request->description_of_detail,
            'milestone_id' => $request->milestone_id,
            'is_day' => $request->is_day,
            'unit' => $request->unit,
            'effort' => $request->effort,
        ]);
        $newTemplateTask->categories()->attach($request->category_id);
        if (!empty($request->beforeTasks)) {
            $newTemplateTask->beforeTasks()->attach($request->beforeTasks);
        }

        if (!empty($request->afterTasks)) {
            $newTemplateTask->afterTasks()->attach($request->afterTasks);
        }

        return $newTemplateTask;

        // $newTemplateTask = TemplateTask::create($request->validated());
        // $newTemplateTask->categories()->attach($request->category_id);
        // if (!empty($request->beforeTasks)) {
        //     $newTemplateTask->beforeTasks()->attach($request->beforeTasks);
        // }

        // if (!empty($request->afterTasks)) {
        //     $newTemplateTask->afterTasks()->attach($request->afterTasks);
        // }

        // return $newTemplateTask;
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $templateTask = TemplateTask::with(['categories:id,category_name', 'milestone:id,name'])->find($id);

        return response()->json($templateTask);
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
        $templateTask = TemplateTask::find($id);
        $check = false;
        $existTemp = TemplateTask::whereRaw('BINARY `name`= ?', [$request->name])->first();
        if (isset($existTemp)) {
            $check = true;
        }

        if ($templateTask->name === $request->name) {
            $check = false;
        }

        if ($check) {
            return response()->json(['message' => 'Edit Failed'], 422);
        }

        $templateTask->update($request->all());
        $templateTask->categories()->sync($request->category_id);
        if (!empty($request->beforeTasks)) {
            $templateTask->beforeTasks()->sync($request->beforeTasks);
        }

        if (!empty($request->afterTasks)) {
            $templateTask->afterTasks()->sync($request->afterTasks);
        }

        return response()->json(['message' => 'Edit Successfully'], 200);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $templateTasks = TemplateTask::find($id);
        $templateTasks->categories()->detach();
        $templateTasks->beforeTasks()->detach();
        $templateTasks->afterTasks()->detach();
        $templateTasks->delete();

        return response()->json(['message' => 'Delete Successfully'], 200);
    }

    public function getCategoriesTasks()
    {
        $categories = Category::has('templateTasks')->get();

        return response()->json($categories);
    }

    public function getBeforeTasks($id)
    {
        $beforeTasks = TemplateTask::with('beforeTasks:id,name')->find($id, ['id', 'name']);

        return response()->json($beforeTasks);
    }

    public function getAfterTasks($id)
    {
        $afterTasks = TemplateTask::with('afterTasks:id,name')->find($id, ['id', 'name']);

        return response()->json($afterTasks);
    }

    public function checkNameExisted(Request $request)
    {
        return TemplateTask::where('name', '=', $request->name)->get();
    }
}
