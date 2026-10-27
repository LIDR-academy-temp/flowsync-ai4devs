import { http, HttpResponse } from 'msw'

import type { Task, TaskDetail, User } from '../src/lib/types'

// La API a la que habla `src/lib/api.ts` (VITE_API_URL, por defecto este).
const API = 'http://localhost:3333/api/v1'

// Datos fijos: ni red ni hora actual. Las fechas son cadenas escritas a mano.
export const lucia: User = {
  id: 1,
  fullName: 'Lucía Fernández',
  email: 'lucia.fernandez@example.com',
  initials: 'LF',
  createdAt: '2026-07-01T09:00:00.000Z',
  updatedAt: '2026-07-01T09:00:00.000Z',
}

export const tasks: Task[] = [
  {
    id: 1,
    title: 'Revisar los textos de error del formulario de registro',
    status: 'pending',
    assignee: { id: 1, fullName: 'Lucía Fernández', initials: 'LF' },
    createdAt: '2026-10-01T09:00:00.000Z',
    updatedAt: '2026-10-01T09:00:00.000Z',
  },
  {
    id: 2,
    title: 'Preparar la demo del jueves',
    status: 'in_progress',
    assignee: { id: 2, fullName: 'Mateo Ortega', initials: 'MO' },
    createdAt: '2026-10-02T09:00:00.000Z',
    updatedAt: '2026-10-02T09:00:00.000Z',
  },
  {
    id: 3,
    title: 'Documentar el proceso de despliegue',
    status: 'done',
    assignee: { id: 3, fullName: null, initials: 'CI' },
    createdAt: '2026-10-03T09:00:00.000Z',
    updatedAt: '2026-10-03T09:00:00.000Z',
  },
]

export const overdueTask: TaskDetail = {
  ...tasks[1],
  dueDate: '2026-10-20',
  isOverdue: true,
}

// Solo los endpoints que pisan las historias, sin comodines.
export const mswHandlers = [
  http.get(`${API}/account/profile`, () => HttpResponse.json({ data: lucia })),
  http.get(`${API}/tasks`, ({ request }) => {
    const status = new URL(request.url).searchParams.get('status')
    const visible = status
      ? tasks.filter((task) => task.status === status)
      : tasks.filter((task) => task.status !== 'done')
    return HttpResponse.json({ data: visible })
  }),
  http.get(`${API}/tasks/:id`, ({ params }) =>
    Number(params.id) === overdueTask.id
      ? HttpResponse.json({ data: overdueTask })
      : HttpResponse.json(
          { errors: [{ message: 'Not found' }] },
          { status: 404 },
        ),
  ),
  http.patch(`${API}/tasks/:id/status`, async ({ params, request }) => {
    const { status } = (await request.json()) as { status: Task['status'] }
    const task = tasks.find((item) => item.id === Number(params.id))
    return HttpResponse.json({ data: { ...task, status } })
  }),
]
