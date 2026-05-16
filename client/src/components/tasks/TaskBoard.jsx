import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { 
  Plus, 
  Calendar, 
  Flag, 
  CheckCircle2, 
  Clock, 
  AlertTriangle 
} from 'lucide-react';

const TaskBoard = ({ tasks, onStatusChange, onTaskClick, onAddTask }) => {
  const columns = [
    { id: 'To Do', label: 'To Do', color: 'bg-slate-500' },
    { id: 'In Progress', label: 'In Progress', color: 'bg-amber-500' },
    { id: 'Done', label: 'Done', color: 'bg-emerald-500' },
  ];

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    if (destination.droppableId !== result.source.droppableId) {
      onStatusChange(draggableId, destination.droppableId);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-red-500 bg-red-500/10';
      case 'Medium': return 'text-amber-500 bg-amber-500/10';
      case 'Low': return 'text-blue-500 bg-blue-500/10';
      default: return 'text-slate-500 bg-slate-500/10';
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-[600px]">
        {columns.map((column) => (
          <div key={column.id} className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${column.color}`}></div>
                <h3 className="font-bold text-slate-700 dark:text-slate-300">
                  {column.label} 
                  <span className="ml-2 px-2 py-0.5 text-xs bg-slate-200 dark:bg-slate-800 rounded-full">
                    {tasks.filter(t => t.status === column.id).length}
                  </span>
                </h3>
              </div>
              <button 
                onClick={() => onAddTask(column.id)}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500"
              >
                <Plus size={18} />
              </button>
            </div>

            <Droppable droppableId={column.id}>
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`flex-1 rounded-2xl p-2 transition-colors ${
                    snapshot.isDraggingOver ? 'bg-slate-100/50 dark:bg-slate-800/30' : 'bg-transparent'
                  }`}
                >
                  {tasks
                    .filter(t => t.status === column.id)
                    .map((task, index) => (
                      <Draggable key={task._id} draggableId={task._id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => onTaskClick(task)}
                            className={`
                              p-4 mb-3 rounded-xl glass border border-slate-200/50 dark:border-slate-800/50 
                              cursor-pointer select-none transition-all hover:border-primary-500/50
                              ${snapshot.isDragging ? 'shadow-2xl ring-2 ring-primary-500/20' : 'shadow-sm'}
                            `}
                          >
                            <div className="flex justify-between items-start mb-3">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
                                {task.priority}
                              </span>
                              {task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Done' && (
                                <AlertTriangle size={14} className="text-red-500" />
                              )}
                            </div>
                            
                            <h4 className="font-semibold text-slate-900 dark:text-white mb-2 leading-snug">
                              {task.title}
                            </h4>
                            
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
                              {task.description}
                            </p>

                            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/50">
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                                <Calendar size={12} />
                                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                              </div>
                              <div 
                                className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center text-[10px] text-white font-bold"
                                title={task.assignedUser?.name || 'Unassigned'}
                              >
                                {task.assignedUser?.name?.charAt(0) || '?'}
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
};

export default TaskBoard;
