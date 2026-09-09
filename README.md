# My Virtual Ledger — To-Do List Application

My Virtual Ledger is a simple To-Do List web application built using HTML, CSS, and JavaScript. It allows users to create, view, update, complete, and delete tasks while saving task data in the browser using Local Storage.

The interface is designed with a simple ledger and journal-inspired layout.

## Features

### Create Tasks
- Add a new task through the task form.
- New tasks appear immediately without refreshing the page.
- The input field clears after a task is added.
- Empty tasks are prevented through JavaScript validation.
- An error message is displayed when the user attempts to submit an empty task.

### View Tasks
- Tasks are dynamically displayed from the `tasks` array.
- Each task contains its task name, completion control, edit button, and delete button.
- An empty state is displayed when there are no tasks.
- Open and completed task counters update automatically.

### Update Tasks
- Tasks can be marked as done or returned to an open state.
- Completed tasks are visually distinguished using a strikethrough.
- Existing task text can be edited using the Edit button.
- Updated task information is saved to Local Storage.

### Delete Tasks
- Individual tasks can be deleted immediately.
- The Delete All button removes all tasks.
- Delete All uses a simulated 2-second loading state using `setTimeout`, a Promise, and `async/await`.

### Local Storage
- Tasks are stored in the browser using Local Storage.
- The storage key used by the application is `ledger.tasks.v1`.
- Tasks remain available after refreshing or reopening the browser on the same device and browser profile.

### State Management
- The `tasks` array serves as the application's main source of truth.
- Task operations update the `tasks` array first.
- Changes are saved to Local Storage using `saveTasks()`.
- `renderTasks()` updates the displayed task list and counters based on the current state.

## Task Data Structure

Each task is represented as a JavaScript object:

```javascript
{
  id: string,
  text: string,
  done: boolean,
  createdAt: number
}