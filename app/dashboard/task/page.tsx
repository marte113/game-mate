import TaskList from "./_components/TaskList";
import TaskPageContainer from "./_components/TaskPageContainer";
import TaskPageNavTab from "./_components/TaskPageNavTab";

export default function TaskPage() {
  return (
    <TaskPageContainer>
      <TaskPageNavTab />
      <TaskList />
    </TaskPageContainer>
  );
}
