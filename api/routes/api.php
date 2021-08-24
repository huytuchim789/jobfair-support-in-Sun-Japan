<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\InviteMemberController;
use App\Http\Controllers\JobfairController;
use App\Http\Controllers\MemberController;
use App\Http\Controllers\MemberDetailController;
use App\Http\Controllers\ResetPasswordController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\TemplateTaskController;
use App\Http\Controllers\TopPageTasksController;
use Illuminate\Support\Facades\Route;
/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
 */

Route::get('/web-init', WebInit::class);

Route::resource('/jobfair', 'JobfairController');

// add jf route start

// jobfair

Route::group(['prefix' => 'jobfair/{id}'], function () {
    Route::get('/milestones', 'JobfairController@getMilestones');
    Route::get('/tasks', 'JobfairController@getTasks');
    Route::get('/updated-tasks', 'JobfairController@updatedTasks');
    Route::get('/tasks/search', 'JobfairController@searchTask');
});
Route::get('/jf-schedule/{id}', 'ScheduleController@getScheduleb');
Route::post('/is-jf-existed', [JobfairController::class, 'checkNameExisted']);
Route::resource('/jobfair', 'JobfairController');

// schedule

Route::resource('/schedules', 'ScheduleController');
Route::get('jf-schedules/all-milestones', 'ScheduleController@getAllMilestones');
Route::get('jf-schedules/all-template-tasks', 'ScheduleController@getAllTemplateTasks');
Route::post('jf-schedules/checkScheduleNameExist', 'ScheduleController@checkScheduleNameExist');
Route::prefix('schedules/{id}')->group(function () {
    Route::get('/added-milestones', 'ScheduleController@getAddedMilestones');
    Route::get('/added-template-tasks', 'ScheduleController@getAddedTemplateTasks');
});
Route::get('/schedules/{id}/milestones', 'ScheduleController@getMilestones');
Route::get('/schedules/{id}/template-tasks', 'ScheduleController@getTemplateTasks');
Route::prefix('schedule')->group(function () {
    Route::get('/', 'ScheduleController@getAll');
    Route::get('/search', 'ScheduleController@search');
});

Route::get('/admins', 'AdminController@index');

//milestone

Route::resource('/milestone', MilestoneController::class);
Route::get('/milestone/search', 'MilestoneController@getSearch');
//milestone controller
Route::get('/milestones/{id}/list', 'MilestoneController@getInfoMilestones');
//member

Route::prefix('member')->group(function () {
    Route::get('/', 'MemberController@index');
    Route::get('/{id}', 'MemberController@showMember');
    Route::patch('/{id}/update', 'MemberController@update');
    Route::get('/{id}/tasks', 'MemberController@getTaskByID');
});

// login, logout

Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);
Route::post('/reset-password', [ResetPasswordController::class, 'handleRequest']);
Route::post('/update-password', [ResetPasswordController::class, 'updatePassword']);


Route::get('/jf-schedule/{id}', 'ScheduleController@getScheduleb');

//template-task
Route::resource('/template-tasks', 'TemplateTaskController');
Route::get('/categories-template-tasks', 'TemplateTaskController@getCategoriesTasks');
Route::get('/before-template-tasks/{id}', 'TemplateTaskController@getBeforeTasks');
Route::get('/after-template-tasks/{id}', 'TemplateTaskController@getAfterTasks');
Route::post('/is-template-task-existed', [TemplateTaskController::class, 'checkNameExisted']);

//category
Route::apiResource('/category', CategoryController::class);
Route::get('/category/find/{key}', [App\Http\Controllers\CategoryController::class, 'search']);
Route::get('/category/checkDuplicate/{name}', [App\Http\Controllers\CategoryController::class, 'checkDuplicate']);
Route::get('/category/checkUniqueEdit/{id}/{name}', [App\Http\Controllers\CategoryController::class, 'checkUniqueEdit']);

Route::prefix('categories')->group(function () {
    Route::get('/', 'CategoryController@getCatgories');
});

//profile

Route::put('/profile/{id}/update_info', 'ProfileController@updateUserInfo');
Route::post('/profile/{id}/update_password', 'ProfileController@updatePassword');
Route::post('/profile/{id}/update_avatar', 'ProfileController@updateAvatar');
Route::resource('/profile', ProfileController::class);
Route::get('/avatar/{id}', [App\Http\Controllers\ProfileController::class, 'avatar']);

Route::get('/check-unique-edit/{id}/{name}', [App\Http\Controllers\MilestoneController::class, 'checkUniqueEdit']);
Route::get('/check-unique-add/{name}', [App\Http\Controllers\MilestoneController::class, 'checkUniqueAdd']);

Route::post('/invite-member', [InviteMemberController::class, 'handleRequest']);

//member detail
Route::prefix('members')->group(function () {
    Route::get('/{id}', [MemberDetailController::class, 'memberDetail']);
    Route::delete('/{id}', [MemberDetailController::class, 'deleteMember']);
});

//Notification

Route::resource('/notification', NotificationController::class);
Route::get('/notification/delete/{id}', 'NotificationController@destroy');
Route::get('/show-unread/{id}', [App\Http\Controllers\NotificationController::class, 'showUnread']);
Route::post('/notification/update/{id}', 'NotificationController@update');
Route::post('/notification/update_all_read', 'NotificationController@updateAllRead');

//task
Route::resource('/task', 'TaskController');
Route::get('/before-tasks/{id}', 'TaskController@getBeforeTasks');
Route::get('/after-tasks/{id}', 'TaskController@getAfterTasks');


// top-page
Route::prefix('/top-page')->group(function () {
    Route::get('/tasks', [TopPageTasksController::class, 'tasks']);
    Route::get('/jobfairs', [JobfairController::class, 'index']);
    Route::get('/members', [MemberController::class, 'index']);
});

// task kanban
Route::get('/kanban/{id}', [TaskController::class, 'getTaskByJfId']);
Route::get('/kanban/{jfId}/{userId}', [TaskController::class, 'getJobfair']);
Route::put('/kanban/updateTask/{id}', [TaskController::class, 'updateTask']);
