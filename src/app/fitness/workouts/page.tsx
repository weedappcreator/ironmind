import FitnessShell from "../_shell";
import WorkoutList from "./_list";

export default function WorkoutsPage() {
  return (
    <FitnessShell>
      <div className="p-6 lg:p-8 max-w-4xl">
        <WorkoutList />
      </div>
    </FitnessShell>
  );
}