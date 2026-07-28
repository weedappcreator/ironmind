import FitnessShell from "../_shell";
import RoutineBuilder from "./_builder";

export default function RoutinesPage() {
  return (
    <FitnessShell>
      <div className="p-6 lg:p-8 max-w-4xl">
        <RoutineBuilder />
      </div>
    </FitnessShell>
  );
}