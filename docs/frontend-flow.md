# 🎨 Frontend Flow Documentation

### Event: User submits task form
- Trigger: `handleSubmit()` from `AddTaskForm.tsx`
- API Call: `POST /api/addTask`
- State Update: Invalidate + refresh TanStack Query cache
- UI Result: Show success toast + clear form

---

### Event: Page load → fetch tasks
- Trigger: `useQuery('/api/getTasks')` in `TaskList.tsx`
- API Call: `GET /api/getTasks`
- UI Result: Show loading spinner → render tasks
