# 🧠 Backend Flow Documentation

### POST /api/addTask
- Handler: `addTaskHandler()` in `task.controller.ts`
- Auth: Requires JWT
- DB Action: Insert into Supabase `tasks` table
- Response: `{ success: true, taskId }`

---

### GET /api/getTasks
- Handler: `getTasksHandler()`
- Returns task list from Supabase
- Response: `{ success: true, tasks: [...] }`
