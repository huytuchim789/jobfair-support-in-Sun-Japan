<?php

namespace App\Http\Controllers;

use App\Models\Milestone;
use App\Models\Schedule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class MilestoneController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $data = DB::table('milestones')
            ->orderBy('id', 'asc')
            ->get();

        return response()->json($data);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $rules = [
            'name' => 'required|regex:/^[^\s]*$/|unique:milestones,name',
            'period' => 'required|numeric|min:0|max:3000',
            'is_week' => 'required|numeric|min:0|max:1',
        ];
        $validator = Validator::make($request->all(), $rules);
        $validator->validate();

        return Milestone::create($request->all());
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $rules = [
            'id' => 'exists:App\Models\Milestone,id',
        ];
        $validator = Validator::make([
            'id' => $id,
        ], $rules);
        $validator->validate();

        return Milestone::find($id);
    }

    //use to get milestone with tasks
    public function getInfoMilestones($id)
    {
        $schedule = Schedule::find($id);

        return $schedule->milestones->map(function ($milestone) {
            $templateTasksOfMilestone = $milestone->templateTasks;
            $milestone['tasks'] = $templateTasksOfMilestone;
            $templateTasksOfMilestone->map(function ($task) {
                return $task->categories;
            });

            return $milestone;
        });
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
        $rules = [
            'name' => 'regex:/^[^\s]*$/',
            'name' => [
                Rule::unique('milestones')->whereNot('id', $id),
            ],
            'period' => 'numeric|min:0|max:3000',
            'is_week' => 'numeric|min:0|max:1',
        ];
        $validator = Validator::make($request->all(), $rules);
        $validator->validate();

        return Milestone::find($id)->update($request->all());
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        Milestone::destroy($id);

        return response()->json([
            'success' => 'Record has been deleted successfully!',
        ]);
    }

    public function checkUniqueEdit($id, $name)
    {
        return Milestone::where('id', '<>', $id)->where('name', '=', $name)->get();
    }

    public function checkUniqueAdd($name)
    {
        return Milestone::where('name', '=', $name)->get();
    }

    public function getSearch(Request $request)
    {
        $s = $request->input('s');
        if ($request->input('s')) {
            $data = DB::table('milestones')
                ->where('name', 'LIKE', '%' + $s + '%')
                ->orderBy('id', 'asc')
                ->get();

            return response()->json($data);
        }

        $data = DB::table('milestones')
            ->orderBy('id', 'asc')
            ->get();

        return response()->json($data);
    }
}
